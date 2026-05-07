# -*- coding: utf-8 -*-
import os
import csv

root = r"C:\Users\Sophie\Desktop\message_备份_2016到202604171533\wechat_chats"

# 搜索滕岭在各群中的发言
# 根据之前contact信息，滕岭相关的群包括：
# - 滕岭女士VIP服务群｜北京房产壹姐
# - TENG LING滕岭LOU合约讲解群
# - 滕岭一对一约课群
# - 滕岭李正十工作群-AI作文
# 等

# 让我看看group_文件中关于滕岭的内容
group_files = [f for f in os.listdir(os.path.join(root, "group_")) if f.endswith(".csv")]

tengling_groups = []
for gf in group_files:
    path = os.path.join(root, "group_", gf)
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            content = f.read()
            if "滕岭" in content:
                tengling_groups.append(gf)
    except:
        pass

print("=== 滕岭相关的群 ===")
for g in tengling_groups:
    print(g)

# 统计滕岭在contact中的信息
print("\n=== 滕岭基本信息 ===")
contact_file = os.path.join(root, "contact解密并推测.csv")
with open(contact_file, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) > 2 and "滕岭" in str(row):
            print(row)