# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 检查发送者ID=1498, 8283, 156 在message表中对应什么用户
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
table_name = cur.fetchone()[0]

# 检查real_sender_id=1498的记录
cur = conn.execute(f"SELECT COUNT(*) FROM {table_name} WHERE real_sender_id=1498")
count = cur.fetchone()[0]
print(f"real_sender_id=1498 的消息数: {count}")

# 检查real_sender_id=8283的记录
cur = conn.execute(f"SELECT COUNT(*) FROM {table_name} WHERE real_sender_id=8283")
count = cur.fetchone()[0]
print(f"real_sender_id=8283 的消息数: {count}")

# 检查real_sender_id=156的记录
cur = conn.execute(f"SELECT COUNT(*) FROM {table_name} WHERE real_sender_id=156")
count = cur.fetchone()[0]
print(f"real_sender_id=156 的消息数: {count}")

conn.close()

# 检查contact表中是否有字段值等于1498
contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)

print("\n=== 检查contact表字段值 ===")

# 检查是否有字段包含1498
print("\n检查是否某个字段的值等于发送者ID:")
cur = conn.execute("SELECT id, username, flag FROM Contact WHERE id=1498")
row = cur.fetchone()
if row:
    print(f"id=1498: username={row[1]}, flag={row[2]}")

cur = conn.execute("SELECT id, username, flag FROM Contact WHERE id=8283")
row = cur.fetchone()
if row:
    print(f"id=8283: username={row[1]}, flag={row[2]}")

cur = conn.execute("SELECT id, username, flag FROM Contact WHERE id=156")
row = cur.fetchone()
if row:
    print(f"id=156: username={row[1]}, flag={row[2]}")

# 检查username映射
print("\n检查username → id 的映射:")
cur = conn.execute("SELECT id, username FROM Contact WHERE username='wenpeinan'")
row = cur.fetchone()
if row:
    print(f"wenpeinan → id={row[0]}")

cur = conn.execute("SELECT id, username FROM Contact WHERE username='wxid_6fe4kselg0b612'")
row = cur.fetchone()
if row:
    print(f"wxid_6fe4kselg0b612 → id={row[0]}")

conn.close()

# 检查session表
print("\n=== 检查session表 ===")
session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn = sqlite3.connect(session_path)

# 查找wenpeinan
cur = conn.execute("SELECT * FROM SessionTable WHERE userName='wenpeinan'")
row = cur.fetchone()
if row:
    print(f"\nSessionTable中wenpeinan:")
    print(f"  {row}")

conn.close()