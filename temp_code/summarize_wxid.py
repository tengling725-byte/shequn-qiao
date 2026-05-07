# -*- coding: utf-8 -*-
import csv
import sys
from collections import Counter

file_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\friend_202203-202512.csv"
output_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\wxid_g7v7ie3nt53822_聊天记录.csv"

target = "wxid_g7v7ie3nt53822"

msgs = []
with open(file_path, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) >= 3:
            sender = row[0]
            content = row[1]
            time = row[2]
            if target in sender or target in content:
                msgs.append({
                    "发送者": sender,
                    "内容": content,
                    "时间": time
                })

print(f"找到 {len(msgs)} 条记录")

# 分析
print("\n=== 聊天记录分析 ===")
print(f"总消息数: {len(msgs)}")

# 提取可读消息
readable_msgs = []
for m in msgs:
    content = m["内容"]
    # 过滤掉空白内容或二进制内容
    if content and not content.startswith("b'(") and len(content) > 5:
        readable_msgs.append(m)

print(f"可读消息数: {len(readable_msgs)}")

# 保存到新文件
with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["发送者", "内容", "时间"])
    writer.writeheader()
    writer.writerows(msgs)

print(f"\n已保存到: {output_path}")

# 显示部分可读消息
print("\n=== 可读消息示例 ===")
for m in readable_msgs[:20]:
    print(f"[{m['时间']}] {m['发送者']}: {m['内容'][:100]}")