# -*- coding: utf-8 -*-
import re

with open(r'C:\Workspace\opencode\all_jokes.txt', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

stop_words = set(['的', '了', '是', '在', '有', '和', '就', '不', '也', '都', '要', '会', '能', 
    '我', '你', '他', '她', '它', '这', '那', '一', '个', '来', '去', '上', '下', '为', '之', 
    '以', '而', '但', '或', '与', '及', '被', '把', '让', '给', '向', '从', '到', '着', '过', 
    '得', '地', '吗', '呢', '吧', '啊', '呀', '么', '什么', '怎么', '如果', '因为', '所以', 
    '但是', '可以', '没有', '不是', '自己', '我们', '他们', '这样', '那样', '还', '很', '太', 
    '更', '最', '真', '就是', '已经', '其实', '只是', '这么', '那么', '只是', '可以', '这个',
    '那个', '一个', '所以', '不会', '知道', '觉得', '看到', '想要', '一样', '一点', '一些', 
    '不能', '只有', '时候', '地方', '没', '多', '每', '两', '跟', '说', '让', '把', '看', '做'])

results = []

for line in lines:
    if not line.strip() or not line[0].isdigit():
        continue
    line = line.strip()
    words = re.findall(r'[\u4e00-\u9fa5]{2,}', line)
    word_count = {}
    for word in words:
        if word not in stop_words:
            word_count[word] = word_count.get(word, 0) + 1
    for word, count in word_count.items():
        if count >= 2:
            results.append(f"句子: {line[:80]}")
            results.append(f"  重复词: {word} (出现{count}次)")
            results.append("")

with open(r'C:\Workspace\opencode\puns_output.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))