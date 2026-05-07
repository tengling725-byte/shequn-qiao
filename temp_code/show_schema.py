# -*- coding: utf-8 -*-
import sqlite3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

db_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_0解密.db"
conn = sqlite3.connect(db_path)

# 获取所有表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall()]

print(f"总表数: {len(tables)}")
print("=" * 60)

# 统计各类型表数量
msg_count = sum(1 for t in tables if t.startswith('Msg_'))
sys_tables = [t for t in tables if not t.startswith('Msg_')]
print(f"系统表: {len(sys_tables)}")
print(f"消息表(Msg_): {msg_count}")
print("=" * 60)

# 显示系统表结构
print("\n【系统表结构】")
for t in sys_tables:
    print(f"\n表: {t}")
    cur = conn.execute(f"PRAGMA table_info({t})")
    cols = cur.fetchall()
    for c in cols:
        print(f"  {c[1]} ({c[2]})")

conn.close()