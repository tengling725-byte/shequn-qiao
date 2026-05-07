# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 用Name2Id表查找
for i in range(6):
    msg_path = rf"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_{i}解密.db"
    try:
        conn = sqlite3.connect(msg_path)
        cur = conn.execute("SELECT user_name FROM Name2Id WHERE user_name LIKE '%bangbingyang%' OR user_name LIKE '%棒冰%'")
        rows = cur.fetchall()
        if rows:
            print(f"message_{i}解密.db 中找到:")
            for r in rows:
                print(f"  {r[0]}")
            # 找到表名
            cur = conn.execute("SELECT user_name FROM Name2Id WHERE user_name LIKE '%bangbingyang%' OR user_name LIKE '%棒冰%'")
            row = cur.fetchone()
            if row:
                chat_table = row[0]
                print(f"\n消息表名: {chat_table}")
                cur = conn.execute(f"SELECT local_id, create_time, message_content FROM {chat_table} LIMIT 20")
                print(f"\n消息:")
                for r in cur.fetchall():
                    print(f"local_id: {r[0]}, time: {r[1]}")
                    print(f"  content: {r[2]}")
            break
        conn.close()
    except Exception as e:
        pass