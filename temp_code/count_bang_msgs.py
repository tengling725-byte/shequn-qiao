# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3

# 在所有message数据库中搜索bangbingyang相关的记录
print("搜索bangbingyang的消息...")
found_tables = []

for i in range(11):
    msg_path = rf"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted\message\message_{i}.db"
    try:
        conn = sqlite3.connect(msg_path)
        cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Msg_%'")
        msg_tables = [r[0] for r in cur.fetchall()]

        for t in msg_tables:
            try:
                cur = conn.execute(f"SELECT COUNT(*) FROM {t}")
                count = cur.fetchone()[0]
                if count > 0:
                    found_tables.append((i, t, count))
            except:
                pass
        conn.close()
    except Exception as e:
        print(f"message_{i}: {e}")

# 显示结果
print(f"\n找到的消息表数量: {len(found_tables)}")
if found_tables:
    print("\n前10个:")
    for i, t, c in found_tables[:10]:
        print(f"  message_{i}: {t} ({c}条)")