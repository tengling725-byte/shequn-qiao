# -*- coding: utf-8 -*-
import hashlib, struct, os, sys, json
import hmac as hmac_mod
from Crypto.Cipher import AES
import functools
print = functools.partial(print, flush=True)

PAGE_SZ = 4096
KEY_SZ = 32
SALT_SZ = 16
IV_SZ = 16
HMAC_SZ = 64
RESERVE_SZ = 80
SQLITE_HDR = b'SQLite format 3\x00'

KEYS_FILE = r"C:\Workspace\opencode\temp_code\wechat-decrypt\all_keys.json"
INPUT_DIR = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533"
OUTPUT_DIR = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

def derive_mac_key(enc_key, salt):
    mac_salt = bytes(b ^ 0x3a for b in salt)
    return hashlib.pbkdf2_hmac("sha512", enc_key, mac_salt, 2, dklen=KEY_SZ)

def decrypt_page(enc_key, page_data, pgno):
    iv = page_data[PAGE_SZ - RESERVE_SZ : PAGE_SZ - RESERVE_SZ + IV_SZ]
    if pgno == 1:
        encrypted = page_data[SALT_SZ : PAGE_SZ - RESERVE_SZ]
        cipher = AES.new(enc_key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted)
        page = bytearray(SQLITE_HDR + decrypted + b'\x00' * RESERVE_SZ)
        return bytes(page)
    else:
        encrypted = page_data[:PAGE_SZ - RESERVE_SZ]
        cipher = AES.new(enc_key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted)
        return decrypted + b'\x00' * RESERVE_SZ

def decrypt_database(db_path, out_path, enc_key):
    file_size = os.path.getsize(db_path)
    total_pages = file_size // PAGE_SZ
    if file_size % PAGE_SZ != 0:
        total_pages += 1

    with open(db_path, 'rb') as fin:
        page1 = fin.read(PAGE_SZ)
    if len(page1) < PAGE_SZ:
        return False

    salt = page1[:SALT_SZ]
    mac_key = derive_mac_key(enc_key, salt)
    p1_hmac_data = page1[SALT_SZ : PAGE_SZ - RESERVE_SZ + IV_SZ]
    p1_stored_hmac = page1[PAGE_SZ - HMAC_SZ : PAGE_SZ]
    hm = hmac_mod.new(mac_key, p1_hmac_data, hashlib.sha512)
    hm.update(struct.pack('<I', 1))
    if hm.digest() != p1_stored_hmac:
        print(f"  [ERROR] HMAC验证失败!")
        return False

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(db_path, 'rb') as fin, open(out_path, 'wb') as fout:
        for pgno in range(1, total_pages + 1):
            page = fin.read(PAGE_SZ)
            if len(page) < PAGE_SZ:
                if len(page) > 0:
                    page = page + b'\x00' * (PAGE_SZ - len(page))
                else:
                    break
            decrypted = decrypt_page(enc_key, page, pgno)
            fout.write(decrypted)

    return True

def main():
    with open(KEYS_FILE, encoding="utf-8") as f:
        keys = json.load(f)

    for i in range(11):
        db_name = f"message_{i}.db"
        key_name = f"message\\{db_name}"
        if key_name not in keys:
            print(f"跳过: {db_name} (无密钥)")
            continue

        key_info = keys[key_name]
        enc_key = bytes.fromhex(key_info["enc_key"])
        in_path = os.path.join(INPUT_DIR, db_name)
        out_path = os.path.join(OUTPUT_DIR, f"{db_name.replace('.db', '')}解密.db")

        if not os.path.exists(in_path):
            print(f"跳过: {in_path} 不存在")
            continue

        sz = os.path.getsize(in_path)
        print(f"解密: {db_name} ({sz/1024/1024:.1f}MB) ...", end=" ")
        ok = decrypt_database(in_path, out_path, enc_key)
        if ok:
            print("OK!")
        else:
            print("失败!")

    print("\n完成!")

if __name__ == '__main__':
    main()