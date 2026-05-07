# -*- coding: utf-8 -*-
import sqlite3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

db_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_0解密.db"
conn = sqlite3.connect(db_path)

# 获取一个Msg表结构
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
table_name = cur.fetchone()[0]

print(f"【消息表(Msg_)结构】")
print(f"表名: {table_name}")
print("=" * 60)

cur = conn.execute(f"PRAGMA table_info({table_name})")
cols = cur.fetchall()
for c in cols:
    print(f"  {c[1]} ({c[2]})")

# 显示一条记录示例（转为文本）
print("\n【记录示例】")
cur = conn.execute(f"SELECT * FROM {table_name} LIMIT 1")
row = cur.fetchone()
if row:
    for i, c in enumerate(cols):
        val = row[i]
        if val is None:
            s = "NULL"
        elif isinstance(val, bytes):
            s = f"bytes({len(val)})"
        elif isinstance(val, int):
            s = str(val)
        else:
            s = str(val)[:50]
        print(f"  {c[1]}: {s}")

conn.close()