# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)

# 检查288, 7081, 15049的id分布
print("=== 检查contact表ID分布 ===")

# 检查288附近的记录
cur = conn.execute("SELECT id FROM Contact WHERE id BETWEEN 280 AND 300 ORDER BY id")
ids = [r[0] for r in cur.fetchall()]
print(f"\nid 280-300: {ids}")

# 检查7081附近的记录
cur = conn.execute("SELECT id FROM Contact WHERE id BETWEEN 7070 AND 7090 ORDER BY id")
ids = [r[0] for r in cur.fetchall()]
print(f"id 7070-7090: {ids}")

# 检查15049附近的记录
cur = conn.execute("SELECT id FROM Contact WHERE id BETWEEN 15040 AND 15060 ORDER BY id")
ids = [r[0] for r in cur.fetchall()]
print(f"id 15040-15060: {ids}")

# 检查最大id
cur = conn.execute("SELECT MAX(id), MIN(id), COUNT(*) FROM Contact")
row = cur.fetchone()
print(f"\n最大id: {row[0]}, 最小id: {row[1]}, 总数: {row[2]}")

# 检查id是否连续
cur = conn.execute("SELECT id FROM Contact ORDER BY id LIMIT 20")
ids = [r[0] for r in cur.fetchall()]
print(f"\n前20个id: {ids}")

conn.close()

# 检查发送者ID 8283, 1498, 156 在contact中的位置
print("\n=== 检查发送者ID ===")
print("可能发送者ID是某个索引或累加值")

# 检查message表中real_sender_id的范围
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
table_name = cur.fetchone()[0]

cur = conn.execute(f"SELECT MIN(real_sender_id), MAX(real_sender_id), COUNT(DISTINCT real_sender_id) FROM {table_name}")
row = cur.fetchone()
print(f"\nmessage表 real_sender_id:")
print(f"  最小值: {row[0]}, 最大值: {row[1]}, 不重复数: {row[2]}")

# 检查一些示例
cur = conn.execute(f"SELECT real_sender_id, COUNT(*) FROM {table_name} GROUP BY real_sender_id ORDER BY COUNT(*) DESC LIMIT 10")
print("\n最常见的发送者:")
for r in cur.fetchall():
    print(f"  real_sender_id={r[0]}: {r[1]}条")

conn.close()