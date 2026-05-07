# -*- coding: utf-8 -*-
import sqlite3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

db_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
output_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\contact解密.txt"

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 获取所有字段
cur.execute("PRAGMA table_info(Contact)")
cols = [d[1] for d in cur.fetchall()]

# 写入文件
with open(output_path, 'w', encoding='utf-8') as f:
    f.write("|".join(cols) + "\n")

    cur.execute("SELECT * FROM Contact")
    for row in cur.fetchall():
        line = "|".join([str(v) if v is not None else "" for v in row])
        f.write(line + "\n")

print(f"已导出 {output_path}")
conn.close()