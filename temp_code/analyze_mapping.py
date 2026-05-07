# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 分析对应关系
print("=== 数据分析 ===")
print("\n已有对应关系:")
print("  id=288, username=wxid_6fe4kselg0b612, encrypt_username包含v3_020b..., 发送者=8283")
print("  id=7081, username=wenpeinan, 发送者=1498")
print("  id=15049, username=25701620491@chatroom(群聊), 发送者=156")

print("\n分析:")
print("  288: hex(288) = 0x120")
print("  8283: hex(8283) = 0x205B")
print("  7081: hex(7081) = 0x1BA1")
print("  1498: hex(1498) = 0x5D8")
print("  15049: hex(15049) = 0x3AC9")
print("  156: hex(156) = 0x9C")

print("\n检查message表source字段...")
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

# 检查一个Msg表的source字段内容
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
table_name = cur.fetchone()[0]

cur = conn.execute(f"SELECT local_id, source FROM {table_name} WHERE source IS NOT NULL LIMIT 5")
print(f"\n{table_name} 的 source 字段:")
for r in cur.fetchall():
    print(f"  local_id={r[0]}, source={r[1]}")
    if r[1]:
        s = r[1]
        if isinstance(s, bytes):
            print(f"    bytes长度: {len(s)}, 前20字节: {s[:20].hex()}")

conn.close()

# 检查contact表的encrypt_username
print("\n检查contact表的encrypt_username...")
contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)

# 获取288的记录
cur = conn.execute("SELECT id, username, encrypt_username FROM Contact WHERE id=288")
row = cur.fetchone()
if row:
    print(f"\nid=288:")
    print(f"  username: {row[1]}")
    print(f"  encrypt_username: {row[2]}")

# 获取7081的记录
cur = conn.execute("SELECT id, username, encrypt_username FROM Contact WHERE id=7081")
row = cur.fetchone()
if row:
    print(f"\nid=7081:")
    print(f"  username: {row[1]}")
    print(f"  encrypt_username: {row[2]}")

# 获取15049的记录
cur = conn.execute("SELECT id, username, encrypt_username FROM Contact WHERE id=15049")
row = cur.fetchone()
if row:
    print(f"\nid=15049:")
    print(f"  username: {row[1]}")
    print(f"  encrypt_username: {row[2]}")

conn.close()