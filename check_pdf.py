import pdfplumber

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年08月16日更新-【交银国际】智驾平权与成本下降驱动放量兑现 中国龙头主导全球格局 人形机器人系列二.pdf'

with pdfplumber.open(pdf_path) as pdf:
    for i in range(10):
        page = pdf.pages[i]
        text = page.extract_text()
        print(f"=== Page {i+1} ===")
        print(text[:500] if text else "No text")
        print()