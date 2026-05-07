# -*- coding: utf-8 -*-
import os
import csv
import time
import random
import uuid
import threading
from datetime import datetime
from urllib.parse import urljoin, urlparse

from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
import requests
from bs4 import BeautifulSoup


app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'templates')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


# ========== 防爬虫配置 ==========
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
]

ACCEPT_LANGUAGES = [
    'zh-CN,zh;q=0.9,en;q=0.8',
    'zh-CN,zh;q=0.9',
    'en-US,en;q=0.9',
    'zh-TW,zh;q=0.9,zh-CN;q=0.8,en;q=0.7',
]


class CrawlerTask:
    """爬虫任务类"""

    def __init__(self):
        self.results = []
        self.visited_urls = set()
        self.current_page = 0
        self.is_running = False
        self.is_stopped = False
        self.session = requests.Session()
        self.last_referer = ''
        self.current_csv_file = ''  # 当前CSV文件名
        self.output_mode = 'keywords'  # 输出模式：keywords=仅关键词链接, all=所有链接

    def reset(self):
        self.results = []
        self.visited_urls = set()
        self.current_page = 0
        self.is_running = False
        self.is_stopped = False
        self.session = requests.Session()
        self.output_mode = 'keywords'
        self.last_referer = ''

    def get_random_headers(self, referer=None):
        """生成随机请求头"""
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': random.choice(ACCEPT_LANGUAGES),
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Upgrade-Insecure-Requests': '1',
        }
        if referer:
            headers['Referer'] = referer
        elif self.last_referer:
            headers['Referer'] = self.last_referer
        return headers

    def normalize_url(self, href, base_url):
        """将相对URL转换为绝对URL"""
        if not href:
            return ''
        if href.startswith(('javascript:', 'mailto:', 'tel:', '#')):
            return ''
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)
        # 保留 query 参数
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}{query}"

    def is_same_domain(self, url, base_url):
        """检查是否同域名"""
        try:
            return urlparse(url).netloc == urlparse(base_url).netloc
        except:
            return True

    def random_delay(self, min_sec=0.5, max_sec=2.0):
        """随机延迟"""
        time.sleep(random.uniform(min_sec, max_sec))

        # 偶尔增加更长的随机停顿（10%概率）
        if random.random() < 0.1:
            time.sleep(random.uniform(3, 6))

    def fetch_page(self, url, timeout=15, retry=3):
        """获取页面内容（带重试机制）"""
        import sys
        print(f"[fetch_page] 开始请求: {url}", flush=True)
        for attempt in range(retry):
            try:
                headers = self.get_random_headers()
                print(f"[fetch_page] 发送请求 (attempt {attempt+1}/{retry})...", flush=True)
                response = self.session.get(url, headers=headers, timeout=timeout)
                response.raise_for_status()
                print(f"[fetch_page] 请求成功, 状态码: {response.status_code}", flush=True)

                # 更新Referer
                self.last_referer = url

                # 自动检测编码
                response.encoding = response.apparent_encoding or 'utf-8'
                return response.text

            except requests.exceptions.Timeout:
                print(f"[fetch_page] 超时 (attempt {attempt+1})", flush=True)
                if attempt < retry - 1:
                    self.random_delay(1, 3)
                    continue
                return f"Error: 请求超时"

            except requests.exceptions.RequestException as e:
                print(f"[fetch_page] 请求错误: {e} (attempt {attempt+1})", flush=True)
                if attempt < retry - 1:
                    self.random_delay(1, 3)
                    continue
                return f"Error: {str(e)}"

        return f"Error: 重试次数耗尽"

    def find_next_page(self, soup, current_url, next_keywords):
        """从当前页面直接解析下一页链接"""
        # 准备关键字列表
        keywords = [k.strip() for k in next_keywords if k.strip()]

        # 查找所有<a>标签，匹配关键字
        all_links = soup.find_all('a', href=True)

        for a in all_links:
            text = a.get_text(strip=True)
            href = a.get('href', '')

            if not text or not href:
                continue

            # 匹配关键字（忽略大小写）
            text_lower = text.lower()
            for kw in keywords:
                if kw.lower() in text_lower:
                    return self.normalize_url(href, current_url)

        # 未找到下一页链接
        return None

    def crawl(self, start_url, keywords1, keywords2, keywords3, next_keywords, output_mode='keywords', progress_callback=None):
        """自动模式爬取"""
        import sys
        print(f"[crawl方法] 开始执行, start_url={start_url}", flush=True)
        self.reset()
        self.is_running = True
        self.is_stopped = False

        base_domain = urlparse(start_url).netloc

        current_url = start_url
        page_count = 0

        print(f"[crawl方法] 开始while循环, current_url={current_url}", flush=True)

        while current_url and not self.is_stopped:
            print(f"[crawl方法] 循环中, current_url={current_url}", flush=True)
            if current_url in self.visited_urls:
                print(f"[crawl方法] URL已访问过: {current_url}", flush=True)
                break

            self.visited_urls.add(current_url)
            page_count += 1
            self.current_page = page_count
            print(f"[crawl方法] 爬取第 {page_count} 页: {current_url}", flush=True)

            if progress_callback:
                progress_callback({
                    'type': 'page',
                    'page': page_count,
                    'url': current_url
                })

            print(f"[crawl方法] 开始fetch_page...", flush=True)
            html = self.fetch_page(current_url)
            print(f"[crawl方法] fetch_page完成, html长度={len(html) if html else 0}", flush=True)

            if html.startswith("Error:"):
                if progress_callback:
                    progress_callback({
                        'type': 'error',
                        'message': html
                    })
                break

            soup = BeautifulSoup(html, 'html.parser')

            # 解析当前页面所有链接
            for a in soup.find_all('a', href=True):
                if self.is_stopped:
                    break

                text = a.get_text(strip=True)
                href = a.get('href', '')

                if not text or not href:
                    continue

                full_url = self.normalize_url(href, current_url)

                if not full_url or not self.is_same_domain(full_url, start_url):
                    continue

                # 根据输出模式决定是否过滤
                should_save = False
                if output_mode == 'all':
                    # 输出所有链接模式：保存所有有效链接
                    should_save = True
                elif self.match_keywords(text, full_url, keywords1, keywords2, keywords3):
                    should_save = True

                if should_save:
                    # 检查是否已存在
                    exists = any(r['url'] == full_url for r in self.results)
                    if not exists:
                        # 只保存前80字
                        display_name = text[:80] + '...' if len(text) > 80 else text
                        self.results.append({
                            'name': display_name,
                            'url': full_url,
                            'source_page': current_url
                        })

                        if progress_callback:
                            progress_callback({
                                'type': 'found',
                                'count': len(self.results),
                                'name': display_name,
                                'url': full_url
                            })

            # 查找下一页
            next_url = self.find_next_page(soup, current_url, next_keywords)

            if next_url and self.is_same_domain(next_url, start_url):
                current_url = next_url
                self.random_delay()
            else:
                break

        self.is_running = False
        return self.results

    def crawl_manual(self, url_list, keywords1, keywords2, keywords3, output_mode='keywords'):
        """手动模式爬取：直接爬取用户提供的URL列表"""
        self.reset()
        self.is_running = True
        self.is_stopped = False

        page_count = 0

        for current_url in url_list:
            if self.is_stopped:
                break

            if current_url in self.visited_urls:
                continue

            self.visited_urls.add(current_url)
            page_count += 1
            self.current_page = page_count
            print(f"[手动模式] 正在爬取第 {page_count} 页: {current_url}")

            html = self.fetch_page(current_url)

            if html.startswith("Error:"):
                print(f"[手动模式] 页面出错: {html}")
                continue

            soup = BeautifulSoup(html, 'html.parser')

            # 解析当前页面所有链接
            for a in soup.find_all('a', href=True):
                if self.is_stopped:
                    break

                text = a.get_text(strip=True)
                href = a.get('href', '')

                if not text or not href:
                    continue

                full_url = self.normalize_url(href, current_url)

                if not full_url:
                    continue

                # 调试日志：打印提取到的链接
                print(f"[提取链接] text={text[:50]}..., href={href} -> {full_url}")

                # 根据输出模式决定是否过滤
                should_save = False
                if output_mode == 'all':
                    should_save = True
                elif self.match_keywords(text, full_url, keywords1, keywords2, keywords3):
                    should_save = True

                if should_save:
                    print(f"[匹配成功] text={text[:50]}..., keywords1={keywords1}")
                    exists = any(r['url'] == full_url for r in self.results)
                    if not exists:
                        # 只保存前80字
                        display_name = text[:80] + '...' if len(text) > 80 else text
                        self.results.append({
                            'name': display_name,
                            'url': full_url,
                            'source_page': current_url
                        })

            self.random_delay()

        self.is_running = False
        return self.results

    def match_keywords(self, text, url, keywords1, keywords2, keywords3):
        """多组关键词匹配逻辑"""
        # 只提取标题前80字用于匹配
        text_short = text[:80] if len(text) > 80 else text
        combined = text_short.lower() + ' ' + url.lower()

        print(f"[关键词匹配] text={text_short[:30]}..., keywords1={keywords1}, combined前30={combined[:30]}")

        # 第一组：OR关系（必填，至少匹配一个）
        match1 = any(kw.lower() in combined for kw in keywords1) if keywords1 else False
        print(f"[关键词匹配] 第一组 match1={match1}, keywords1={keywords1}")
        if not match1:
            return False

        # 第二组：OR关系（如果填写了，至少匹配一个）
        if keywords2:
            match2 = any(kw.lower() in combined for kw in keywords2)
            if not match2:
                return False

        # 第三组：OR关系（如果填写了，至少匹配一个）
        if keywords3:
            match3 = any(kw.lower() in combined for kw in keywords3)
            if not match3:
                return False

        return True


task = CrawlerTask()
task_lock = threading.Lock()


# 内嵌HTML模板（打包exe时使用）
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>匹小爬</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { text-align: center; color: #333; margin-bottom: 30px; font-size: 24px; }
        h2 { color: #333; margin: 20px 0 15px; font-size: 18px; }
        h3 { color: #666; margin: 15px 0 10px; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #555; font-weight: 500; }
        label .required { color: #ff4757; }
        input[type="text"], select, textarea {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
        }
        input[type="text"]:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; }
        textarea { min-height: 100px; resize: vertical; }
        .hint { font-size: 12px; color: #999; margin-top: 5px; }
        button {
            width: 100%;
            padding: 14px 20px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 10px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-download { background: #2ed573; color: white; }
        .btn-secondary { background: #95a5a6; color: white; }
        .error { color: #ff4757; padding: 15px; background: #ffe6e6; border-radius: 8px; margin-bottom: 20px; }
        .success { color: #2ed573; padding: 15px; background: #e8f8f0; border-radius: 8px; margin-bottom: 20px; }
        .results-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px; }
        .results-table th, .results-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .results-table th { background: #f8f9fa; font-weight: 600; color: #555; }
        .results-table a { color: #667eea; text-decoration: none; }
        .source-page { font-size: 11px; color: #999; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .total { font-size: 14px; color: #666; margin-top: 10px; }
        .hidden { display: none; }
        .mode-section { padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px; }
        .keyword-group { padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px; }
    </style>
    <script>
        function toggleMode() {
            var mode = document.querySelector('input[name="crawl_mode"]:checked').value;
            var manualSection = document.getElementById('manualSection');
            if (mode === 'manual') {
                manualSection.classList.remove('hidden');
            } else {
                manualSection.classList.add('hidden');
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>匹小爬</h1>

            {% if error %}
            <div class="error">{{ error }}</div>
            {% endif %}

            {% if not results %}
            <form method="POST" action="/crawl">
                <div class="form-group">
                    <label>爬取模式</label>
                    <div class="mode-section">
                        <label style="display:inline-block;margin-right:20px;">
                            <input type="radio" name="crawl_mode" value="auto" checked onclick="toggleMode()"> 自动下一页
                        </label>
                        <label style="display:inline-block;">
                            <input type="radio" name="crawl_mode" value="manual" onclick="toggleMode()"> 手动输入
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>匹配模式</label>
                    <div class="mode-section">
                        <label style="display:inline-block;margin-right:20px;">
                            <input type="radio" name="output_mode" value="keywords" checked> 仅输出关键词链接
                        </label>
                        <label style="display:inline-block;">
                            <input type="radio" name="output_mode" value="all"> 输出所有链接
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-top:8px;font-size:12px;color:#666;">
                    <span>自动模式：自动识别并点击"下一页"链接；手动模式：直接输入所有页面URL</span>
                </div>

                <div id="manualSection" class="form-group hidden">
                    <label>所有页面URL（每行一个）<span class="required">*</span></label>
                    <textarea name="manual_urls" placeholder="https://page1.com
https://page2.com
https://page3.com"></textarea>
                    <div class="hint">每行输入一个URL</div>
                </div>

                <div class="form-group">
                    <label>初始URL <span class="required">*</span>（自动模式必填）</label>
                    <input type="text" name="start_url" value="{{ start_url_value or 'https://ele.pku.edu.cn/xwdt.htm' }}" placeholder="自动模式时使用">
                </div>

                <div class="keyword-group">
                    <h3>第一组关键词（必填，OR关系）<span class="required">*</span></h3>
                    <label>包含任一关键词即匹配（用逗号分隔）</label>
                    <input type="text" name="keywords1" value="{{ keywords1_value or '进展,突破,成果,奖' }}" placeholder="例如: 进展,突破,成果,奖">
                </div>

                <div class="keyword-group">
                    <h3>第二组关键词（可选，与第一组AND关系）</h3>
                    <label>必须同时包含第一组和第二组的关键词</label>
                    <input type="text" name="keywords2" value="{{ keywords2_value or '重要,重大,瞩目,卓越,颠覆,首次' }}" placeholder="例如: 重要,重大,瞩目,卓越,颠覆,首次">
                    <div class="hint">留空则不启用此组筛选</div>
                </div>

                <div class="keyword-group">
                    <h3>第三组关键词（可选，与第一组AND关系）</h3>
                    <label>必须同时包含第一组和第三组的关键词</label>
                    <input type="text" name="keywords3" placeholder="例如: 科研,成果">
                    <div class="hint">留空则不启用此组筛选</div>
                </div>

                <div class="form-group">
                    <label>下一页关键字（自动模式用，可选）</label>
                    <input type="text" name="next_keywords" value="下一页,下页,next,Next" placeholder="下一页,下页,next">
                    <div class="hint">用于识别分页链接，多个用逗号分隔</div>
                </div>

                <button type="submit" class="btn-primary">开始爬取</button>
            </form>
            {% else %}

            {% if output_mode == 'all' %}
            <div class="success">✅ 爬取完成！共找到 {{ total }} 个链接（输出所有链接模式）</div>
            {% else %}
            <div class="success">✅ 爬取完成！共找到 {{ total }} 个匹配链接（仅输出关键词链接模式）</div>
            {% endif %}

            <h2>结果预览（全部 {{ total }} 条）</h2>
            <div style="max-height:500px;overflow-y:auto;border:1px solid #ddd;border-radius:8px;">
            <table class="results-table">
                <thead>
                    <tr style="position:sticky;top:0;background:#667eea;color:white;">
                        <th>链接名称</th>
                        <th>链接地址</th>
                        <th>来源页面</th>
                    </tr>
                </thead>
                <tbody>
                    {% for r in results %}
                    <tr>
                        <td>{{ r.name }}</td>
                        <td><a href="{{ r.url }}" target="_blank">{{ r.url }}</a></td>
                        <td class="source-page"><a href="{{ r.source_page }}" target="_blank" style="color:#999;text-decoration:none;">{{ r.source_page }}</a></td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            </div>

            <p class="total">共 {{ total }} 条结果</p>

            <div style="display: flex; gap: 15px; margin-top: 20px;">
                <a href="/download"><button class="btn-download">📥 下载CSV文件</button></a>
                <a href="/"><button class="btn-secondary">🔄 重新爬取</button></a>
            </div>
            {% endif %}
        </div>
    </div>
</body>
</html>'''


from flask import render_template_string


@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)


@app.route('/crawl', methods=['POST'])
def crawl():
    # 表单方式接收数据
    crawl_mode = request.form.get('crawl_mode', 'auto').strip()

    # 解析三组关键词
    keywords1 = [k.strip() for k in request.form.get('keywords1', '').split(',') if k.strip()]
    keywords2 = [k.strip() for k in request.form.get('keywords2', '').split(',') if k.strip()]
    keywords3 = [k.strip() for k in request.form.get('keywords3', '').split(',') if k.strip()]
    next_keywords = [n.strip() for n in request.form.get('next_keywords', '下一页,下页,next').split(',') if n.strip()]
    output_mode = request.form.get('output_mode', 'keywords').strip()

    # 检查必填项（仅输出关键词模式需要关键词）
    if output_mode != 'all' and not keywords1:
        return render_template_string(HTML_TEMPLATE, error='请输入第一组关键词')

    # 根据模式获取URL列表
    if crawl_mode == 'manual':
        # 手动模式：使用用户输入的URL列表
        manual_urls = request.form.get('manual_urls', '').strip()
        if not manual_urls:
            return render_template_string(HTML_TEMPLATE, error='请输入所有页面URL（用分号隔开）')

        url_list = [u.strip() for u in manual_urls.split('\n') if u.strip()]
        start_url = url_list[0] if url_list else ''
    else:
        # 自动模式：使用单个起始URL
        start_url = request.form.get('start_url', '').strip()
        url_list = []

    if not start_url and not url_list:
        return render_template_string(HTML_TEMPLATE, error='请输入URL')

    print(f"=== 开始爬取: 模式={crawl_mode}, 输出模式={output_mode}, 第一组关键词={keywords1}, 第二组={keywords2}, 第三组={keywords3} ===")

    # 异步执行爬取（启动后台线程）
    def run_crawl():
        import sys
        try:
            print(f"[线程] 开始爬取...", flush=True)
            print(f"[线程] crawl_mode={crawl_mode}, start_url={start_url}", flush=True)
            task.reset()  # 重置任务状态
            task.output_mode = output_mode  # 设置输出模式
            print(f"[线程] task.reset() 完成, task.is_running={task.is_running}", flush=True)

            if crawl_mode == 'manual':
                # 手动模式：直接爬取用户提供的URL列表
                print(f"[线程] 手动模式, url_list={url_list}", flush=True)
                results = task.crawl_manual(url_list, keywords1, keywords2, keywords3, output_mode)
            else:
                # 自动模式：自动找下一页
                print(f"[线程] 自动模式, start_url={start_url}, next_keywords={next_keywords}", flush=True)
                results = task.crawl(start_url, keywords1, keywords2, keywords3, next_keywords, output_mode)

            print(f"[线程] 爬取完成，结果数: {len(results)}", flush=True)
            # 爬取完成后保存CSV
            if results:
                mode_prefix = '全部' if output_mode == 'all' else '关键词'
                filename = f"links_{mode_prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                filepath = os.path.join(OUTPUT_DIR, filename)
                with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                    writer = csv.DictWriter(f, fieldnames=['链接名称', '链接地址', '来源页面'])
                    writer.writeheader()
                    for r in results:
                        writer.writerow({
                            '链接名称': r['name'],
                            '链接地址': r['url'],
                            '来源页面': r['source_page']
                        })
                task.current_csv_file = filename
                print(f"[线程] CSV已保存: {filename}")
        except Exception as e:
            print(f"[爬虫错误] {e}")
            import traceback
            traceback.print_exc()
            import traceback
            import sys
            exc_info = sys.exc_info()
            traceback.print_exception(*exc_info)
            print(f"[线程异常] {exc_info[1]}", flush=True)

    print(f"[主线程] 创建线程...", flush=True)
    thread = threading.Thread(target=run_crawl)
    thread.daemon = True
    thread.start()
    print(f"[主线程] 线程已启动, is_alive={thread.is_alive()}", flush=True)

    # 跳转到进度页面
    return redirect('/progress_page')

    # 返回结果页面
    return render_template_string(HTML_TEMPLATE,
                           results=results[:100] if results else [],
                           total=len(results) if results else 0,
                           csv_file=task.current_csv_file if results else '',
                           start_url=start_url,
                           keywords=keywords_input,
                           start_url_value=start_url,
                           keywords_value=keywords_input,
                           output_mode=output_mode)


@app.route('/progress')
def progress():
    """前端轮询获取进度"""
    # 不使用锁，直接读取状态
    print(f"[进度查询] is_running={task.is_running}, current_page={task.current_page}, found={len(task.results)}")
    return jsonify({
        'is_running': task.is_running,
        'current_page': task.current_page,
        'found_count': len(task.results),
        'results': task.results if task.results else [],
        'output_mode': task.output_mode
    })


@app.route('/progress_page')
def progress_page():
    """进度显示页面"""
    return '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>正在爬取...</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { text-align: center; color: #333; margin-bottom: 20px; }
        .status { display: flex; justify-content: space-around; margin: 30px 0; }
        .status-item { text-align: center; }
        .status-value { font-size: 36px; font-weight: bold; color: #667eea; }
        .status-label { font-size: 14px; color: #666; margin-top: 5px; }
        .spinner {
            width: 50px; height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .log { max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .log-item { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        .log-item:last-child { border-bottom: none; }
        .log-time { color: #999; margin-right: 10px; }
        .log-page { color: #667eea; }
        .log-found { color: #2ed573; }
        .complete { text-align: center; padding: 30px; }
        .complete h2 { color: #2ed573; }
        button { padding: 14px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 10px; }
        .btn-download { background: #2ed573; color: white; }
        .btn-back { background: #95a5a6; color: white; }
        .current-url { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 13px; color: #856404; word-break: break-all; }
        .dot { display: inline-block; width: 10px; height: 10px; background: #667eea; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1><span class="dot"></span> 正在爬取...</h1>

            <div class="status">
                <div class="status-item">
                    <div class="status-value" id="pageCount">0</div>
                    <div class="status-label">已爬页面</div>
                </div>
                <div class="status-item">
                    <div class="status-value" id="foundCount">0</div>
                    <div class="status-label">找到链接</div>
                </div>
            </div>

            <div class="spinner" id="spinner"></div>

            <div id="currentUrl" class="current-url" style="display:none;"></div>

            <div class="log" id="log">
                <div class="log-item"><span class="log-time">准备中...</span> 等待爬虫启动</div>
            </div>

            <div id="completeBox" style="display:none;"></div>
        </div>
    </div>

    <script>
        let lastPage = 0;
        let lastFound = 0;

        function log(msg, type) {
            const logDiv = document.getElementById('log');
            const time = new Date().toLocaleTimeString();
            let className = 'log-item';
            let prefix = '';
            if (type === 'page') { className += ' log-page'; prefix = '📄 '; }
            else if (type === 'found') { className += ' log-found'; prefix = '🔗 '; }

            logDiv.innerHTML = `<div class="${className}"><span class="log-time">[${time}]</span> ${prefix}${msg}</div>` + logDiv.innerHTML;
        }

        async function checkProgress() {
            try {
                const response = await fetch('/progress');
                const data = await response.json();

                document.getElementById('pageCount').textContent = data.current_page;
                document.getElementById('foundCount').textContent = data.found_count;

                if (data.current_page > lastPage && lastPage > 0) {
                    log(`已完成第 ${data.current_page} 页`, 'page');
                }
                if (data.found_count > lastFound) {
                    const newCount = data.found_count - lastFound;
                    log(`新找到 ${newCount} 个链接`, 'found');
                }

                lastPage = data.current_page;
                lastFound = data.found_count;

                if (!data.is_running && data.current_page > 0) {
                    showComplete(data.found_count, data.results, data.output_mode);
                } else {
                    setTimeout(checkProgress, 1000);
                }
            } catch (e) {
                log('获取进度失败: ' + e.message);
                setTimeout(checkProgress, 2000);
            }
        }

        function showComplete(total, results, output_mode) {
            document.getElementById('spinner').style.display = 'none';
            document.querySelector('h1').innerHTML = '✅ 爬取完成！';

            const completeBox = document.getElementById('completeBox');
            completeBox.style.display = 'block';

            const modeText = (output_mode === 'all') ? '个链接（输出所有链接模式）' : '个匹配链接（仅输出关键词链接模式）';
            let html = `<div class="complete">
                <h2>共找到 ${total} ${modeText}</h2>
                <a href="/download"><button class="btn-download">📥 下载CSV文件</button></a>
                <a href="/"><button class="btn-back">🔄 重新爬取</button></a>
            </div>`;

            if (results && results.length > 0) {
                // 显示全部结果，添加链接地址列
                html += `<h3 style="margin:20px 0 10px;">全部结果 (共 ${results.length} 条)：</h3>
                <div style="max-height:500px;overflow-y:auto;border:1px solid #ddd;border-radius:8px;">
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                    <tr style="background:#667eea;color:white;position:sticky;top:0;">
                        <th style="padding:10px;text-align:left;width:30%;">链接名称</th>
                        <th style="padding:10px;text-align:left;width:45%;">链接地址</th>
                        <th style="padding:10px;text-align:left;width:25%;">来源页面</th>
                    </tr>`;
                results.forEach(r => {
                    html += `<tr>
                        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.name)}</td>
                        <td style="padding:8px;border-bottom:1px solid #eee;word-break:break-all;"><a href="${escapeHtml(r.url)}" target="_blank" style="color:#667eea;text-decoration:none;">${escapeHtml(r.url)}</a></td>
                        <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;"><a href="${escapeHtml(r.source_page)}" target="_blank" style="color:#999;text-decoration:none;">${escapeHtml(r.source_page)}</a></td>
                    </tr>`;
                });
                html += '</table></div>';
            }

            completeBox.innerHTML = html;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        log('正在启动爬虫...');
        setTimeout(checkProgress, 1000);
    </script>
</body>
</html>
'''


@app.route('/stop', methods=['POST'])
def stop():
    """停止爬取"""
    with task_lock:
        task.is_stopped = True
    return jsonify({'success': True})


@app.route('/download')
def download():
    """下载CSV"""
    with task_lock:
        results = task.results
        # 如果还没保存CSV，现在保存
        if not task.current_csv_file and results:
            task.current_csv_file = f"links_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            filepath = os.path.join(OUTPUT_DIR, task.current_csv_file)
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=['链接名称', '链接地址', '来源页面'])
                writer.writeheader()
                for r in results:
                    writer.writerow({
                        '链接名称': r['name'],
                        '链接地址': r['url'],
                        '来源页面': r['source_page']
                    })

    if not results:
        return '<div style="text-align:center;padding:50px;font-family:sans-serif;"><h2>暂无数据</h2><a href="/">返回</a></div>', 400

    # 返回CSV文件
    if task.current_csv_file:
        filepath = os.path.join(OUTPUT_DIR, task.current_csv_file)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True)

    # 如果文件名不存在，重新生成
    filename = f"links_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=['链接名称', '链接地址', '来源页面'])
        writer.writeheader()
        for r in results:
            writer.writerow({
                '链接名称': r['name'],
                '链接地址': r['url'],
                '来源页面': r['source_page']
            })

    return send_file(filepath, as_attachment=True)


@app.route('/download/<filename>')
def download_file(filename):
    """下载指定CSV文件"""
    # 安全检查，防止路径遍历
    filename = filename.replace('..', '').replace('/', '').replace('\\', '')
    filepath = os.path.join(OUTPUT_DIR, filename)

    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    else:
        return "文件不存在"


if __name__ == '__main__':
    import webbrowser

    url = 'http://127.0.0.1:5000'
    print(f"\n正在启动爬虫工具: {url}\n")
    print("请在浏览器中打开: http://127.0.0.1:5000")
    print("按 Ctrl+C 停止服务\n")

    webbrowser.open(url)
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)