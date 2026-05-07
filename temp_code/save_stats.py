# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"
output = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\tengling_统计.csv"

senders = ["2", "3", "4", "5"]

results = []
csv_files = [f for f in os.listdir(root) if f.endswith(".csv") and f.startswith("friend_")]

for csv_file in csv_files:
    path = os.path.join(root, csv_file)
    count = 0
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if len(row) >= 3:
                    sender = row[0].strip()
                    content = row[1] if len(row) > 1 else ""
                    if sender in senders and "滕岭" not in content:
                        count += 1
    except Exception as e:
        print(f"Error {csv_file}: {e}")

    if count > 0:
        results.append([csv_file, count])

# 保存统计
with open(output, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["文件名", "发送者ID为2/3/4/5且不含滕岭的记录数"])
    for r in results:
        writer.writerow(r)
    total = sum(x[1] for x in results)
    writer.writerow(["总计", total])

print(f"已保存: {output}")
print("\n=== 统计结果 ===")
for r in results:
    print(f"{r[0]}: {r[1]}条")
print(f"总计: {sum(x[1] for x in results)}条")