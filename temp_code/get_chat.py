# -*- coding: utf-8 -*-
import sqlite3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 查找bangbingyang的userid
contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)
cur = conn.execute("SELECT username, remark, nick_name FROM Contact WHERE username='bangbingyang' OR alias='bangbingyang'")
row = cur.fetchone()
if row:
    print(f"用户名: {row[0]}")
    print(f"备注: {row[1]}")
    print(f"昵称: {row[2]}")

    # 计算Chat_表名 (MD5)
    import hashlib
    chat_id = "Chat_" + hashlib.md5(row[0].encode()).hexdigest()
    print(f"消息表名: {chat_id}")
    chat_table_name = chat_id
conn.close()

# 在message数据库中查找该表
print("\n在message数据库中查找...")
msg_found = False
for i in range(11):
    msg_path = rf"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_{i}解密.db"
    try:
        conn = sqlite3.connect(msg_path)
        cur = conn.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{chat_table_name}'")
        if cur.fetchone():
            print(f"找到表: message_{i}解密.db")
            msg_found = True

            # 查询消息
            cur = conn.execute(f"SELECT local_id, create_time, message_content FROM {chat_table_name} ORDER BY create_time LIMIT 20")
            print(f"\n消息内容:")
            for r in cur.fetchall():
                print(f"local_id: {r[0]}, time: {r[1]}")
                print(f"  content: {r[2]}")
            conn.close()
            break
        conn.close()
    except Exception as e:
        pass

if not msg_found:
    print("未找到消息表")