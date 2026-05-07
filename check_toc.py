import pdfplumber
import re

pdf_path = r'C:\Users\Sophie\Documents\r_行业研究报告\测试\2025年08月14日更新-【国泰海通】具身智能产业深度研究（一）：轮式形态将先于双足机器人实现商业化落地.pdf'

with pdfplumber.open(pdf_path) as pdf:
    # 详细检查第4-6页
    for i in range(3, 8):  # 第4-8页
        print(f"\n=== 第{i+1}页 ===")
        page = pdf.pages[i]
        text = page.extract_text()
        
        if text:
            # 打印所有包含图/表的行
            lines = text.split('\n')
            for line in lines:
                if '图' in line or '表' in line:
                    # 检查是否有页码
                    match = re.search(r'(图表|图|表)\s*(\d+)[.\s、：:]\s*(.{2,40}?)\s*\.+\s*(\d+)', line)
                    if match:
                        print(f"  [有页码] {line[:70]}")
                    else:
                        # 检查行末是否有数字
                        match2 = re.search(r'(.{10,50})(\d+)\s*$', line)
                        if match2:
                            print(f"  [行末数字] {line[:70]}")
                        else:
                            print(f"  {line[:70]}")