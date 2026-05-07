# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

table_name = "bangbingyang"
output_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\bangbingyang_msg.csv"

# 导出所有消息
all_msgs = []

for i in [0,1,2,3,4]:
    msg_path = rf"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\message_{i}解密.db"
    try:
        conn = sqlite3.connect(msg_path)

        # 检查表是否存在
        cur = conn.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
        if not cur.fetchone():
            conn.close()
            continue

        print(f"读取 message_{i}解密.db ...")

        # 获取字段信息
        cur = conn.execute(f"PRAGMA table_info({table_name})")
        cols = [r[1] for r in cur.fetchall()]

        # 查询所有消息
        cur = conn.execute(f"SELECT local_id, create_time, message_content, source FROM {table_name} ORDER BY create_time")
        for r in cur.fetchall():
            all_msgs.append(r)

        conn.close()
    except Exception as e:
        print(f"message_{i} 错误: {e}")

print(f"\n总消息数: {len(all_msgs)}")

# 写入CSV
with open(output_path, 'w', encoding='utf-8-sig', newline='') as f:
    f.write("local_id,create_time,message_content,source\n")
    for r in all_msgs:
        local_id = r[0] if r[0] else ""
        create_time = r[1] if r[1] else ""
        content = r[2] if r[2] else ""
        source = r[3] if r[3] else ""
        if isinstance(content, bytes):
            content = f"bytes({len(content)})"
        if isinstance(source, bytes):
            source = f"bytes({len(source)})"
        f.write(f'"{local_id}","{create_time}","{content}","{source}"\n')

print(f"\n已导出: {output_path}")