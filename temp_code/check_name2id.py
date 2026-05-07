# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

msg_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_0解密.db"
conn = sqlite3.connect(msg_path)

# 查看Name2Id表
cur = conn.execute("SELECT * FROM Name2Id WHERE user_name='bangbingyang'")
row = cur.fetchone()
print(f"Name2Id中的bangbingyang:")
print(f"  {row}")

# 查看Msg_表列表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%'")
msg_tables = [r[0] for r in cur.fetchall()]
print(f"\n消息表数量: {len(msg_tables)}")

# 列出前5个
print("\n前5个Msg_表:")
for t in msg_tables[:5]:
    cur = conn.execute(f"SELECT COUNT(*) FROM {t}")
    count = cur.fetchone()[0]
    print(f"  {t}: {count}条")

conn.close()