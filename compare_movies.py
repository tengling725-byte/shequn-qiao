import pandas as pd

df1 = pd.read_excel('p_douban_rating/豆瓣评分1_Sophie_20260409.xlsx')
df2 = pd.read_excel('豆瓣评分_MrFrankL_20260411.xlsx')

sophie_data = df1.iloc[:, [2, 4]].copy()
sophie_data.columns = ['name', 'score1']

mrfrankl_data = df2.iloc[:, [2, 4]].copy()
mrfrankl_data.columns = ['name', 'score2']

sophie_data['clean'] = sophie_data['name'].astype(str).str.strip()
mrfrankl_data['clean'] = mrfrankl_data['name'].astype(str).str.strip()

common = pd.merge(sophie_data, mrfrankl_data, on='clean', how='inner', suffixes=('_s', '_m'))

import codecs
with codecs.open('result.txt', 'w', encoding='utf-8') as f:
    f.write('共同影视数量: ' + str(len(common)) + '\n\n')
    for i in range(len(common)):
        n = common.iloc[i]['name_s']
        s1 = common.iloc[i]['score1']
        s2 = common.iloc[i]['score2']
        f.write(f'{n} | Sophie: {s1} | MrFrankL: {s2}\n')

# 注释掉Excel生成
# result = common[['name_s', 'score1', 'score2']].copy()
# result.columns = ['影视名', 'Sophie评分', 'MrFrankL评分']
# result.to_excel('共同影视.xlsx', index=False)