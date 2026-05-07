# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

# 需要检查的发送者ID
senders = ["2", "3", "4", "5"]

# 所有CSV文件
csv_files = [f for f in os.listdir(root) if f.endswith(".csv") and f.startswith("friend_")]

results = {}

for csv_file in csv_files:
    path = os.path.join(root, csv_file)
    count = 0
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            next(reader)  # 跳过表头
            for row in reader:
                if len(row) >= 3:
                    sender = row[0].strip()
                    content = row[1] if len(row) > 1 else ""
                    # 检查发送者ID是否为2/3/4/5 且内容不包含"滕岭"
                    if sender in senders and "滕岭" not in content:
                        count += 1
    except Exception as e:
        print(f"Error {csv_file}: {e}")

    if count > 0:
        results[csv_file] = count

print("=== 发送者ID为2/3/4/5且不包含滕岭的消息统计 ===\n")
total = 0
for f, c in sorted(results.items(), key=lambda x: -x[1]):
    print(f"{f}: {c}条")
    total += c
print(f"\n总计: {total}条")