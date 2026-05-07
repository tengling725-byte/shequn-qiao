# -*- coding: utf-8 -*-
import json

# 读取kanji.json
with open('C:/Workspace/opencode/p_hiragana/kanji.json', 'r', encoding='utf-8') as f:
    kanji_list = json.load(f)

# 读取kata-attach.json
with open('C:/Workspace/opencode/p_hiragana/kata-attach.json', 'r', encoding='utf-8') as f:
    kata_list = json.load(f)

# 生成JS文件
with open('C:/Workspace/opencode/p_hiragana/vocab_data.js', 'w', encoding='utf-8') as f:
    # 写入汉字数据
    f.write('const kanjiData = [\n')
    for i, item in enumerate(kanji_list):
        kanji = item.get('kanji', '')
        meaning_jp = item.get('meaningJP', '')
        meaning_cn = item.get('meaningCN', '')
        if i > 0:
            f.write(',\n')
        f.write(f'  {{ kanji: "{kanji}", meaningJP: "{meaning_jp}", meaningCN: "{meaning_cn}" }}')
    f.write('\n];\n\n')

    # 写入假名黏附词数据
    f.write('const kataAttachData = [\n')
    for i, item in enumerate(kata_list):
        katakana = item.get('katakana', '')
        meaning = item.get('meaning', '')
        example_jp = item.get('exampleJP', '')
        example_cn = item.get('exampleCN', '')
        if i > 0:
            f.write(',\n')
        f.write(f'  {{ katakana: "{katakana}", meaning: "{meaning}", exampleJP: "{example_jp}", exampleCN: "{example_cn}" }}')
    f.write('\n];\n\n')

    f.write('export { kanjiData, kataAttachData };')

print('生成完成')