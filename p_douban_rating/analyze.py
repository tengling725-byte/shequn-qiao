import pandas as pd
df = pd.read_excel('C:/Workspace/opencode/p_douban_rating/豆瓣评分1_Sophie_20260409.xlsx')
cols = df.columns.tolist()
col_user = cols[3]
col_douban = cols[4]

print('=== 用户评分分布 ===')
print(df[col_user].value_counts().sort_index())

print('\n=== 豆瓣评分分布 ===')
df_douban = df[df[col_douban] != '未评分'][col_douban]
print(df_douban.value_counts().sort_index())

print(f'\n=== 总计 ===')
print(f"总电影数: {len(df)}")

high5 = df[df[col_user] == 5]
high4 = df[df[col_user] == 4]
print(f"5星: {len(high5)}部 ({len(high5)/len(df)*100:.1f}%)")
print(f"4星: {len(high4)}部 ({len(high4)/len(df)*100:.1f}%)")