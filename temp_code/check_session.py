# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 查看session.db的表结构
session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn = sqlite3.connect(session_path)

# 列出所有表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print(f"session.db中的表:")
for t in tables:
    print(f"  {t}")

# 查看session表结构
if 'session' in tables:
    print("\nsession表字段:")
    cur = conn.execute("PRAGMA table_info(session)")
    for r in cur.fetchall():
        print(f"  {r[1]}")

    # 查找bangbingyang
    cur = conn.execute("SELECT * FROM session WHERE userName='bangbingyang'")
    row = cur.fetchone()
    if row:
        print(f"\nbangbingyang会话:")
        print(f"  {row}")

conn.close()