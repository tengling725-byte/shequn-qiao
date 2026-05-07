import os
import re
import string
import time
import shutil
import pandas as pd
from datetime import datetime
from flask import Flask, request, render_template_string, send_file, redirect, url_for
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
app.secret_key = "douban_rating_tool"

# 临时文件夹
TEMP_FOLDER = "temp_download"
os.makedirs(TEMP_FOLDER, exist_ok=True)

# 网页界面模板
HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>豆瓣评分爬虫工具</title>
    <style>
        body { max-width: 600px; margin: 30px auto; font-family: Arial; }
        .box { padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
        input, select, button { width: 100%; padding: 10px; margin: 8px 0; box-sizing: border-box; font-size: 16px; }
        button { background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .tip { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="box">
        <h2>豆瓣看过/收藏影视抓取工具</h2>
        <form method="POST" action="/run">
            <label>豆瓣页面 URL：</label>
            <input type="text" name="douban_url" placeholder="例如：https://movie.douban.com/people/xxx/collect" required>

            <label>是否存档网页源码？</label>
            <select name="save_html">
                <option value="no" selected>No（默认）</option>
                <option value="yes">Yes</option>
            </select>

            <button type="submit">开始抓取</button>
        </form>
        <p class="tip">运行后会生成 Excel 文件，可直接下载</p>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_PAGE)

@app.route('/run', methods=['POST'])
def run():
    douban_url = request.form.get('douban_url', '').strip()
    save_html_flag = request.form.get('save_html', 'no').lower()

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        # ========== 1. 先拿第一页，获取用户信息 ==========
        resp_first = requests.get(douban_url, headers=headers, params={"start": 0}, timeout=10)
        soup_first = BeautifulSoup(resp_first.text, "html.parser")

        title_text = soup_first.find("title").get_text(strip=True)

        # 用户名
        rating_user = title_text.split("看过的影视")[0].strip()
        rating_user = ''.join(ch for ch in rating_user if ch not in string.punctuation).replace(' ', '')

        # 总数
        num_part = re.search(r'\((\d+)\)', title_text)
        rating_number = int(num_part.group(1)) if num_part else 0

        # 自动生成页码
        start_list = []
        s = 0
        while s < rating_number:
            start_list.append(s)
            s += 15

        # ========== 2. 准备存档文件夹 ==========
        save_dir = None
        if save_html_flag == "yes":
            save_dir = os.path.join(TEMP_FOLDER, f"html_{rating_user}")
            os.makedirs(save_dir, exist_ok=True)

        # ========== 3. 开始爬数据 ==========
        result_data = []
        index = 1

        for start in start_list:
            params = {"start": start, "sort": "time", "type": "all", "filter": "all", "mode": "grid"}
            resp = requests.get(douban_url, headers=headers, params=params, timeout=10)
            soup = BeautifulSoup(resp.text, "html.parser")
            items = soup.find_all("div", class_="item")

            # 存档当前页
            if save_html_flag == "yes" and save_dir:
                page_file = os.path.join(save_dir, f"page_{start}.html")
                with open(page_file, "w", encoding="utf-8") as f:
                    f.write(resp.text)

            for item in items:
                title_tag = item.find("li", class_="title")
                em_tag = title_tag.find("em") if title_tag else None
                movie_title = em_tag.get_text(strip=True) if em_tag else "未知"

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

                comment_tag = item.find("span", class_="comment")
                rating_comment = comment_tag.get_text(strip=True) if comment_tag else "无短评"

                result_data.append({
                    "序号": index,
                    "用户名": rating_user,
                    "总数量": rating_number,
                    "电影名": movie_title,
                    "打分": rating_score,
                    "短评": rating_comment
                })
                index += 1

            time.sleep(1)

        # ========== 4. 生成 Excel ==========
        today_str = datetime.now().strftime("%Y%m%d")
        excel_filename = f"豆瓣评分_{rating_user}_{today_str}.xlsx"
        excel_path = os.path.join(TEMP_FOLDER, excel_filename)

        df = pd.DataFrame(result_data)
        df.to_excel(excel_path, index=False)

        # ========== 5. 打包网页（如果需要） ==========
        zip_path = None
        if save_html_flag == "yes" and save_dir:
            zip_path = os.path.join(TEMP_FOLDER, f"网页存档_{rating_user}")
            shutil.make_archive(zip_path, 'zip', save_dir)
            zip_path += ".zip"

        # ========== 6. 跳转到下载页 ==========
        download_url = url_for(
            'download_page',
            excel=excel_filename,
            zip_file=os.path.basename(zip_path) if zip_path else ''
        )
        return redirect(download_url)

    except Exception as e:
        return f"出错：{str(e)}"

@app.route('/download')
def download_page():
    excel_name = request.args.get('excel', '')
    zip_name = request.args.get('zip_file', '')

    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>抓取完成</title>
        <style>
            body{max-width:600px;margin:30px auto;font-family:Arial}
            .box{padding:20px;border:1px solid #ccc;border-radius:8px}
            a{display:block;padding:12px;background:#2196F3;color:white;text-decoration:none;margin:10px 0;text-align:center;border-radius:4px}
        </style>
    </head>
    <body>
        <div class="box">
            <h2>✅ 抓取完成</h2>
            <a href="/download_file/Excel/{{excel_name}}">下载 Excel 文件</a>
            {% if zip_name and zip_name != '' %}
                <a href="/download_file/Zip/{{zip_name}}">下载网页存档.zip</a>
            {% endif %}
            <br>
            <a href="/">返回首页再抓一次</a>
        </div>
    </body>
    </html>
    """
    return render_template_string(html, excel_name=excel_name, zip_name=zip_name)

@app.route('/download_file/<typ>/<filename>')
def download_file(typ, filename):
    path = os.path.join(TEMP_FOLDER, filename)
    return send_file(path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)