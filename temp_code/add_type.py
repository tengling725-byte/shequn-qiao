# -*- coding: utf-8 -*-
import csv
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

input_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\contact解密.csv"
output_path = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats\contact解密并推测.csv"

def get_type(local_type, is_in_chat_room):
    lt = int(local_type) if local_type else 0
    icr = int(is_in_chat_room) if is_in_chat_room else 0

    if lt == 1 and icr != 0:
        return "微信群"
    elif lt == 1 and icr == 0:
        return "通讯录好友"
    elif lt == 2:
        return "微信群"
    elif lt == 3:
        return "群聊陌生人"
    elif lt == 5:
        return "企微好友"
    elif lt == 6:
        return "企微陌生人"
    else:
        return "其它"

with open(input_path, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    rows = list(reader)

header = rows[0]
header.append("推测类型")

for row in rows[1:]:
    local_type = row[2] if len(row) > 2 else "0"
    is_in_chat_room = row[17] if len(row) > 17 else "0"
    row.append(get_type(local_type, is_in_chat_room))

with open(output_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"已导出 {output_path}")

# 统计
type_count = {}
for row in rows[1:]:
    t = row[-1]
    type_count[t] = type_count.get(t, 0) + 1
print("\n类型统计:")
for t, c in sorted(type_count.items()):
    print(f"  {t}: {c}")