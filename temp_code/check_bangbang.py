# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

table_name = "bangbingyang"
msg_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_0解密.db"

conn = sqlite3.connect(msg_path)

# 检查表是否存在
cur = conn.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
row = cur.fetchone()
if row:
    print(f"表存在: {table_name}")
else:
    print(f"表不存在")

    # 查找包含bangbingyang的表
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%bang%'")
    for r in cur.fetchall():
        print(f"找到: {r[0]}")
    conn.close()
    exit()

# 查看表结构
cur = conn.execute(f"PRAGMA table_info({table_name})")
print("\n字段:")
for r in cur.fetchall():
    print(f"  {r[1]} ({r[2]})")

# 查看数据
cur = conn.execute(f"SELECT * FROM {table_name} LIMIT 3")
rows = cur.fetchall()
print(f"\n记录数: {len(rows)}")
for r in rows:
    print(r)

conn.close()