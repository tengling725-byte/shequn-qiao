# -*- coding: utf-8 -*-
import json

# 解析成语数据
chengyu_data = []

with open(r"C:\Workspace\opencode\p_成语填空\成语.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

current_type = ""
for line in lines:
    line = line.strip()
    if not line:
        continue
    if "敬辞" in line:
        current_type = "敬辞"
        continue
    if "谦辞" in line:
        current_type = "谦辞"
        continue
    
    # 匹配格式: "1、xxx：xxx"
    if "、" in line and "：" in line:
        parts = line.split("、", 1)
        if len(parts) >= 2:
            num = parts[0].strip()
            content = parts[1].strip()
            if "：" in content:
                idx = content.index("：")
                chengyu = content[:idx].strip()
                shiyi = content[idx+1:].strip()
                if len(chengyu) >= 4:  # 只取4字成语
                    chengyu_data.append({
                        "chengyu": chengyu,
                        "shiyi": shiyi,
                        "type": current_type
                    })

print(f"共解析 {len(chengyu_data)} 个成语")

# 保存为JSON
with open(r"C:\Workspace\opencode\p_成语填空\成语库.json", "w", encoding="utf-8") as f:
    json.dump(chengyu_data, f, ensure_ascii=False, indent=2)

# 显示前5个
for i, c in enumerate(chengyu_data[:5]):
    print(f"{i+1}. {c['chengyu']} - {c['shiyi']}")