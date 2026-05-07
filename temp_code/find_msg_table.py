# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

# 查看Name2Id表
cur = conn.execute("SELECT * FROM Name2Id WHERE user_name='bangbingyang'")
row = cur.fetchone()
print(f"Name2Id中的bangbingyang (wechat-decrypt):")
print(f"  {row}")

# 查看Msg_表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%'")
msg_tables = [r[0] for r in cur.fetchall()]
print(f"\n消息表数量: {len(msg_tables)}")

conn.close()