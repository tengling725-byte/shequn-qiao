# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

# 查看Name2Id前10条
cur = conn.execute("SELECT * FROM Name2Id LIMIT 10")
print("Name2Id前10条:")
for r in cur.fetchall():
    print(f"  {r}")

# 查看Msg表对应的user_name
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 5")
print("\n前5个Msg_表:")
for r in cur.fetchall():
    print(f"  {r[0]}")

conn.close()