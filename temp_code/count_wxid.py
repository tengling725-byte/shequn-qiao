# -*- coding: utf-8 -*-
import os
import sys

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"
target = b"wxid_g7v7ie3nt53822"

files = {}
for f in os.listdir(root):
    if f.endswith(".csv"):
        path = os.path.join(root, f)
        try:
            with open(path, "rb") as fp:
                content = fp.read()
                count = content.count(target)
                if count > 0:
                    files[f] = count
        except Exception as e:
            print(f"Error {f}: {e}")

print("=== wxid_g7v7ie3nt53822 出现次数 ===")
total = 0
for f, c in sorted(files.items(), key=lambda x: -x[1]):
    print(f"{f}: {c}条")
    total += c
print(f"\n总计: {total}条")