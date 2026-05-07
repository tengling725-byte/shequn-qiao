# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

base = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

for i in range(6):
    db_path = rf"{base}\message_{i}解密.db"
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cur.fetchall()]
        conn.close()
        print(f"message_{i}解密.db: {', '.join(tables)}")
    except Exception as e:
        print(f"message_{i}解密.db: 错误 - {e}")