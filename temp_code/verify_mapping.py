# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 验证：real_sender_id -> contact.rowid 的映射
print("=== 验证 real_sender_id 映射 ===")

# real_sender_id = 1498 对应的contact记录
contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)

cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE rowid=1498")
row = cur.fetchone()
if row:
    print(f"\nreal_sender_id=1498 → contact rowid=1498:")
    print(f"  contact.id={row[1]}, username={row[2]}")

cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE rowid=8283")
row = cur.fetchone()
if row:
    print(f"\nreal_sender_id=8283 → contact rowid=8283:")
    print(f"  contact.id={row[1]}, username={row[2]}")

cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE rowid=156")
row = cur.fetchone()
if row:
    print(f"\nreal_sender_id=156 → contact rowid=156:")
    print(f"  contact.id={row[1]}, username={row[2]}")

conn.close()

# 检查session表中的last_msg_sender，看看发送者是谁
session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn = sqlite3.connect(session_path)

# 查找wenpeinan的会话
cur = conn.execute("SELECT userName, last_msg_sender FROM SessionTable WHERE userName='wenpeinan'")
row = cur.fetchone()
if row:
    print(f"\nwenpeinan的last_msg_sender: {row[1]}")

# 查找发送者=1498的会话
cur = conn.execute("SELECT userName, last_msg_sender FROM SessionTable WHERE last_msg_sender LIKE '%1498%'")
rows = cur.fetchall()
if rows:
    print(f"\nlast_msg_sender包含1498的会话:")
    for r in rows:
        print(f"  {r[0]}: {r[1]}")

conn.close()

# 结论分析
print("\n=== 结论 ===")
print("发送者ID = contact表的ROWID（不是主键id）")
print(f"wenpeinan: id=7081, 但发送者显示1498")
print(f"这意味着: rowid=1498 的用户不是wenpeinan")