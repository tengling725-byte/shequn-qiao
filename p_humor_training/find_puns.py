# Find semantic puns - same word appears twice with different meanings

results = []

# Line 18 - confirmed
results.append("18. 避孕的效果：不成功，便成人")
results.append("  - success: 避孕成功 / become adult")

# Line 21 - confirmed
results.append("21. 多操喜欢的人，少操没用的心")
results.append("  - cao (like): 喜欢 / cao (worry): 操心")

# Continue searching...

with open(r'C:\Workspace\opencode\all_jokes.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

import re

found = []

for i, line in enumerate(lines):
    if line.startswith('===') or not line.strip() or not line[0].isdigit():
        continue
    
    if '18.' in line or '21.' in line:
        continue
        
    line = line.strip()
    if not line:
        continue
    
    words = line.split()
    for word in words:
        word = re.sub(r'[^一-龥]', '', word)
        if len(word) >= 2:
            count = line.count(word)
            if count >= 2:
                found.append(f"{line[:80]}... | word: {word}")

for f in found[:50]:
    print(f)