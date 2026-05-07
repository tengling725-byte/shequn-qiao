# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 查看contact中的记录
contact_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\contact\contact.db"
conn = sqlite3.connect(contact_path)
cur = conn.execute("SELECT username, remark, nick_name, local_type FROM Contact WHERE username='bangbingyang'")
row = cur.fetchone()
print(f"contact表中:")
print(f"  {row}")

# 检查session表找到最近消息
session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn2 = sqlite3.connect(session_path)

# 查找bangbingyang的会话
cur = conn2.execute("SELECT * FROM Session WHERE userName='bangbingyang'")
row = cur.fetchone()
if row:
    print(f"\nsession中的bangbingyang:")
    print(f"  {row}")
else:
    # 查找包含bang的
    cur = conn2.execute("SELECT userName FROM Session WHERE userName LIKE '%bangbingyang%'")
    rows = cur.fetchall()
    if rows:
        print(f"\n找到类似:")
        for r in rows:
            print(f"  {r[0]}")
    else:
        # 列出所有包含wxid的
        cur = conn2.execute("SELECT userName FROM Session LIMIT 20")
        print("\nsession前20个用户:")
        for r in cur.fetchall():
            print(f"  {r[0]}")

conn.close()
conn2.close()