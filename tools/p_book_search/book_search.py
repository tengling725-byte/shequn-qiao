import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import urllib.parse
import re
import requests
from datetime import datetime

BOOKSITES = {
    "豆瓣": "https://www.douban.com/search?source=suggest&q={query}",
    "京东": "https://search.jd.com/Search?keyword={query}&enc=utf-8",
    "当当": "https://search.dangdang.com/?key={query}&act=input",
    "闲鱼": "https://www.goofish.com/search?q={query}",
    "得到": "https://www.dedao.cn/search/result?q={query}",
    "微信读书": "https://weread.qq.com/web/search/books?keyword={query}",
    "豆瓣阅读": "https://read.douban.com/search?q={query}",
    "图书馆": "http://book.ucdrs.superlib.net/search?Field=all&channel=search&sw={query}",
}

def parse_booklist(input_str):
    separators = r'[,，;；\n\s]+'
    books = re.split(separators, input_str.strip())
    return [b.strip() for b in books if b.strip()]

def search_douban(book_name):
    url = f"https://api.douban.com/v2/book/search?q={urllib.parse.quote(book_name)}"
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        if data.get("books"):
            book = data["books"][0]
            return {
                "title": book.get("title", ""),
                "author": book.get("author", [""])[0],
                "rating": book.get("rating", ""),
                "url": book.get("url", ""),
            }
    except:
        pass
    return None

def search_others(book_name, site_name):
    query = urllib.parse.quote(book_name)
    url = BOOKSITES[site_name].format(query=query)
    return {"url": url}

def search_book(book_name):
    results = {}
    douban_result = search_douban(book_name)
    if douban_result:
        results["豆瓣"] = douban_result
    else:
        results["豆瓣"] = {"url": BOOKSITES["豆瓣"].format(query=urllib.parse.quote(book_name))}

    for site in ["京东", "当当", "闲鱼", "得到", "微信读书", "豆瓣阅读", "图书馆"]:
        results[site] = search_others(book_name, site)
    return results

def main():
    print("=" * 50)
    print("书单搜索工具")
    print("=" * 50)
    print("支持分隔符：空格、逗号、分号、换行")
    print("输入 'q' 退出")
    print("-" * 50)

    while True:
        user_input = input("\n请输入书单: ").strip()
        if user_input.lower() == 'q':
            print("再见!")
            break

        books = parse_booklist(user_input)
        if not books:
            print("请输入有效的书名")
            continue

        print(f"\n开始搜索 {len(books)} 本书...\n")

        for i, book in enumerate(books, 1):
            print(f"【{i}】{book}")
            results = search_book(book)

            for site, info in results.items():
                if "title" in info:
                    rating = f" [{info['rating']}]" if info.get("rating") else ""
                    print(f"   {site}: {info.get('title','-')} - {info.get('author','')}{rating}")
                    print(f"   链接: {info.get('url','')}")
                else:
                    print(f"   {site}: {info['url']}")
            print()

if __name__ == "__main__":
    main()