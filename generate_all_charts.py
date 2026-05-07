from pypdf import PdfReader
import pdfplumber
import re

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年08月16日更新-【交银国际】智驾平权与成本下降驱动放量兑现 中国龙头主导全球格局 人形机器人系列二.pdf'

titles = {}
with pdfplumber.open(pdf_path) as pdf_plumber:
    for i, page in enumerate(pdf_plumber.pages):
        text = page.extract_text() or ""
        matches = re.findall(r'图\s*表?\s*(\d+)[：:]\s*([^\n]{1,60})', text)
        for m in matches:
            chart_num = int(m[0])
            if chart_num not in titles:
                titles[chart_num] = m[1].strip()

reader = PdfReader(pdf_path)

lines = []
lines.append("图标名,图表序号,图表标题,页码,链接,HYPERLINK公式")

chart_num = 1
for i, page in enumerate(reader.pages):
    img_count = len(page.images) if page.images else 0
    if img_count > 0:
        page_num = i + 1
        for j in range(img_count):
            name = f"图表{chart_num}"
            seq = chart_num
            title = titles.get(seq, f"图片{chart_num}")
            link = f"{pdf_path}#page={page_num}"
            hyperlink = f"=HYPERLINK(E{chart_num+1})"

            lines.append(f"{name},{seq},{title},{page_num},{link},{hyperlink}")
            chart_num += 1

output = '\n'.join(lines)
print(f"共生成 {chart_num-1} 个图表索引")

with open('chart_index.csv', 'w', encoding='utf-8') as f:
    f.write(output)

print("已完成！文件: chart_index.csv")