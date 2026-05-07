import pandas as pd

df = pd.read_excel(r'C:\Workspace\opencode\douban_rating\豆瓣收藏电影_评分标识3.xlsx')

df['中文名'] = df['电影名'].apply(lambda x: x.split(' / ')[0] if pd.notna(x) else '')

three_char = df[df['中文名'].str.len() == 3]

print(f'共找到 {len(three_char)} 部三个字的电影：')
for _, row in three_char.iterrows():
    print(row['中文名'], '- 评分:', row['打分'])