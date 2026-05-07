# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"
target1 = "wxid_tfv51zfmn5xe12"
target2 = "wxid_d163c0ocyvk622"

# 提取target1的聊天记录
msgs1 = []
files = ["friend_202203-202512.csv"]  # 主要文件
for f in files:
    path = os.path.join(root, f)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8-sig") as fp:
            reader = csv.reader(fp)
            next(reader)
            for row in reader:
                if len(row) >= 3 and (target1 in row[0] or target1 in row[1]):
                    msgs1.append(row)

print(f"{target1}: {len(msgs1)}条")

# 提取target2的聊天记录
msgs2 = []
files = ["friend_201805-202202.csv", "friend_202203-202512.csv", "friend_202601~.csv"]
for f in files:
    path = os.path.join(root, f)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8-sig") as fp:
            reader = csv.reader(fp)
            next(reader)
            for row in reader:
                if len(row) >= 3 and (target2 in row[0] or target2 in row[1]):
                    msgs2.append(row)

print(f"{target2}: {len(msgs2)}条")

# 保存target1
output1 = os.path.join(root, f"{target1}_聊天记录.csv")
with open(output1, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["发送者", "内容", "时间"])
    for row in msgs1:
        if len(row) >= 3:
            writer.writerow([row[0], row[1], row[2]])

print(f"已保存: {output1}")

# 保存target2
output2 = os.path.join(root, f"{target2}_聊天记录.csv")
with open(output2, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["发送者", "内容", "时间"])
    for row in msgs2:
        if len(row) >= 3:
            writer.writerow([row[0], row[1], row[2]])

print(f"已保存: {output2}")