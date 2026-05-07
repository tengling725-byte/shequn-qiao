# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 搜索message数据库中的Msg_表，看source字段或message_content中是否有bangbingyang
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

# 获取所有Msg_表
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%'")
msg_tables = [r[0] for r in cur.fetchall()]

print(f"搜索{len(msg_tables)}个消息表...")

# 搜索包含"bangbingyang"的表
found = None
for t in msg_tables[:50]:  # 先检查前50个
    try:
        cur = conn.execute(f"SELECT COUNT(*) FROM {t} LIMIT 1")
        cur.fetchone()
    except:
        continue

conn.close()

# 换个方法：从session表获取last_msg_sender
session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn = sqlite3.connect(session_path)
cur = conn.execute("SELECT userName, last_msg_sender, last_msg_locald_id FROM SessionTable WHERE userName='bangbingyang'")
row = cur.fetchone()
if row:
    print(f"\nbangbingyang的session信息:")
    print(f"  userName: {row[0]}")
    print(f"  last_msg_sender: {row[1]}")
    print(f"  last_msg_locald_id: {row[2]}")
conn.close()

# 查看message_0中是否有local_id=3的记录
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%' LIMIT 5")
for r in cur.fetchall():
    table = r[0]
    try:
        cur = conn.execute(f"SELECT * FROM {table} WHERE local_id=3")
        rows = cur.fetchall()
        if rows:
            print(f"\n找到 local_id=3 in {table}:")
            for row in rows:
                print(f"  {row}")
            break
    except:
        pass

conn.close()