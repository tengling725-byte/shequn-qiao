from pypdf import PdfReader
import pdfplumber
import re
import json

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年08月16日更新-【交银国际】智驾平权与成本下降驱动放量兑现 中国龙头主导全球格局 人形机器人系列二.pdf'

reader = PdfReader(pdf_path)
pdf_info = {
    "总页数": len(reader.pages),
    "总图片数": 0,
    "图表标题": {},
    "每页图片数": {}
}

# 统计每页图片数
for i, page in enumerate(reader.pages):
    img_count = len(page.images) if page.images else 0
    pdf_info["总图片数"] += img_count
    if img_count > 0:
        pdf_info["每页图片数"][i+1] = img_count

# 提取图表标题
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        matches = re.findall(r'图\s*表?\s*(\d+)[：:]\s*([^\n]{1,60})', text)
        for m in matches:
            chart_num = int(m[0])
            if chart_num not in pdf_info["图表标题"]:
                pdf_info["图表标题"][chart_num] = m[1].strip()

# 保存JSON
with open('pdf_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(pdf_info, f, ensure_ascii=False, indent=2)

print("PDF解析完成！")
print(f"总页数: {pdf_info['总图片数']}")
print(f"总图片数: {pdf_info['总图片数']}")
print(f"图表标题数量: {len(pdf_info['图表标题'])}")