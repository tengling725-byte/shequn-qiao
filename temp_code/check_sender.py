# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 检查message表中不同的sender相关字段
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
table_name = cur.fetchone()[0]

# 查看表结构
print(f"=== {table_name} 表结构 ===")
cur = conn.execute(f"PRAGMA table_info({table_name})")
for r in cur.fetchall():
    print(f"  {r[1]} ({r[2]})")

# 查看包含sender的字段值
print(f"\n=== 查看sender相关字段值 ===")
cur = conn.execute(f"SELECT local_id, real_sender_id, source FROM {table_name} LIMIT 10")
for r in cur.fetchall():
    print(f"\nlocal_id={r[0]}")
    print(f"  real_sender_id: {r[1]}")
    print(f"  source: {r[2][:50] if r[2] and len(r[2]) > 50 else r[2]}")

# 查看所有message表中的real_sender_id范围
print(f"\n=== 汇总所有message表的real_sender_id范围 ===")
min_id = 999999999
max_id = 0
for i in range(11):
    try:
        path = rf"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_{i}.db"
        conn2 = sqlite3.connect(path)
        cur = conn2.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 1")
        row = cur.fetchone()
        if row:
            cur = conn2.execute(f"SELECT MIN(real_sender_id), MAX(real_sender_id) FROM {row[0]}")
            row = cur.fetchone()
            if row[0]:
                min_id = min(min_id, row[0])
                max_id = max(max_id, row[1])
        conn2.close()
    except:
        pass

print(f"全局 real_sender_id 范围: {min_id} - {max_id}")

# 分析：id vs real_sender_id 的差值
print(f"\n=== 分析差值 ===")
print(f"  id=7081 → real_sender_id=1498")
print(f"  差值: 7081 - 1498 = 5583")
print(f"  id=15049 → real_sender_id=156")
print(f"  差值: 15049 - 156 = 14893")
print(f"  id=288 → real_sender_id=8283")
print(f"  差值: 288 - 8283 = -7995 (负数!)")

conn.close()