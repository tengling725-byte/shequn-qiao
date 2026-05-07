from pypdf import PdfReader
import pdfplumber
import re

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年08月16日更新-【交银国际】智驾平权与成本下降驱动放量兑现 中国龙头主导全球格局 人形机器人系列二.pdf'

reader = PdfReader(pdf_path)
print(f"总页数: {len(reader.pages)}\n")

# 提取所有图片
total_images = 0
for i, page in enumerate(reader.pages):
    img_count = len(page.images) if page.images else 0
    total_images += img_count
print(f"总图片数: {total_images}\n")

# 提取目录和图表标题
titles = {}
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        matches = re.findall(r'图\s*表?\s*(\d+)[：:]\s*([^\n]{1,60})', text)
        for m in matches:
            if int(m[0]) not in titles:
                titles[int(m[0])] = m[1].strip()

print(f"提取到的图表标题数量: {len(titles)}\n")
print("图表标题示例:")
for k, v in list(titles.items())[:20]:
    print(f"  图表{k}: {v[:50]}...")

# 提取页面的图片数量分布
print("\n每页图片数量:")
for i in range(min(20, len(reader.pages))):
    img_count = len(reader.pages[i].images) if reader.pages[i].images else 0
    if img_count > 0:
        print(f"  第{i+1}页: {img_count}张图片")