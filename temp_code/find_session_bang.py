# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn = sqlite3.connect(session_path)

# 查找bangbingyang在SessionTable中
cur = conn.execute("SELECT * FROM SessionTable WHERE userName='bangbingyang'")
row = cur.fetchone()
if row:
    print(f"SessionTable中的bangbingyang (共{len(row)}字段):")
    # 获取字段名
    cur = conn.execute("PRAGMA table_info(SessionTable)")
    cols = [r[1] for r in cur.fetchall()]
    for i, c in enumerate(cols):
        print(f"  {c}: {row[i]}")
else:
    print("SessionTable中未找到")

# 列出前5个
cur = conn.execute("SELECT userName, lastMsgTime FROM SessionTable LIMIT 5")
print("\nSessionTable前5个:")
for r in cur.fetchall():
    print(f"  {r[0]}: {r[1]}")

conn.close()