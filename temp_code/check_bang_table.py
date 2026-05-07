# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 在wechat-decrypt目录中查找表
for i in range(11):
    msg_path = rf"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_{i}.db"
    try:
        conn = sqlite3.connect(msg_path)
        cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bangbingyang'")
        row = cur.fetchone()
        if row:
            print(f"找到于 message_{i}.db")

            # 获取字段
            cur = conn.execute("PRAGMA table_info(bangbingyang)")
            print("\n字段:")
            for r in cur.fetchall():
                print(f"  {r[1]}")

            # 获取记录数
            cur = conn.execute("SELECT COUNT(*) FROM bangbingyang")
            count = cur.fetchone()[0]
            print(f"\n记录数: {count}")

            # 显示前3条
            cur = conn.execute("SELECT * FROM bangbingyang LIMIT 3")
            print("\n数据:")
            for r in cur.fetchall():
                print(f"  {r}")

            conn.close()
            break
        conn.close()
    except Exception as e:
        print(f"message_{i}: {e}")