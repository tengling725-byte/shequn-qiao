# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"
output = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\tengling_发送者ID统计.csv"

senders = ["2", "3", "4", "5"]

results = []

# 各文件统计
csv_files = [f for f in os.listdir(root) if f.endswith(".csv") and f.startswith("friend_")]

for csv_file in csv_files:
    path = os.path.join(root, csv_file)
    count = 0
    msgs = []
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
                        count += 1
                        msgs.append([sender, content, time])
    except Exception as e:
        print(f"Error {csv_file}: {e}")

    if count > 0:
        results.append([csv_file, count, len(msgs)])
        # 保存每条消息
        for m in msgs:
            with open(output, "a", encoding="utf-8-sig", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([csv_file] + m)

# 保存统计结果
summary_file = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\tengling_统计.csv"
with open(summary_file, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["文件名", "记录数", "可读消息数"])
    for r in results:
        writer.writerow(r)
    writer.writerow(["总计", sum(x[1] for x in results), sum(x[2] for x in results)])

print(f"已保存统计到: {summary_file}")
print(f"已保存消息到: {output}")

# 显示统计
print("\n=== 发送者ID为2/3/4/5且不包含滕岭的消息统计 ===")
total = 0
for r in results:
    print(f"{r[0]}: {r[1]}条")
    total += r[1]
print(f"\n总计: {total}条")