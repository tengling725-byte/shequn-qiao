# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

msg_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_0解密.db"
conn = sqlite3.connect(msg_path)

# 列出所有表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'Msg_%'")
print("系统表:")
for r in cur.fetchall():
    print(f"  {r[0]}")

# 查找bangbingyang
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bangbingyang'")
row = cur.fetchone()
print(f"\nbangbingyang表: {row}")

conn.close()