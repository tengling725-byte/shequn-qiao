import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import string
import os
from datetime import datetime

# 基础配置
# =========================
# 1. 命令行输入豆瓣地址
# =========================
base_url = input("请输入豆瓣用户页面URL：").strip()
# base_url = "https://movie.douban.com/people/211396864/collect"

# =========================
# 2. 询问是否存档网页
# =========================
save_html = input("是否存档网页源码？(y/n)：").strip().lower()

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.douban.com/",
    "Cookie": "dbcl2=1279449:V1u34e0uyEU;"
}

# =========================
# 第一步：从 title 提取信息（100% 不报错）
# =========================
resp_first = requests.get(base_url, headers=headers, params={"start": 0})
soup_first = BeautifulSoup(resp_first.text, "html.parser")

filedate = pd.Timestamp.now().strftime('%Y%m%d')

# 提取：Mr. Frank L看过的影视(65)
title_text = soup_first.find("title").get_text(strip=True)

# 拆分用户名
rating_user = title_text.split("看过的影视")[0].strip()
rating_file = rating_user.replace(".", "").replace(" ", "")

# 拆分总数 65
rating_number = int(title_text[title_text.find("(")+1 : title_text.find(")")])

print("===== 提取成功 =====")
print("用户：", rating_user)
print("总数：", rating_number)

# =========================
# 如果要存档：创建目录并保存
# =========================
if save_html == "y":
    save_dir = rating_user
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    # 保存第一页
    with open(f"{save_dir}/page_0.html", "w", encoding="utf-8") as f:
        f.write(resp_first.text)


# 自动生成页码
start_list = []
s = 0
while s < rating_number:
    start_list.append(s)
    s += 15

print("爬取页面：", start_list)

# =========================
# 第二步：开始爬所有电影
# =========================
result_data = []
index = 1

for start in start_list:
    print(f"正在爬取第 {start//15 + 1} 页")
    params = {"start": start, "sort": "time", "type": "all", "filter": "all", "mode": "grid"}
    resp = requests.get(base_url, headers=headers, params=params)
    soup = BeautifulSoup(resp.text, "html.parser")
    items = soup.find_all("div", class_="item")

    # 存档当前页
    if save_html == "y":
        with open(f"{rating_user}/page_{start}.html", "w", encoding="utf-8") as f:
            f.write(resp.text)

    for item in items:
        # 电影名
        title_tag = item.find("li", class_="title")
        em_tag = title_tag.find("em") if title_tag else None
        movie_title = em_tag.get_text(strip=True) if em_tag else "未知"

        # 评分
        rating_score = "未打分"
        if item.find("span", class_="rating1-t"):
            rating_score = "1"
        elif item.find("span", class_="rating2-t"):
            rating_score = "2"
        elif item.find("span", class_="rating3-t"):
            rating_score = "3"
        elif item.find("span", class_="rating4-t"):
            rating_score = "4"
        elif item.find("span", class_="rating5-t"):
            rating_score = "5"

        # 短评
        comment_tag = item.find("span", class_="comment")
        rating_comment = comment_tag.get_text(strip=True) if comment_tag else "无"

        # 日期
        date_tag = item.find("span", class_="date")
        rating_date = date_tag.get_text(strip=True) if date_tag else "无日期"

        result_data.append({
            "序号": index,
            "用户名": rating_user,
            "电影名": movie_title,
            "打分日": rating_date,
            "打分": rating_score,
            "短评": rating_comment,
            "下载日": filedate
        })
        index += 1

    time.sleep(1)

# 导出 Excel
df = pd.DataFrame(result_data)
df.to_excel(f"豆瓣评分_{rating_file}_{filedate}.xlsx", index=False)
print("\n完成!")