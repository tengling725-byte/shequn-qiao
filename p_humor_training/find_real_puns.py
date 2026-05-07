# 搜索真正符合"稻草"类型双关的句子
# 特点：同一词在句中出现两次，含义完全不同（可能是不同成语/俗语）

import re

with open(r'C:\Workspace\opencode\all_jokes.txt', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# 关键词：成语、俗语中的常见词
target_words = ['稻草', '救命', '压死', '骆驼', '凤凰', '鸡', '蛋', '鸡', '狗', '血', '风水', 
                '江山', '江山', '天堂', '地狱', '阎王', '鬼', '神', '仙', '龙', '凤', '虎', 
                '蛇', '鼠', '猫', '鱼', '虾', '蟹', '龟', '鳖', '猪', '牛', '马', '羊', '猴',
                '钱', '财', '金', '银', '玉', '石', '山', '水', '火', '风', '雨', '雪', '霜',
                '日', '月', '星', '天', '地', '海', '河', '湖', '江', '城', '村', '乡', '镇',
                '路', '桥', '门', '窗', '墙', '楼', '房', '屋', '家', '国', '民', '官', '商',
                '兵', '将', '帅', '王', '皇', '帝', '君', '臣', '子', '父', '母', '夫', '妻',
                '兄', '弟', '姐', '妹', '夫', '妇', '翁', '婿', '婆', '媳', '爷', '奶', '姥',
                '祖', '孙', '叔', '舅', '姨', '姑', '侄', '甥']

results = []

for line in lines:
    if not line.strip() or not line[0].isdigit():
        continue
    line = line.strip()
    
    # 搜索包含目标词的句子
    for word in target_words:
        if line.count(word) >= 2:
            results.append(f"句子: {line[:100]}")
            results.append(f"  关键词: {word}")
            results.append("")

with open(r'C:\Workspace\opencode\puns_output2.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results[:50]))

print("Done")