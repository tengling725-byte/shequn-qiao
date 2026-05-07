from pypdf import PdfReader

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年07月28日更新-【浙商证券】特种机器人：向实战靠拢.pdf'
reader = PdfReader(pdf_path)

lines = []
lines.append("图标名,图标标题,文件及页码地址,HTML超链接")

chart_num = 1
for i, page in enumerate(reader.pages):
    img_count = len(page.images) if page.images else 0
    if img_count > 0:
        page_num = i + 1
        for j in range(img_count):
            name = f"图表{chart_num}"
            title = f"图片{chart_num}"
            file_link = f"{pdf_path}#page={page_num}"
            html = f'<a href="{pdf_path}#page={page_num}">{name}</a>'

            lines.append(f"{name},{title},{file_link},{html}")
            chart_num += 1
            if chart_num > 10:
                break
    if chart_num > 10:
        break

output = '\n'.join(lines)
print(output)

with open('chart_index.csv', 'w', encoding='utf-8') as f:
    f.write(output)