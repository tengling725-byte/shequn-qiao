# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3
import csv
import os
import json

decrypted_dir = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted"
output_dir = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

print("[1/4] 检查contact表字段...")
conn = sqlite3.connect(os.path.join(decrypted_dir, "contact", "contact.db"))
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(Contact)")
cols_info = cursor.fetchall()
print("字段ID|字段名|类型|可空|默认值|主键")
for col in cols_info:
    print(f"  {col[0]}|{col[1]}|{col[2]}|{col[3]}|{col[4]}|{col[5]}")
conn.close()

print("\n[2/4] 读取联系人完整信息...")
contacts = []

conn = sqlite3.connect(os.path.join(decrypted_dir, "contact", "contact.db"))
cursor = conn.cursor()
cursor.execute("SELECT * FROM Contact LIMIT 3")
cols = [d[0] for d in cursor.description]
print("\n样本数据(前3条):")
for row in cursor.fetchall():
    c = dict(zip(cols, row))
    print(f"  username: {c.get('username')}")
    print(f"  remark: {c.get('remark')}")
    print(f"  nick_name: {c.get('nick_name')}")
    print(f"  alias: {c.get('alias')}")
    print(f"  description: {c.get('description')[:50] if c.get('description') else '无'}")
    print(f"  extra_buffer: {c.get('extra_buffer')[:50] if c.get('extra_buffer') else '无'}")
    print()
conn.close()