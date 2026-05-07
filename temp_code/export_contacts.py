# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import sqlite3
import csv
import os

decrypted_dir = r"C:\Workspace\opencode\temp_code\wechat-decrypt\decrypted"
output_dir = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

print("[1/5] 读取contact原始数据...")
contacts = []

conn = sqlite3.connect(os.path.join(decrypted_dir, "contact", "contact.db"))
cursor = conn.cursor()
cursor.execute("""
SELECT username, remark, nick_name, alias, description, 
       chat_room_notify, is_in_chat_room, delete_flag
FROM Contact
""")

for row in cursor.fetchall():
    username, remark, nick_name, alias, description, chat_notif, in_chatroom, delete_flag = row
    
    # 只处理个人wxid，不处理@chatroom和gh_
    if username.endswith("@chatroom") or username.startswith("gh_"):
        continue
    
    contacts.append({
        "user_id": username,
        "remark": remark or "",
        "nick_name": nick_name or "",
        "alias": alias or "",
        "signature": description or "",
        "chat_notif": str(chat_notif) if chat_notif else "0",
        "is_in_chatroom": str(in_chatroom) if in_chatroom else "0",
        "delete_flag": str(delete_flag) if delete_flag else "0",
        "session_summary": "",
    })
conn.close()
print(f"  contact记录(个人): {len(contacts)}")

print("[2/5] 读取session原始数据...")
conn = sqlite3.connect(os.path.join(decrypted_dir, "session", "session.db"))
cursor = conn.cursor()
cursor.execute("SELECT username, summary FROM SessionTable")
session_data = {}
for row in cursor.fetchall():
    username, summary = row
    session_data[username] = summary or ""
conn.close()
print(f"  session记录: {len(session_data)}")

print("[3/5] 计算推测类型...")

# 计算contact中每个人的推测类型
for c in contacts:
    username = c["user_id"]
    delete_flag = c["delete_flag"]
    is_in_chatroom = c["is_in_chatroom"]
    
    # 原始字段
    chat_notif = c["chat_notif"]
    c["群消息通知"] = "免打扰" if chat_notif == "1" else "正常"
    c["是否在群"] = "在" if is_in_chatroom == "1" else "不在"
    c["删除标记"] = delete_flag
    
    # 计算推测类型
    if is_in_chatroom == "1":
        if delete_flag == "0":
            c["推测类型"] = "群聊中好友"
        else:
            c["推测类型"] = "群聊中陌生人"
    else:  # is_in_chatroom == "0"
        if delete_flag == "0":
            c["推测类型"] = "通讯录好友"
        else:
            c["推测类型"] = "群聊中陌生人"

# 从session中补充聊天群和公众号
chatroom_list = []
gongzhong_list = []

for username, summary in session_data.items():
    if username.endswith("@chatroom"):
        chatroom_list.append({
            "user_id": username,
            "remark": "",
            "nick_name": summary[:50] if summary else username,
            "alias": "",
            "signature": "",
            "chat_notif": "0",
            "is_in_chatroom": "0",
            "delete_flag": "0",
            "session_summary": summary,
            "群消息通知": "",
            "是否在群": "",
            "删除标记": "0",
            "推测类型": "聊天群"
        })
    elif username.startswith("gh_"):
        gongzhong_list.append({
            "user_id": username,
            "remark": "",
            "nick_name": summary[:50] if summary else username,
            "alias": "",
            "signature": "",
            "chat_notif": "0",
            "is_in_chatroom": "0",
            "delete_flag": "0",
            "session_summary": summary,
            "群消息通知": "",
            "是否在群": "",
            "删除标记": "0",
            "推测类型": "公众号"
        })

print(f"  聊天群: {len(chatroom_list)}")
print(f"  公众号: {len(gongzhong_list)}")

# 合并
all_contacts = contacts + chatroom_list + gongzhong_list

# 统计
type_counts = {}
for c in all_contacts:
    t = c["推测类型"]
    type_counts[t] = type_counts.get(t, 0) + 1

print("\n类型统计:")
for t, cnt in sorted(type_counts.items(), key=lambda x: -x[1]):
    print(f"  {t}: {cnt}")

print(f"\n总记录: {len(all_contacts)}")

print("[4/5] 写入CSV...")
filepath = os.path.join(output_dir, "联系人名单.csv")
with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([
        "用户ID", "备注", "昵称", "微信号", "签名",
        "contact-群消息通知", "contact-is_in_chatroom", "contact-delete_flag",
        "session-summary",
        "是否在群", "删除标记", "推测类型"
    ])
    for c in all_contacts:
        writer.writerow([
            c["user_id"],
            c["remark"],
            c["nick_name"],
            c["alias"],
            c["signature"][:100] if c["signature"] else "",
            c["chat_notif"],
            c["is_in_chatroom"],
            c["delete_flag"],
            c["session_summary"][:50] if c["session_summary"] else "",
            c["是否在群"],
            c["删除标记"],
            c["推测类型"]
        ])

print(f"完成! 文件: {filepath}")

print("[5/5] 清理临时文件...")
temp_file = os.path.join(output_dir, "联系人名单_新.csv")
if os.path.exists(temp_file):
    os.remove(temp_file)
    print("  已删除临时文件")

print("=" * 60)
print("完成!")