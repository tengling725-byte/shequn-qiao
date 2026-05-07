# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

# 读取wxid_tfv51zfmn5xe12的聊天记录
target1 = "wxid_tfv51zfmn5xe12"
msgs1 = []
files = ["friend_202203-202512.csv", "friend_202601~.csv"]
for f in files:
    path = os.path.join(root, f)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8-sig") as fp:
            reader = csv.reader(fp)
            next(reader)
            for row in reader:
                if len(row) >= 3 and (target1 in row[0] or target1 in row[1]):
                    if row[1] and not row[1].startswith("b'(") and len(row[1]) > 3:
                        msgs1.append(row)

print(f"=== {target1} 可读消息 ({len(msgs1)}条) ===")
for i, m in enumerate(msgs1[:80]):
    sender = m[0]
    content = m[1]
    time = m[2]
    print(f"[{time}] {sender}: {content}")

print("\n\n")

# 读取wxid_d163c0ocyvk622的聊天记录
target2 = "wxid_d163c0ocyvk622"
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
                    if row[1] and not row[1].startswith("b'(") and len(row[1]) > 3:
                        msgs2.append(row)

print(f"\n=== {target2} 可读消息 ({len(msgs2)}条) ===")
for i, m in enumerate(msgs2[:80]):
    sender = m[0]
    content = m[1]
    time = m[2]
    print(f"[{time}] {sender}: {content}")