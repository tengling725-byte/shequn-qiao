# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 检查wechat-decrypt的message_0
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

# 检查bangbingyang表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bangbingyang'")
row = cur.fetchone()
print(f"message_0.db中bangbingyang表: {row}")

if not row:
    # 查看所有表名包含bang的
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%bang%'")
    rows = cur.fetchall()
    print(f"\n包含bang的表:")
    for r in rows:
        print(f"  {r[0]}")

    # 查看包含棒的
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%棒%'")
    rows = cur.fetchall()
    print(f"\n包含棒的表:")
    for r in rows:
        print(f"  {r[0]}")

conn.close()