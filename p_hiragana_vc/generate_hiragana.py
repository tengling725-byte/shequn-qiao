# -*- coding: utf-8 -*-
import json

with open('C:/Workspace/opencode/p_hiragana/kata-hiragana-deepseek.json', 'r', encoding='utf-8') as f:
    kata_list = json.load(f)

with open('C:/Workspace/opencode/p_hiragana/kata-hiragana-deepseek.js', 'w', encoding='utf-8') as f:
    f.write('const kataHiraganaData = [\n')
    for i, item in enumerate(kata_list):
        katakana = item.get('katakana', '')
        meaning = item.get('meaning', '')
        example_jp = item.get('exampleJP', '')
        example_cn = item.get('exampleCN', '')
        if i > 0:
            f.write(',\n')
        f.write(f'  {{ katakana: "{katakana}", meaning: "{meaning}", exampleJP: "{example_jp}", exampleCN: "{example_cn}" }}')
    f.write('\n];\n\n')
    f.write('export { kataHiraganaData };')

print('生成完成')