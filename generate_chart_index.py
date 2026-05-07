from pypdf import PdfReader
import pdfplumber
import re
import os
import sys

def extract_page_number_from_context(page_text, chart_ref):
    """从页面上下文提取页码"""
    lines = page_text.split('\n')
    
    # 方法1：查找表格形式的页码（如 "图1 ......... 5"）
    for i, line in enumerate(lines):
        if chart_ref in line:
            # 在当前行或相邻行查找页码
            for offset in [-1, 0, 1]:
                if 0 <= i + offset < len(lines):
                    neighbor = lines[i + offset]
                    # 匹配行末的数字页码
                    match = re.search(r'(\d+)\s*$', neighbor.strip())
                    if match:
                        return int(match.group(1))
    
    # 方法2：查找页面底部/顶部的页码标注
    # 通常在页面底部或顶部有 "XX页" 或单独的页码
    bottom_pattern = r'第\s*(\d+)\s*页|^\s*(\d+)\s*$'
    for line in lines[-5:]:  # 检查底部5行
        match = re.search(bottom_pattern, line)
        if match:
            return int(match.group(1) or match.group(2))
    
    return None

def process_pdf(pdf_path, chart_data_list):
    """处理单个PDF文件，提取图表目录"""
    print(f"\n{'='*50}", flush=True)
    print(f"正在处理: {os.path.basename(pdf_path)}", flush=True)
    print(f"{'='*50}", flush=True)

    try:
        if not os.path.exists(pdf_path):
            print(f"[错误] 文件不存在: {pdf_path}", flush=True)
            return

        # 尝试从图表目录提取
        print("[状态1] 正在检查图表目录...", flush=True)
        chart_data = []

        with pdfplumber.open(pdf_path) as pdf_plumber:
            total_pages = len(pdf_plumber.pages)
            
            # 在前20页中查找图表目录
            for i in range(min(20, total_pages)):
                text = pdf_plumber.pages[i].extract_text() or ""
                lines = text.split('\n')
                
                for line in lines:
                    # 模式1: "图表1 标题 ........... 5" (有省略号和页码)
                    match = re.search(r'(图表|图|表)\s*(\d+)[.\s、：:]\s*(.{2,50}?)\s*\.+\s*(\d+)', line)
                    if match:
                        prefix = match.group(1)
                        chart_num = match.group(2)
                        title = match.group(3).strip()
                        page_num = int(match.group(4))
                        
                        if len(title) >= 2 and not re.match(r'^[\d\s,，.]+$', title):
                            if page_num > i + 1:
                                chart_data.append({
                                    'prefix': prefix,
                                    'num': chart_num,
                                    'title': title,
                                    'page': page_num
                                })
                                continue

                    # 模式2: 无页码但标题完整
                    match2 = re.search(r'(图表|图|表)\s*(\d+)[.\s、：:]\s*([^\n]{3,60})', line)
                    if match2 and not any(p['prefix'] + p['num'] == match2.group(1) + match2.group(2) for p in chart_data):
                        prefix = match2.group(1)
                        chart_num = match2.group(2)
                        title = match2.group(3).strip()
                        if len(title) >= 3 and not re.match(r'^[\d\s,，.]+$', title):
                            existing = [p for p in chart_data if p['prefix'] + p['num'] == prefix + chart_num]
                            if not existing:
                                # 尝试从上下文提取页码
                                page_num = extract_page_number_from_context(text, f"{prefix}{chart_num}")
                                chart_data.append({
                                    'prefix': prefix,
                                    'num': chart_num,
                                    'title': title,
                                    'page': page_num
                                })

        # 去重
        if chart_data:
            seen = set()
            unique_data = []
            for item in chart_data:
                key = item['prefix'] + item['num']
                if key not in seen:
                    seen.add(key)
                    unique_data.append(item)
            chart_data = unique_data
            print(f"[状态1] 该文件有图表目录，提取到 {len(chart_data)} 个图表信息", flush=True)
        else:
            print("[状态1] 该文件无图表目录", flush=True)

        # 如果没有提取到图表，尝试从正文提取
        if not chart_data:
            print("[状态1.1] 尝试从正文提取...", flush=True)
            with pdfplumber.open(pdf_path) as pdf_plumber:
                for i, page in enumerate(pdf_plumber.pages):
                    text = page.extract_text() or ""
                    lines = text.split('\n')
                    
                    for line in lines:
                        # 匹配图表引用
                        match = re.search(r'(图表|图|表)\s*(\d+)[.\s、：:]\s*([^\n]{2,50})', line)
                        if match:
                            prefix = match.group(1)
                            chart_num = match.group(2)
                            title = match.group(3).strip()
                            
                            if len(title) >= 2 and not re.match(r'^[\d\s,，.]+$', title):
                                # 检查是否已存在
                                existing = [p for p in chart_data if p['prefix'] + p['num'] == prefix + chart_num]
                                if not existing:
                                    # 尝试从页面上下文获取页码
                                    page_num = extract_page_number_from_context(text, f"{prefix}{chart_num}")
                                    if page_num is None:
                                        page_num = i + 1  # 默认当前页
                                    
                                    chart_data.append({
                                        'prefix': prefix,
                                        'num': chart_num,
                                        'title': title,
                                        'page': page_num
                                    })

            # 再次去重
            if chart_data:
                seen = set()
                unique_data = []
                for item in chart_data:
                    key = item['prefix'] + item['num']
                    if key not in seen:
                        seen.add(key)
                        unique_data.append(item)
                chart_data = unique_data

        if not chart_data:
            print("[警告] 无法提取任何图表标题，跳过该文件", flush=True)
            # 添加一行记录无法提取的文件
            chart_data_list.append({
                '来源文件': os.path.basename(pdf_path),
                '图表表头': '',
                '图表标题': '警告！无法提取任何图表标题',
                '页码': '',
                '链接': pdf_path
            })
            return

        pages_with_page = sum(1 for v in chart_data if v['page'] is not None)
        print(f"[状态2] 成功提取 {len(chart_data)} 个图表标题，其中 {pages_with_page} 个有页码信息", flush=True)

        # 添加到结果列表
        source_file = os.path.basename(pdf_path)
        for item in chart_data:
            title = item['title'].replace(',', '，').replace(';', '；')
            page_num = item['page'] if item['page'] is not None else 1
            
            chart_header = f"{item['prefix']}{item['num']}"
            
            chart_data_list.append({
                '来源文件': source_file,
                '图表表头': chart_header,
                '图表标题': title,
                '页码': page_num,
                '链接': f"{pdf_path}#page={page_num}"
            })

        print(f"[完成] 该文件处理完成，共提取 {len(chart_data)} 个图表", flush=True)

    except Exception as e:
        print(f"[错误] 处理文件失败: {pdf_path}", flush=True)
        print(f"[原因] {str(e)}", flush=True)

def main():
    if len(sys.argv) < 2:
        print("用法: python generate_chart_index.py <文件或文件夹路径>")
        sys.exit(1)

    # 设置UTF-8编码，解决中文显示问题
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    input_path = sys.argv[1]
    print(f"\n{'#'*60}")
    print(f"开始处理: {input_path}")
    print(f"{'#'*60}", flush=True)

    chart_data_list = []

    if os.path.isfile(input_path):
        if input_path.lower().endswith('.pdf'):
            process_pdf(input_path, chart_data_list)
        else:
            print(f"[错误] 不是PDF文件: {input_path}", flush=True)

    elif os.path.isdir(input_path):
        print(f"\n[状态] 检测到文件夹，正在遍历...", flush=True)
        pdf_files = [f for f in os.listdir(input_path) if f.lower().endswith('.pdf')]
        print(f"[信息] 找到 {len(pdf_files)} 个PDF文件", flush=True)

        for pdf_file in sorted(pdf_files):
            pdf_path = os.path.join(input_path, pdf_file)
            process_pdf(pdf_path, chart_data_list)

    else:
        print(f"[错误] 路径不存在: {input_path}", flush=True)
        sys.exit(1)

    if not chart_data_list:
        print("\n[结果] 未提取到任何图表目录", flush=True)
        return

    print(f"\n{'='*60}")
    print(f"正在生成CSV文件...", flush=True)
    print(f"{'='*60}", flush=True)

    lines = ["来源文件,图表表头,图表标题,页码,链接,HYPERLINK公式"]

    for i, data in enumerate(chart_data_list):
        hyperlink = f"=HYPERLINK(E{i+2})"
        lines.append(f"{data['来源文件']},{data['图表表头']},{data['图表标题']},{data['页码']},{data['链接']},{hyperlink}")

    output = '\n'.join(lines)

    if os.path.isfile(input_path):
        base_name = os.path.splitext(input_path)[0]
        output_path = base_name + "_chart_index_v4.csv"
    else:
        folder_name = os.path.basename(input_path)
        output_path = os.path.join(input_path, folder_name + "_chart_index_v4.csv")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print(f"\n{'#'*60}")
    print(f"完成！共生成 {len(chart_data_list)} 个图表索引")
    print(f"文件保存位置: {output_path}")
    print(f"{'#'*60}", flush=True)

if __name__ == "__main__":
    main()