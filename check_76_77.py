import pdfplumber

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\机器人\2026年01月08日更新-【国金证券】机器人行业研究：机器人2026年度策略：行业跨越0-1，坚守核心供应链.pdf'

with pdfplumber.open(pdf_path) as pdf:
    for i in range(40, 50):
        page = pdf.pages[i]
        text = page.extract_text() or ""
        if '76' in text or '77' in text:
            print(f"=== 第{i+1}页 ===")
            lines = text.split('\n')
            for line in lines:
                if '76' in line or '77' in line:
                    print(repr(line))
            print()