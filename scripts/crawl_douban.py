#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
豆瓣用户观影记录爬虫
爬取指定用户的看过影视作品及评分
"""

import requests
from bs4 import BeautifulSoup
import time
import re
import json

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

def get_movies_from_page(url):
    """获取单页电影列表"""
    movies = []
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 查找所有电影条目
        items = soup.select('[class*="item"]')
        for item in items:
            try:
                title_elem = item.select_one('[class*="title"]')
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                
                # 获取评分 - 查找包含评分的元素
                rating_elem = item.select_one('[class*="rating"]')
                rating_text = ""
                if rating_elem:
                    rating_text = rating_elem.get_text(strip=True)
                
                # 尝试从数据中获取评分
                rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                rating = rating_match.group(1) if rating_match else "未评分"
                
                # 获取链接
                link_elem = item.select_one('a')
                movie_url = link_elem.get('href', '') if link_elem else ''
                
                if title and movie_url:
                    movies.append({
                        'title': title,
                        'rating': rating,
                        'url': movie_url
                    })
            except Exception as e:
                print(f"解析电影条目失败: {e}")
                continue
        
        # 获取下一页链接
        next_link = soup.select_one('a[class*="next"]')
        next_url = next_link.get('href', '') if next_link else None
        
        return movies, next_url
        
    except Exception as e:
        print(f"请求页面失败: {e}")
        return [], None

def get_user_movies(user_id):
    """获取用户所有看过的电影"""
    base_url = f"https://movie.douban.com/people/{user_id}/collect"
    all_movies = []
    page = 0
    
    while True:
        url = base_url if page == 0 else f"{base_url}?start={page * 15}&sort=time&type=all&filter=all&mode=grid"
        print(f"正在获取第 {page + 1} 页...")
        
        movies, next_url = get_movies_from_page(url)
        
        if not movies:
            break
            
        all_movies.extend(movies)
        print(f"已获取 {len(all_movies)} 部电影")
        
        if not next_url or len(movies) < 15:
            break
            
        page += 1
        time.sleep(1)  # 避免请求过快
    
    return all_movies

def generate_html(movies, output_file="movies.html"):
    """生成HTML文件展示电影和评分"""
    html_content = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>豆瓣观影记录</title>
    <style>
        body { font-family: "Microsoft YaHei", Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        h1 { text-align: center; color: #333; }
        .movie-list { max-width: 800px; margin: 0 auto; }
        .movie-item { 
            background: white; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .movie-title { font-size: 16px; color: #333; }
        .rating { 
            display: flex; 
            gap: 2px;
        }
        .star { 
            width: 16px; 
            height: 16px; 
            display: inline-block;
            background: #ccc;
            border-radius: 2px;
        }
        .star.yellow { background: #ffb400; }
        .no-rating { color: #999; font-size: 14px; }
        .count { text-align: center; color: #666; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>豆瓣观影记录</h1>
    <div class="count">共 ''' + str(len(movies)) + ''' 部影视作品</div>
    <div class="movie-list">
'''
    
    for movie in movies:
        rating = float(movie['rating']) if movie['rating'] != "未评分" else 0
        yellow_stars = int(rating)
        
        if rating > 0:
            stars_html = '<div class="rating">'
            for i in range(5):
                if i < yellow_stars:
                    stars_html += '<span class="star yellow"></span>'
                else:
                    stars_html += '<span class="star"></span>'
            stars_html += f' <span style="margin-left:5px;color:#666;">{rating}</span></div>'
        else:
            stars_html = '<span class="no-rating">未评分</span>'
        
        html_content += f'''
        <div class="movie-item">
            <span class="movie-title">{movie['title']}</span>
            {stars_html}
        </div>
'''
    
    html_content += '''
    </div>
</body>
</html>
'''
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"已生成HTML文件: {output_file}")

def main():
    user_id = "203754450"  # 简单即效率
    
    print(f"正在爬取用户 {user_id} 的观影记录...")
    movies = get_user_movies(user_id)
    
    print(f"共获取 {len(movies)} 部电影")
    
    # 生成HTML
    generate_html(movies, "douban_movies.html")
    
    # 同时输出JSON备用
    with open("movies.json", 'w', encoding='utf-8') as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)
    
    print("完成!")

if __name__ == "__main__":
    main()
