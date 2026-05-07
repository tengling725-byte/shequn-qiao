import pdfplumber

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2025年07月28日更新-【浙商证券】特种机器人：向实战靠拢.pdf'

with pdfplumber.open(pdf_path) as pdf:
    for i in range(3):
        page = pdf.pages[i]
        text = page.extract_text()
        print(f"=== Page {i+1} ===")
        print(text[:800])
        print()