# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 检查contact表的rowid
contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)

# 检查rowid vs id的关系
print("=== 检查contact表 rowid vs id ===")

# 检查wenpeinan (id=7081)
cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE username='wenpeinan'")
row = cur.fetchone()
print(f"\nwenpeinan: rowid={row[0]}, id={row[1]}, username={row[2]}")
print(f"  rowid - id = {row[0] - row[1]}")

# 检查wxid_6fe4kselg0b612 (id=288)
cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE username='wxid_6fe4kselg0b612'")
row = cur.fetchone()
print(f"\nwxid_6fe4kselg0b612: rowid={row[0]}, id={row[1]}, username={row[2]}")
print(f"  rowid - id = {row[0] - row[1]}")

# 检查gh_bb59e16cef98 (id=156)
cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE username='gh_bb59e16cef98'")
row = cur.fetchone()
print(f"\ngh_bb59e16cef98: rowid={row[0]}, id={row[1]}, username={row[2]}")
print(f"  rowid - id = {row[0] - row[1]}")

# 检查id=8283
cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE id=8283")
row = cur.fetchone()
if row:
    print(f"\nid=8283: rowid={row[0]}, id={row[1]}, username={row[2]}")
    print(f"  rowid - id = {row[0] - row[1]}")

# 检查id=1498
cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE id=1498")
row = cur.fetchone()
if row:
    print(f"\nid=1498: rowid={row[0]}, id={row[1]}, username={row[2]}")
    print(f"  rowid - id = {row[0] - row[1]}")

# 检查id=156
cur = conn.execute("SELECT rowid, id, username FROM Contact WHERE id=156")
row = cur.fetchone()
if row:
    print(f"\nid=156: rowid={row[0]}, id={row[1]}, username={row[2]}")
    print(f"  rowid - id = {row[0] - row[1]}")

# 检查多个记录看看rowid规律
print("\n=== 检查rowid顺序 ===")
cur = conn.execute("SELECT rowid, id, username FROM Contact ORDER BY rowid LIMIT 20")
rows = cur.fetchall()
print("前20条 (按rowid排序):")
for r in rows:
    print(f"  rowid={r[0]}, id={r[1]}, username={r[2]}")

# 检查是否 real_sender_id == rowid
print("\n=== 检查是否 real_sender_id == rowid ===")
print("wenpeinan: id=7081, real_sender_id=1498")
print("  1498 可能是 rowid?")

conn.close()