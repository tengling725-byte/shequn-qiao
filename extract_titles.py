import pdfplumber
import re

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年08月16日更新-【交银国际】智驾平权与成本下降驱动放量兑现 中国龙头主导全球格局 人形机器人系列二.pdf'

with pdfplumber.open(pdf_path) as pdf:
    for i in range(10):
        page = pdf.pages[i]
        text = page.extract_text() or ""
        matches = re.findall(r'图\s*表?\s*(\d+)[：:]\s*([^\n]{1,50})', text)
        print(f"Page {i+1}: {matches}")