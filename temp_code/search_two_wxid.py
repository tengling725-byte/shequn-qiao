# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

targets = ["wxid_tfv51zfmn5xe12", "wxid_d163c0ocyvk622"]

results = {}

for target in targets:
    results[target] = {}
    for f in os.listdir(root):
        if f.endswith(".csv"):
            path = os.path.join(root, f)
            try:
                with open(path, "rb") as fp:
                    content = fp.read()
                    count = content.count(target.encode("utf-8"))
                    if count > 0:
                        results[target][f] = count
            except Exception as e:
                print(f"Error {f}: {e}")

print("=== wxid 出现频次统计 ===")
for target in targets:
    print(f"\n【{target}】")
    total = 0
    for f, c in sorted(results[target].items(), key=lambda x: -x[1]):
        print(f"  {f}: {c}条")
        total += c
    print(f"  总计: {total}条")