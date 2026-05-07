# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

# 查找所有包含滕岭的聊天记录（从发送者角度）
senders = ["2", "3", "4", "5"]

msgs = []

for csv_file in ["friend_2016-201804.csv", "friend_201805-202202.csv", "friend_202203-202512.csv"]:
    path = os.path.join(root, csv_file)
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if len(row) >= 3:
                    sender = row[0].strip()
                    content = row[1] if len(row) > 1 else ""
                    time = row[2] if len(row) > 2 else ""
                    if sender in senders and "滕岭" not in content:
                        msgs.append({
                            "file": csv_file,
                            "sender": sender,
                            "content": content,
                            "time": time
                        })
    except Exception as e:
        print(f"Error: {e}")

# 保存到文件
output = os.path.join(root, "tengling_消息汇总.txt")
with open(output, "w", encoding="utf-8") as f:
    f.write(f"=== 滕岭相关消息汇总 (发送者ID 2/3/4/5, 不含滕岭) ===\n")
    f.write(f"总消息数: {len(msgs)}\n\n")

    # 按时间排序
    msgs.sort(key=lambda x: x["time"])

    for m in msgs[:200]:  # 取前200条
        f.write(f"[{m['time']}] 发送者{m['sender']}: {m['content']}\n")

print(f"已保存到: {output}")
print(f"共{len(msgs)}条消息")