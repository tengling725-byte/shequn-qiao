# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3
import hashlib

# 从session获取bangbingyang的信息
session_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\session\session.db"
conn = sqlite3.connect(session_path)
cur = conn.execute("SELECT * FROM SessionTable WHERE userName='bangbingyang'")
row = cur.fetchone()
if row:
    # 获取字段名
    cur = conn.execute("PRAGMA table_info(SessionTable)")
    cols = [r[1] for r in cur.fetchall()]
    session_info = dict(zip(cols, row))
    print(f"会话信息:")
    print(f"  local_type: {session_info.get('type')}")
    print(f"  last_msg_locald_id: {session_info.get('last_msg_locald_id')}")

    # 计算可能的表名
    username = 'bangbingyang'
    chat_id = "Chat_" + hashlib.md5(username.encode()).hexdigest()
    print(f"\n可能的表名:")
    print(f"  Chat_xxx: {chat_id}")
conn.close()

# 检查Message中的Msg_表
msg_path = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_0.db"
conn = sqlite3.connect(msg_path)

# 搜索Msg_表是否包含bangbingyang的数据
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%'")
msg_tables = [r[0] for r in cur.fetchall()]

# 检查是否有包含该用户消息的表
# 使用sqlite_master的sql查看表定义
cur = conn.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%%' LIMIT 3")
for r in cur.fetchall():
    print(f"\n表 {r[0]} 的定义片段:")
    print(f"  {r[1][:100] if r[1] else ''}")

conn.close()