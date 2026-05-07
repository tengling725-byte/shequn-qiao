# -*- coding: utf-8 -*-
import json
import re

data = []
current_category = ""

with open('C:/Workspace/opencode/p_hiragana/假名deepseek.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines[2:]:
    line = line.strip()
    if not line:
        continue
    
    # 跳过分类标题
    if re.match(r'^\d+\. ', line):
        current_category = line
        continue
    
    # 跳过空表头行
    if line.startswith('符号'):
        continue
    
    # 解析数据行
    parts = line.split('\t')
    if len(parts) >= 4:
        katakana = parts[0].strip()
        meaning = parts[1].strip()
        example_jp = parts[3].strip() if len(parts) > 3 else ""
        example_cn = parts[4].strip() if len(parts) > 4 else ""
        
        data.append({
            "katakana": katakana,
            "meaning": meaning,
            "exampleJP": example_jp,
            "exampleCN": example_cn
        })

with open('C:/Workspace/opencode/p_hiragana/kata-hiragana-deepseek.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'生成完成，共 {len(data)} 条')