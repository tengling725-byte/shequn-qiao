import os
import re
import string
import time
import zipfile
import io
import pandas as pd
from datetime import datetime
from flask import Flask, request, Response, send_file
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.douban.com/",
    "Cookie": "dbcl2=1279449:V1u34e0uyEU;"
}

@app.route('/')
def index():
    return '''
<!DOCTYPE html>
<meta charset="utf-8">
<title>豆瓣观影评分抓取与对比工具</title>
<style>
    body{max-width:700px;margin:40px auto;font-family:Arial,Helvetica,sans-serif}
    .box{padding:25px;border:1px solid #ddd;border-radius:10px;margin-bottom:20px}
    input,select,button{width:100%;padding:10px;margin:8px 0;box-sizing:border-box}
    button{background:#009966;color:white;border:none;border-radius:6px;font-size:16px;cursor:pointer}
    button:hover{background:#008855}
    button:disabled{background:#ccc;cursor:not-allowed}
    .toggle{color:#009966;cursor:pointer;text-decoration:underline;margin:10px 0;display:inline-block}
    .hidden{display:none}
    h2{color:#333;margin-top:0}
    h3{color:#666;font-size:14px}
    .section-title{font-weight:bold;margin-bottom:15px;display:block}
    .checkbox-row{display:flex;align-items:center;margin:10px 0}
    .checkbox-row input{width:auto;margin:0 10px 0 0}
    .tips{font-size:12px;color:#888;margin-top:5px}
    .result-box{margin-top:20px;padding:15px;background:#f5f5f5;border-radius:8px}
    .error{color:#d00;background:#fee}
    .success{color:#090;background:#efe}
</style>
<div class="box">
    <h2>🎬 豆瓣观影评分抓取与对比工具</h2>
    <p style="color:#666;font-size:14px">本地运行 · 安全高效</p>
    
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
    <span class="section-title">📌 模块一：单个用户评分抓取</span>
    
    <form action="/crawl" method="post" target="_blank">
        <label>输入方式：</label>
        <div style="display:flex;gap:20px;margin:10px 0">
            <label><input type="radio" name="input_type1" value="url" checked onclick="toggleInput1('url')"> 已看电影页面链接</label>
            <label><input type="radio" name="input_type1" value="id" onclick="toggleInput1('id')"> 用户ID</label>
        </div>
        
        <div id="url_input1">
            <input type="text" id="url1" name="url" placeholder="请输入豆瓣“已看电影”页面完整链接，如：https://movie.douban.com/people/12345678/collect">
        </div>
        <div id="id_input1" class="hidden">
            <input type="text" id="userid1" name="user_id" placeholder="请输入豆瓣用户ID（纯数字，如：12345678）">
        </div>
        
        <div class="checkbox-row">
            <input type="checkbox" name="save_html" value="yes" id="save_html1">
            <label for="save_html1">保存原始HTML文件（可选）</label>
        </div>
        <div class="checkbox-row">
            <input type="checkbox" name="export_excel" value="yes" checked id="export_excel1" disabled>
            <label for="export_excel1" style="color:#666">导出Excel文件（默认勾选）</label>
        </div>
        
        <button type="submit" id="btn1">开始抓取</button>
        <button type="button" onclick="clearForm1()" style="background:#666;margin-top:10px">清空输入</button>
    </form>
</div>

<div class="box">
    <span class="section-title">📌 模块二：两个用户观影对比</span>
    <span class="toggle" onclick="toggleModule2()">【展开对比】</span>
    
    <div id="module2" class="hidden">
        <form action="/compare" method="post" target="_blank">
            <div style="margin:15px 0;padding:15px;background:#f9f9f9;border-radius:8px">
                <strong>用户A：</strong>
                <div style="display:flex;gap:20px;margin:10px 0">
                    <label><input type="radio" name="input_type_a" value="url" checked onclick="toggleInputA('url')"> 链接</label>
                    <label><input type="radio" name="input_type_a" value="id" onclick="toggleInputA('id')"> ID</label>
                </div>
                <div id="url_input_a">
                    <input type="text" name="url_a" placeholder="用户A的已看电影页面链接">
                </div>
                <div id="id_input_a" class="hidden">
                    <input type="text" name="user_id_a" placeholder="用户A的ID">
                </div>
            </div>
            
            <div style="margin:15px 0;padding:15px;background:#f9f9f9;border-radius:8px">
                <strong>用户B：</strong>
                <div style="display:flex;gap:20px;margin:10px 0">
                    <label><input type="radio" name="input_type_b" value="url" checked onclick="toggleInputB('url')"> 链接</label>
                    <label><input type="radio" name="user_id_b_type" value="id" onclick="toggleInputB('id')"> ID</label>
                </div>
                <div id="url_input_b">
                    <input type="text" name="url_b" placeholder="用户B的已看电影页面链接">
                </div>
                <div id="id_input_b" class="hidden">
                    <input type="text" name="user_id_b" placeholder="用户B的ID">
                </div>
            </div>
            
            <div class="checkbox-row">
                <input type="checkbox" name="save_html2" value="yes" id="save_html2">
                <label for="save_html2">保存两人原始HTML文件（可选）</label>
            </div>
            <div class="checkbox-row">
                <input type="checkbox" name="export_all" value="yes" checked disabled>
                <label style="color:#666">导出全部Excel（默认勾选）</label>
            </div>
            <p class="tips">将导出：用户A单独Excel + 用户B单独Excel + 对比结果Excel</p>
            
            <button type="submit" id="btn2">开始对比</button>
            <button type="button" onclick="clearForm2()" style="background:#666;margin-top:10px">清空输入</button>
        </form>
    </div>
</div>

<div class="box">
    <span class="section-title">📌 模块三：手动Excel文件对比</span>
    <form action="/compare_excel" method="post" enctype="multipart/form-data">
        <div style="margin:15px 0;padding:15px;background:#f9f9f9;border-radius:8px">
            <strong>请上传两个Excel文件进行对比：</strong>
            <p>Excel文件需包含"电影名"和"用户个人评分"列</p>
            <div style="margin:10px 0">
                <label>用户A Excel文件：</label>
                <input type="file" name="file_a" accept=".xlsx,.xls" required>
            </div>
            <div style="margin:10px 0">
                <label>用户B Excel文件：</label>
                <input type="file" name="file_b" accept=".xlsx,.xls" required>
            </div>
        </div>
        <button type="submit">开始对比</button>
    </form>
</div>

<div class="box">
    <span class="section-title">📌 使用说明</span>
    <ul style="color:#666;font-size:14px;line-height:1.8">
        <li>支持输入豆瓣“已看电影”页面链接或用户ID</li>
        <li>链接格式：https://movie.douban.com/people/[用户ID]/collect</li>
        <li>数据仅保存在本地，不会上传至服务器</li>
    </ul>
    <p style="color:#888;font-size:12px">版本：V1.0</p>
</div>

<script>
function toggleInput1(type) {
    document.getElementById('url_input1').className = type === 'url' ? '' : 'hidden';
    document.getElementById('id_input1').className = type === 'id' ? '' : 'hidden';
}

function toggleInputA(type) {
    document.getElementById('url_input_a').className = type === 'url' ? '' : 'hidden';
    document.getElementById('id_input_a').className = type === 'id' ? '' : 'hidden';
}

function toggleInputB(type) {
    document.getElementById('url_input_b').className = type === 'url' ? '' : 'hidden';
    document.getElementById('id_input_b').className = type === 'id' ? '' : 'hidden';
}

let module2Expanded = false;
function toggleModule2() {
    module2Expanded = !module2Expanded;
    const m2 = document.getElementById('module2');
    const toggle = document.querySelector('.toggle');
    if (module2Expanded) {
        m2.className = '';
        toggle.textContent = '【收起对比】';
    } else {
        m2.className = 'hidden';
        toggle.textContent = '【展开对比】';
    }
}

function clearForm1() {
    document.getElementById('url1').value = '';
    document.getElementById('userid1').value = '';
    document.getElementById('save_html1').checked = false;
}

function clearForm2() {
    document.querySelector('input[name="url_a"]').value = '';
    document.querySelector('input[name="user_id_a"]').value = '';
    document.querySelector('input[name="url_b"]').value = '';
    document.querySelector('input[name="user_id_b"]').value = '';
    document.getElementById('save_html2').checked = false;
}
</script>
'''

@app.route('/crawl', methods=['POST'])
def crawl():
    url = request.form.get('url', '').strip()
    user_id = request.form.get('user_id', '').strip()
    save_html = request.form.get('save_html', 'no')
    export_excel = request.form.get('export_excel', 'yes')
    
    if user_id and not url:
        url = f"https://movie.douban.com/people/{user_id}/collect"
    
    if not url:
        return '<h2 style="color:red">请输入有效的链接或用户ID</h2><a href="/">返回</a>'
    
    def generate():
        yield '''
<!DOCTYPE html>
<meta charset="utf-8">
<title>实时爬取进度</title>
<style>
    body{font-family:Arial;max-width:900px;margin:20px auto}
    .item{border-bottom:1px solid #eee;padding:10px 0}
    .page{background:#f0f8ff;padding:10px;margin:15px 0;border-left:4px solid #009966}
    .done{color:green;font-weight:bold;font-size:18px}
    a{display:inline-block;background:#009966;color:white;padding:10px 15px;text-decoration:none;border-radius:6px;margin:5px}
    .error{color:red;padding:20px;background:#fee;border-radius:8px}
    h1{color:#333}
</style>
<h1>✅ 实时爬取中...</h1>
'''
        
        try:
            resp_first = requests.get(url, params={"start":0}, headers=headers, timeout=10)
            if resp_first.status_code != 200:
                yield f'<div class="error">❌ 请求失败，状态码：{resp_first.status_code}，请检查链接是否有效</div>'
                return
            
            soup_first = BeautifulSoup(resp_first.text, "html.parser")
            title_text = soup_first.find("title").get_text(strip=True)
            
            if "看过的影视" not in title_text:
                yield f'<div class="error">❌ 链接无效，请检查是否为豆瓣“已看电影”页面</div>'
                return
            
            rating_user = title_text.split("看过的影视")[0].strip()
            rating_user = ''.join(ch for ch in rating_user if ch not in string.punctuation).replace(' ', '')
            
            match = re.search(r'\((\d+)\)', title_text)
            total = int(match.group(1)) if match else 0
            yield f"<h3>用户：{rating_user} | 总数：{total} 部影视</h3>"
            
            if save_html == 'yes':
                html_name = f"{rating_user}_{datetime.now().strftime('%Y%m%d')}.html"
                html_path = os.path.join(DOWNLOADS_DIR, html_name)
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(resp_first.text)
                yield f"<p>✅ 已保存原始HTML：<a href='/download/{html_name}'>{html_name}</a></p>"
            
            starts = list(range(0, total, 15))
            all_data = []
            
            for idx, start in enumerate(starts, 1):
                yield f"<div class='page'>📄 第 {idx}/{len(starts)} 页（start={start}）</div>"
                
                resp = requests.get(url, params={"start": start}, headers=headers, timeout=10)
                soup = BeautifulSoup(resp.text, "html.parser")
                items = soup.find_all("div", class_="item")
                
                for item in items:
                    em = item.find("em")
                    movie = em.get_text(strip=True) if em else "未知"
                    
                    score = "未打分"
                    for i in range(1, 6):
                        if item.find("span", class_=f"rating{i}-t"):
                            score = str(i)
                            break
                    
                    cmt = item.find("span", class_="comment")
                    comment = cmt.get_text(strip=True) if cmt else "无短评"
                    
                    date_span = item.find("span", class_="date")
                    tag_date = date_span.get_text(strip=True)[:10] if date_span else "无"
                    
                    link_a = item.find("a")
                    detail_link = link_a.get("href") if link_a else ""
                    
                    year_match = re.search(r'(\d{4})', movie)
                    year = year_match.group(1) if year_match else ""
                    
                    rating_span = item.find("span", class_="rating")
                    douban_score = rating_span.get_text(strip=True) if rating_span else ""
                    
                    all_data.append({
                        "电影名": movie,
                        "上映年份": year,
                        "豆瓣评分": douban_score,
                        "用户个人评分": score,
                        "标记时间": tag_date,
                        "电影详情页链接": detail_link,
                        "短评": comment
                    })
                    
                    yield f'<div class="item"><strong>{movie}</strong><br>评分：{score} | 年份：{year} | 豆瓣：{douban_score}</div>'
                
                time.sleep(1)
            
            yield "<h2 class='done'>✅ 全部爬取完成！</h2>"
            
            if export_excel == 'yes':
                today = datetime.now().strftime("%Y%m%d")
                excel_name = f"{rating_user}_观影评分_{today}.xlsx"
                excel_path = os.path.join(DOWNLOADS_DIR, excel_name)
                pd.DataFrame(all_data).to_excel(excel_path, index=False)
                yield f'<a href="/download/{excel_name}">下载 Excel 文件</a>'
            
            yield '<br><a href="/">返回首页</a>'
            
        except Exception as e:
            yield f'<div class="error">❌ 抓取失败：{str(e)}</div><a href="/">返回</a>'
    
    return Response(generate(), mimetype='text/html')

@app.route('/compare', methods=['POST'])
def compare():
    url_a = request.form.get('url_a', '').strip()
    url_b = request.form.get('url_b', '').strip()
    user_id_a = request.form.get('user_id_a', '').strip()
    user_id_b = request.form.get('user_id_b', '').strip()
    input_type_a = request.form.get('input_type_a', 'url')
    input_type_b = request.form.get('input_type_b', 'url')
    save_html2 = request.form.get('save_html2', 'no')
    
    if user_id_a and not url_a:
        url_a = f"https://movie.douban.com/people/{user_id_a}/collect"
    if user_id_b and not url_b:
        url_b = f"https://movie.douban.com/people/{user_id_b}/collect"
    
    if not url_a or not url_b:
        return '<h2 style="color:red">请输入两个用户的链接或ID</h2><a href="/">返回</a>'
    
    def generate():
        yield '''
<!DOCTYPE html>
<meta charset="utf-8">
<title>对比分析中</title>
<style>
    body{font-family:Arial;max-width:900px;margin:20px auto}
    .item{border-bottom:1px solid #eee;padding:10px 0}
    .page{background:#f0f8ff;padding:10px;margin:15px 0;border-left:4px solid #009966}
    .done{color:green;font-weight:bold;font-size:18px}
    a{display:inline-block;background:#009966;color:white;padding:10px 15px;text-decoration:none;border-radius:6px;margin:5px}
    .result-box{background:#f5f5f5;padding:20px;margin:20px 0;border-radius:8px}
    .error{color:red;padding:20px;background:#fee;border-radius:8px}
    h1{color:#333}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#009966;color:white}
</style>
<h1>🔄 正在对比分析...</h1>
'''
        
        try:
            def fetch_user_data(url, user_label):
                resp = requests.get(url, params={"start":0}, headers=headers, timeout=10)
                
                if resp.status_code != 200:
                    yield f"<h3>{user_label}：页面不存在，共 0 部</h3>"
                    return None, 0, []
                
                soup = BeautifulSoup(resp.text, "html.parser")
                title_text = soup.find("title").get_text(strip=True)
                
                if "不存在" in title_text or "访问受限" in title_text:
                    yield f"<h3>{user_label}：页面不存在，共 0 部</h3>"
                    return None, 0, []
                
                if "看过的影视" not in title_text:
                    yield f"<h3>{user_label}：链接无效，请检查是否为豆瓣“已看电影”页面</h3>"
                    return None, 0, []
                
                username = title_text.split("看过的影视")[0].strip()
                username = ''.join(ch for ch in username if ch not in string.punctuation).replace(' ', '')
                
                match = re.search(r'\((\d+)\)', title_text)
                total = int(match.group(1)) if match else 0
                
                print(f"[模块二] 开始抓取 {user_label}({username}) 的观影数据，共 {total} 部...")
                yield f"<h3>{user_label}：{username}，共 {total} 部</h3>"
                
                data = []
                for start in range(0, total, 15):
                    print(f"[模块二] {user_label} 第 {start//15+1} 页 加载中...")
                    yield f"<div class='page'>📄 {user_label} 第 {start//15+1} 页</div>"
                    resp = requests.get(url, params={"start": start}, headers=headers, timeout=10)
                    soup = BeautifulSoup(resp.text, "html.parser")
                    items = soup.find_all("div", class_="item")
                    
                    for item in items:
                        em = item.find("em")
                        movie = em.get_text(strip=True) if em else "未知"
                        
                        score = "无"
                        for i in range(1, 6):
                            if item.find("span", class_=f"rating{i}-t"):
                                score = str(i)
                                break
                        
                        date_span = item.find("span", class_="date")
                        tag_date = date_span.get_text(strip=True)[:10] if date_span else "无"
                        
                        link_a = item.find("a")
                        detail_link = link_a.get("href") if link_a else ""
                        
                        year_match = re.search(r'(\d{4})', movie)
                        year = year_match.group(1) if year_match else ""
                        
                        rating_span = item.find("span", class_="rating")
                        douban_score = rating_span.get_text(strip=True) if rating_span else ""
                        
                        data.append({
                            "电影名": movie,
                            "上映年份": year,
                            "豆瓣评分": douban_score,
                            "用户个人评分": score,
                            "标记时间": tag_date,
                            "电影详情页链接": detail_link
                        })
                    
                    time.sleep(1)
                
                return username, total, data
            
            username_a, total_a, data_a = None, 0, []
            for chunk in fetch_user_data(url_a, "用户A"):
                yield chunk
            username_a, total_a, data_a = yield from fetch_user_data(url_a, "用户A")
            print(f"[模块二] 用户A({username_a}) 抓取完成，获取 {total_a} 部")
            
            username_b, total_b, data_b = None, 0, []
            for chunk in fetch_user_data(url_b, "用户B"):
                yield chunk
            username_b, total_b, data_b = yield from fetch_user_data(url_b, "用户B")
            print(f"[模块二] 用户B({username_b}) 抓取完成，获取 {total_b} 部")
            
            if username_a is None or username_b is None:
                print(f"[模块二] 错误：用户页面不存在")
                yield "<h2 class='error'>❌ 无法完成对比（用户页面不存在）</h2>"
                yield '<br><a href="/">返回首页</a>'
                return
            
            print(f"[模块二] 开始合并数据并计算评分差值...")
            yield "<h2 class='done'>✅ 对比分析完成！</h2>"
            
            df_a = pd.DataFrame(data_a)
            df_b = pd.DataFrame(data_b)
            
            df_a['movie_clean'] = df_a['电影名'].str.strip()
            df_b['movie_clean'] = df_b['电影名'].str.strip()
            
            common = pd.merge(df_a, df_b, on='movie_clean', how='inner', suffixes=('_A', '_B'))
            common = common.rename(columns={
                '电影名_A': '电影名',
                '上映年份_A': '上映年份',
                '豆瓣评分_A': '豆瓣评分',
                '用户个人评分_A': '用户A评分',
                '标记时间_A': '用户A标记时间',
                '电影详情页链接_A': '电影详情页链接',
                '用户个人评分_B': '用户B评分',
                '标记时间_B': '用户B标记时间'
            })
            
            def calc_diff(row):
                try:
                    a = int(row['用户A评分']) if row['用户A评分'] != '无' else None
                    b = int(row['用户B评分']) if row['用户B评分'] != '无' else None
                    if a and b:
                        return abs(a - b)
                    return '-'
                except:
                    return '-'
            
            common['评分差值'] = common.apply(calc_diff, axis=1)
            common['重合标记'] = '是'
            
            total_common = len(common)
            yield f"<div class='done'>✅ 计算评分差值完成！共 {total_common} 部</div>"
            similar_count = sum(1 for d in common['评分差值'] if isinstance(d, (int, float)) and d <= 1)
            similar_rate = round(similar_count / total_common * 100, 1) if total_common > 0 else 0
            
            def is_high_rating(row):
                try:
                    a = int(row['用户A评分']) if row['用户A评分'] != '无' else 0
                    b = int(row['用户B评分']) if row['用户B评分'] != '无' else 0
                    return a >= 8 and b >= 8
                except:
                    return False
            
            high_common = common[common.apply(is_high_rating, axis=1)].head(3)
            top3_str = "，".join([f"{row['电影名']}({row['用户A评分']}/{row['用户B评分']})" for _, row in high_common.iterrows()]) if len(high_common) > 0 else "无"
            
            yield f'''
<div class="result-box">
    <h3>📊 对比数据预览</h3>
    <p><strong>重合电影总数：</strong>{total_common} 部</p>
    <p><strong>口味相似度：</strong>{similar_rate}%（评分差值≤1分的数量占比）</p>
    <p><strong>高分重合TOP3（两人均≥8分）：</strong>{top3_str}</p>
</div>
'''
            
            yield f'<h3>用户A观影列表（{total_a}部）：</h3>'
            yield '<table><tr><th>电影名</th><th>上映年份</th><th>豆瓣评分</th><th>用户评分</th></tr>'
            for _, row in df_a.iterrows():
                yield f'<tr><td>{row["电影名"]}</td><td>{row["上映年份"]}</td><td>{row["豆瓣评分"]}</td><td>{row["用户个人评分"]}</td></tr>'
            yield '</table>'
            
            yield f'<h3>用户B观影列表（{total_b}部）：</h3>'
            yield '<table><tr><th>电影名</th><th>上映年份</th><th>豆瓣评分</th><th>用户评分</th></tr>'
            for _, row in df_b.iterrows():
                yield f'<tr><td>{row["电影名"]}</td><td>{row["上映年份"]}</td><td>{row["豆瓣评分"]}</td><td>{row["用户个人评分"]}</td></tr>'
            yield '</table>'
            
            yield f'<h3>重合电影列表（{total_common}部）：</h3>'
            yield '<table><tr><th>电影名</th><th>上映年份</th><th>用户A评分</th><th>用户B评分</th><th>评分差值</th></tr>'
            for _, row in common.iterrows():
                yield f'<tr><td>{row["电影名"]}</td><td>{row["上映年份"]}</td><td>{row["用户A评分"]}</td><td>{row["用户B评分"]}</td><td>{row["评分差值"]}</td></tr>'
            yield '</table>'
            
            today = datetime.now().strftime("%Y%m%d")
            
            excel_a = f"{username_a}_观影评分_{today}.xlsx"
            excel_b = f"{username_b}_观影评分_{today}.xlsx"
            excel_compare = f"对比_{username_a}_{username_b}_{today}.xlsx"
            
            df_a.drop(columns=['movie_clean']).to_excel(os.path.join(DOWNLOADS_DIR, excel_a), index=False)
            df_b.drop(columns=['movie_clean']).to_excel(os.path.join(DOWNLOADS_DIR, excel_b), index=False)
            
            compare_df = common[['电影名', '上映年份', '豆瓣评分', '用户A评分', '用户B评分', '评分差值', '重合标记']]
            compare_df.to_excel(os.path.join(DOWNLOADS_DIR, excel_compare), index=False)
            
            yield f'<br><a href="/download/{excel_a}">下载 用户A Excel</a>'
            yield f'<a href="/download/{excel_b}">下载 用户B Excel</a>'
            yield f'<a href="/download/{excel_compare}">下载 对比结果 Excel</a>'
            
            yield '<br><br><a href="/">返回首页</a>'
        
        except Exception as e:
            yield f'<div class="error">❌ 对比失败：{str(e)}</div><a href="/">返回</a>'
    
    return Response(generate(), mimetype='text/html')

@app.route('/download/<filename>')
def download(filename):
    return send_file(os.path.join(DOWNLOADS_DIR, filename), as_attachment=True)

@app.route('/compare_excel', methods=['POST'])
def compare_excel():
    if 'file_a' not in request.files or 'file_b' not in request.files:
        return '<h2 style="color:red">请上传两个Excel文件</h2><a href="/">返回</a>'
    
    file_a = request.files['file_a']
    file_b = request.files['file_b']
    
    if file_a.filename == '' or file_b.filename == '':
        return '<h2 style="color:red">请选择有效的文件</h2><a href="/">返回</a>'
    
    try:
        df_a = pd.read_excel(file_a)
        df_b = pd.read_excel(file_b)
        print(f"[模块三] 读取Excel文件: A={file_a.filename}({len(df_a)}行), B={file_b.filename}({len(df_b)}行)")
        
        def generate():
            yield '''
<!DOCTYPE html>
<meta charset="utf-8">
<title>Excel对比结果</title>
<style>
    body{font-family:Arial;max-width:900px;margin:20px auto;padding:20px}
    h1{color:#333}
    .result-box{background:#f5f5f5;padding:20px;margin:20px 0;border-radius:8px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{border:1px solid #ddd;padding:10px;text-align:left}
    th{background:#009966;color:white}
    .error{color:red;padding:20px;background:#fee;border-radius:8px}
</style>
<h1>📊 Excel对比分析结果</h1>
'''
            
            col_a = '用户个人评分' if '用户个人评分' in df_a.columns else '用户评分'
            col_b = '用户个人评分' if '用户个人评分' in df_b.columns else '用户评分'
            
            name_col_a = '电影名' if '电影名' in df_a.columns else df_a.columns[0]
            name_col_b = '电影名' if '电影名' in df_b.columns else df_b.columns[0]
            
            df_a_clean = df_a[[name_col_a, col_a]].copy()
            df_a_clean.columns = ['电影名', '用户A评分']
            df_a_clean['电影名'] = df_a_clean['电影名'].astype(str).str.strip()
            
            df_b_clean = df_b[[name_col_b, col_b]].copy()
            df_b_clean.columns = ['电影名', '用户B评分']
            df_b_clean['电影名'] = df_b_clean['电影名'].astype(str).str.strip()
            
            common = pd.merge(df_a_clean, df_b_clean, on='电影名', how='inner')
            
            total_rows = len(common)
            print(f"[模块三] 合并完成，重合电影 {total_rows} 部")
            
            if total_rows == 0:
                yield "<h2 style='color:red'>没有找到重合的电影！</h2>"
                yield '<br><a href="/">返回</a>'
                return
            
            yield f"<p>正在计算评分差值（共 {total_rows} 部）...</p>"
            
            print(f"[模块三] 计算评分差值完成，开始生成统计...")
            
            def calc_diff(row):
                try:
                    a = int(row['用户A评分']) if pd.notna(row['用户A评分']) and str(row['用户A评分']) != '无' else None
                    b = int(row['用户B评分']) if pd.notna(row['用户B评分']) and str(row['用户B评分']) != '无' else None
                    if a and b:
                        return abs(a - b)
                    return '-'
                except:
                    return '-'
            
            common['评分差值'] = common.apply(calc_diff, axis=1)
            common['重合标记'] = '是'
            yield f"<div>✅ 计算完成！</div>"
            
            total_common = len(common)
            similar_count = sum(1 for d in common['评分差值'] if isinstance(d, (int, float)) and d <= 1)
            similar_rate = round(similar_count / total_common * 100, 1) if total_common > 0 else 0
            
            high_common = common[
                common.apply(lambda row: (
                    (pd.notna(row['用户A评分']) and str(row['用户A评分']) != '无' and int(row['用户A评分']) >= 8) and
                    (pd.notna(row['用户B评分']) and str(row['用户B评分']) != '无' and int(row['用户B评分']) >= 8)
                ), axis=1)
            ].head(3)
            
            top3_str = "，".join([f"{row['电影名']}({row['用户A评分']}/{row['用户B评分']})" for _, row in high_common.iterrows()]) if len(high_common) > 0 else "无"
            
            yield f'''
<div class="result-box">
    <h3>📊 对比数据预览</h3>
    <p><strong>重合电影总数：</strong>{total_common} 部</p>
    <p><strong>口味相似度：</strong>{similar_rate}%（评分差值≤1分的数量占比）</p>
    <p><strong>高分重合TOP3（两人均≥8分）：</strong>{top3_str}</p>
</div>
'''
            
            today = datetime.now().strftime("%Y%m%d")
            excel_compare = f"Excel对比_{today}.xlsx"
            compare_df = common[['电影名', '用户A评分', '用户B评分', '评分差值', '重合标记']]
            compare_df.to_excel(os.path.join(DOWNLOADS_DIR, excel_compare), index=False)
            
            yield f'<h3>重合电影列表（{total_common}部）：</h3>'
            yield '<table><tr><th>电影名</th><th>用户A评分</th><th>用户B评分</th><th>评分差值</th></tr>'
            for _, row in common.iterrows():
                yield f'<tr><td>{row["电影名"]}</td><td>{row["用户A评分"]}</td><td>{row["用户B评分"]}</td><td>{row["评分差值"]}</td></tr>'
            yield '</table>'
            
            yield f'<br><a href="/download/{excel_compare}" style="display:inline-block;background:#009966;color:white;padding:10px 15px;text-decoration:none;border-radius:6px;margin:5px">下载对比结果 Excel</a>'
            yield '<br><br><a href="/">返回首页</a>'
            
            yield '</body>'
        
        return Response(generate(), mimetype='text/html')
        
    except Exception as e:
        return f'<div class="error">❌ 对比失败：{str(e)}</div><a href="/">返回</a>'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)