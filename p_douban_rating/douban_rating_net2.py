import os
import re
import string
import time
import pandas as pd
from datetime import datetime
from flask import Flask, request, Response, send_file
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
os.makedirs("downloads", exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.douban.com/",
    "Cookie": "dbcl2=1279449:V1u34e0uyEU;"
}

# 首页表单
@app.route('/')
def index():
    return '''
<!DOCTYPE html>
<meta charset="utf-8">
<title>豆瓣抓取工具</title>
<style>
    body{max-width:600px;margin:40px auto;font-family:Arial}
    .box{padding:25px;border:1px solid #ddd;border-radius:10px}
    input,select,button{width:100%;padding:10px;margin:10px 0;box-sizing:border-box}
    button{background:#009966;color:white;border:none;border-radius:6px;font-size:16px}
</style>
<div class="box">
    <h2>豆瓣看过影视抓取</h2>
    <form action="/crawl" method="post" target="_blank">
        <label>豆瓣页面URL用户名：</label>
        <input type="text" name="url" required>

        <label>是否存档网页：</label>
        <select name="save_html">
            <option value="no" selected>No</option>
            <option value="yes">Yes</option>
        </select>

        <button type="submit">开始抓取（新开页面）</button>
    </form>
</div>
'''

# 核心：一边爬一边输出 HTML
@app.route('/crawl', methods=['POST'])
def crawl():
    url = request.form['url']
    save_html = request.form['save_html']

    def generate():
        # 先输出页面头部
        yield '''
<!DOCTYPE html>
<meta charset="utf-8">
<title>实时爬取进度</title>
<style>
    body{font-family:Arial;max-width:900px;margin:20px auto}
    .item{border-bottom:1px solid #eee;padding:10px 0}
    .page{background:#f0f8ff;padding:10px;margin:15px 0;border-left:4px solid #009966}
    .done{color:green;font-weight:bold;font-size:18px}
    a{display:inline-block;background:#009966;color:white;padding:10px 15px;text-decoration:none;border-radius:6px;margin-top:20px}
</style>
<h1>✅ 实时爬取中...</h1>
'''

        # ========== 第一步：获取用户信息 ==========
        resp_first = requests.get(url, params={"start":0}, headers=headers)
        soup_first = BeautifulSoup(resp_first.text, "html.parser")
        title_text = soup_first.find("title").get_text(strip=True)

        # 用户名
        rating_user = title_text.split("看过的影视")[0].strip()
        rating_user = ''.join(ch for ch in rating_user if ch not in string.punctuation).replace(' ', '')

        # 总数
        match = re.search(r'\((\d+)\)', title_text)
        if match:
            total = int(match.group(1))
        else:
            total = 0  # 找不到就默认0，不崩溃
        yield f"<h3>用户：{rating_user} | 数组：{title_text} | 总数：{total}</h3>"

        # 页码

        starts = []
        s = 0
        while s < total:
            starts.append(s)
            s += 15

        all_data = []

        # ========== 逐页爬 + 实时输出 ==========
        for idx, start in enumerate(starts, 1):
            yield f"<div class='page'>📄 第 {idx}/{len(starts)} 页（start={start}）</div>"

            resp = requests.get(url, params={"start": start}, headers=headers)
            soup = BeautifulSoup(resp.text, "html.parser")
            items = soup.find_all("div", class_="item")

            for item in items:
                em = item.find("em")
                movie = em.get_text(strip=True) if em else "未知"

                score = "未打分"
                if item.find("span", class_="rating1-t"): score = "1"
                elif item.find("span", class_="rating2-t"): score = "2"
                elif item.find("span", class_="rating3-t"): score = "3"
                elif item.find("span", class_="rating4-t"): score = "4"
                elif item.find("span", class_="rating5-t"): score = "5"

                cmt = item.find("span", class_="comment")
                comment = cmt.get_text(strip=True) if cmt else "无短评"

                all_data.append({
                    "电影名": movie,
                    "打分": score,
                    "短评": comment
                })

                # ========== 关键：实时输出每一条 ==========
                yield f'''
<div class="item">
    <strong>{movie}</strong><br>
    评分：{score} &nbsp;&nbsp; 短评：{comment}
</div>
'''

            time.sleep(1)

        # ========== 爬完了，生成 Excel ==========
        yield "<h2 class='done'>✅ 全部爬取完成！</h2>"

        today = datetime.now().strftime("%Y%m%d")
        excel_name = f"豆瓣评分_{rating_user}_{today}.xlsx"
        excel_path = os.path.join("downloads", excel_name)
        pd.DataFrame(all_data).to_excel(excel_path, index=False)

        # 下载按钮
        yield f'<a href="/download/{excel_name}">下载 Excel 文件</a>'

    return Response(generate(), mimetype='text/html')

# 下载
@app.route('/download/<filename>')
def download(filename):
    return send_file(f"downloads/{filename}", as_attachment=True)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
    