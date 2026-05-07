import requests
from bs4 import BeautifulSoup
import pandas as pd  # 用于生成表格/Excel
import time

# 基础配置
base_url = "https://movie.douban.com/people/211396864/collect"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# ======================
# 第一步：先拿用户名 + 总数，自动算页数
# ======================
print("===== 先获取用户信息 & 总页数 =====")
resp_first = requests.get(base_url, params={"start": 0}, headers=headers)
soup_first = BeautifulSoup(resp_first.text, "html.parser")

# 提取用户名、总数
h2_text = soup_first.find("h2").get_text(strip=True)
rating_user = h2_text.split("看过")[0].strip()
rating_number = int(soup_first.find("h2").find("span").get_text(strip=True))

print("用户:", rating_user)
print("总电影数:", rating_number)

start_list = [0, 15, 30, 45, 60]  # 所有要爬的页面


# 存储结果的列表
result_data = []
index = 1  # 序号

print("======代码开始运行========")

# 逐页爬取
for start in start_list:
    print(f"===== 正在抓取第 {start//15 + 1} 页 =====")
    params = {
        "start": start,
        "sort": "time",
        "type": "all",
        "filter": "all",
        "mode": "grid"
    }
    
    resp = requests.get(base_url, params=params, headers=headers)
    soup = BeautifulSoup(resp.text, "html.parser")
    items = soup.find_all("div", class_="item")
    
    for item in items:
        # 提取电影名（只取 <em> 标签里的中文原名）
        title_tag = item.find("li", class_="title").find("em")
        movie_title = title_tag.get_text(strip=True) if title_tag else "未知电影"
        
        # 提取 rating1-t 标识（判断是否存在该 class）
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
        else:
            rating_score = "未打分"
        
         
        rating_comment = "无评论"
        comment_tag = item.find("span", class_="comment")
        if comment_tag:
            rating_comment = comment_tag.get_text(strip=True)
        
        # 存入列表
        result_data.append({
            "序号": index,
            "电影名": movie_title,
            "打分": rating_score,
            "短评": rating_comment
        })
        index += 1
    
    time.sleep(1)  # 避免爬取过快

# 生成表格（DataFrame）
df = pd.DataFrame(result_data)

# 1. 打印到控制台（清晰表格格式）
print("\n===== 所有页面提取结果 =====")
print(df.to_string(index=False))

# 2. 导出到 Excel（保存到当前文件夹，叫「豆瓣收藏电影_评分标识.xlsx」）
# df.to_excel("豆瓣收藏电影_评分标识3.xlsx", index=False)
print("\n✅ Excel 表格已生成！文件名为：豆瓣收藏电影_评分标识.xlsx")