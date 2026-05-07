# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

table_name = "bangbingyang"

# 在wechat-decrypt的decrypted目录中查找
for i in [0,1,2,3,4,5,6,7,8,9,10]:
    msg_path = rf"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_{i}.db"
    try:
        conn = sqlite3.connect(msg_path)
        cur = conn.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
        row = cur.fetchone()
        if row:
            print(f"找到于 message_{i}.db")

            # 查看表结构
            cur = conn.execute(f"PRAGMA table_info({table_name})")
            print("\n字段:")
            for r in cur.fetchall():
                print(f"  {r[1]} ({r[2]})")

            # 查看数据
            cur = conn.execute(f"SELECT * FROM {table_name} LIMIT 3")
            rows = cur.fetchall()
            print(f"\n记录数: {len(rows)}")
            for r in rows:
                print(r)

            conn.close()
            break
        conn.close()
    except Exception as e:
        print(f"message_{i}: {e}")