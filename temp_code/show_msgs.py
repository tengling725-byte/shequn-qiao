# -*- coding: utf-8 -*-
import sqlite3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

db_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_0解密.db"
conn = sqlite3.connect(db_path)

# 获取一个Msg表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
table_name = cur.fetchone()[0]

print(f"表: {table_name}")
print("-" * 60)

# 获取表结构
cur = conn.execute(f"PRAGMA table_info({table_name})")
print("字段:", [r[1] for r in cur.fetchall()])
print("-" * 60)

# 查询前5条记录
cur = conn.execute(f"SELECT local_id, local_type, create_time, real_sender_id, message_content FROM {table_name} LIMIT 5")
for row in cur.fetchall():
    print(f"local_id: {row[0]}, type: {row[1]}, time: {row[2]}, sender: {row[3]}")
    msg = row[4] if row[4] else ''
    if isinstance(msg, bytes):
        msg = msg[:100]
    else:
        msg = str(msg)[:100]
    print(f"  content: {msg}")
    print()

conn.close()