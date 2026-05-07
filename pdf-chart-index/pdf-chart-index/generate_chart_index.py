from pypdf import PdfReader
import pdfplumber
import re
import os
import sys

def get_folder_name(input_path):
    if os.path.isfile(input_path):
        return os.path.splitext(os.path.basename(input_path))[0]
    return os.path.basename(input_path)

def get_record_file_path(input_path):
    folder_name = get_folder_name(input_path)
    return os.path.join(input_path, folder_name + "_processed_files.txt")

def get_progress_file_path(input_path):
    folder_name = get_folder_name(input_path)
    return os.path.join(input_path, folder_name + "_current_progress.csv")

def get_processed_files(input_path):
    record_file = get_record_file_path(input_path)
    if not os.path.exists(record_file):
        return set()
    with open(record_file, 'r', encoding='utf-8') as f:
        return set(line.strip() for line in f if line.strip())

def mark_file_processed(input_path, filename):
    record_file = get_record_file_path(input_path)
    with open(record_file, 'a', encoding='utf-8') as f:
        f.write(filename + '\n')

def append_to_progress(input_path, data):
    progress_file = get_progress_file_path(input_path)
    file_exists = os.path.exists(progress_file)
    mode = 'a' if file_exists else 'w'
    with open(progress_file, mode, encoding='utf-8') as f:
        if not file_exists:
            f.write("来源文件,图表表头,图表标题,页码,链接\n")
        f.write(f"{data['来源文件']},{data['图表表头']},{data['图表标题']},{data['页码']},{data['链接']}\n")

def load_progress_data(input_path):
    progress_file = get_progress_file_path(input_path)
    if not os.path.exists(progress_file):
        return []
    data_list = []
    with open(progress_file, 'r', encoding='utf-8') as f:
        lines = f.read().split('\n')
        for line in lines[1:]:
            if line.strip():
                parts = line.split(',', 4)
                if len(parts) >= 5:
                    data_list.append({
                        '来源文件': parts[0],
                        '图表表头': parts[1],
                        '图表标题': parts[2],
                        '页码': parts[3],
                        '链接': parts[4]
                    })
    return data_list

def rename_progress_to_part(input_path, part_num):
    progress_file = get_progress_file_path(input_path)
    if not os.path.exists(progress_file):
        return None

    folder_name = get_folder_name(input_path)
    base_name = folder_name + "_chart_index_part"
    part_path = os.path.join(input_path, base_name + str(part_num) + ".csv")

    counter = 1
    while os.path.exists(part_path):
        part_path = os.path.join(input_path, base_name + f"{part_num}_{counter}.csv")
        counter += 1

    os.rename(progress_file, part_path)
    return part_path

def get_existing_part_count(input_path):
    folder_name = get_folder_name(input_path)
    pattern = folder_name + "_chart_index_part"
    count = 0
    for f in os.listdir(input_path):
        if f.startswith(pattern) and f.endswith('.csv'):
            count += 1
    return count

def extract_page_number_from_context(page_text, chart_ref):
    """从页面上下文提取页码"""
    lines = page_text.split('\n')
    
    for i, line in enumerate(lines):
        if chart_ref in line:
            for offset in [-1, 0, 1]:
                if 0 <= i + offset < len(lines):
                    neighbor = lines[i + offset]
                    match = re.search(r'(\d+)\s*$', neighbor.strip())
                    if match:
                        return int(match.group(1))
    
    bottom_pattern = r'第\s*(\d+)\s*页|^\s*(\d+)\s*$'
    for line in lines[-5:]:
        match = re.search(bottom_pattern, line)
        if match:
            return int(match.group(1) or match.group(2))
    
    return None

def process_pdf(pdf_path, chart_data_list, folder_path=None):
    """处理单个PDF文件，提取图表目录"""
    print(f"\n{'='*50}", flush=True)
    print(f"正在处理: {os.path.basename(pdf_path)}", flush=True)
    print(f"{'='*50}", flush=True)

    try:
        if not os.path.exists(pdf_path):
            print(f"[错误] 文件不存在: {pdf_path}", flush=True)
            return

        print("[状态1] 正在检查图表目录...", flush=True)
        chart_data = []

        with pdfplumber.open(pdf_path) as pdf_plumber:
            total_pages = len(pdf_plumber.pages)
            
            for i in range(min(20, total_pages)):
                text = pdf_plumber.pages[i].extract_text() or ""
                lines = text.split('\n')
                
                for line in lines:
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

                    match2 = re.search(r'(图表|图|表)\s*(\d+)[.\s、：:]\s*([^\n]{3,60})', line)
                    if match2 and not any(p['prefix'] + p['num'] == match2.group(1) + match2.group(2) for p in chart_data):
                        prefix = match2.group(1)
                        chart_num = match2.group(2)
                        title = match2.group(3).strip()
                        if len(title) >= 3 and not re.match(r'^[\d\s,，.]+$', title):
                            existing = [p for p in chart_data if p['prefix'] + p['num'] == prefix + chart_num]
                            if not existing:
                                page_num = extract_page_number_from_context(text, f"{prefix}{chart_num}")
                                chart_data.append({
                                    'prefix': prefix,
                                    'num': chart_num,
                                    'title': title,
                                    'page': page_num
                                })

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

        if not chart_data:
            print("[状态1.1] 尝试从正文提取...", flush=True)
            with pdfplumber.open(pdf_path) as pdf_plumber:
                for i, page in enumerate(pdf_plumber.pages):
                    text = page.extract_text() or ""
                    lines = text.split('\n')
                    
                    for line in lines:
                        match = re.search(r'(图表|图|表)\s*(\d+)[.\s、：:]\s*([^\n]{2,50})', line)
                        if match:
                            prefix = match.group(1)
                            chart_num = match.group(2)
                            title = match.group(3).strip()
                            
                            if len(title) >= 2 and not re.match(r'^[\d\s,，.]+$', title):
                                existing = [p for p in chart_data if p['prefix'] + p['num'] == prefix + chart_num]
                                if not existing:
                                    page_num = extract_page_number_from_context(text, f"{prefix}{chart_num}")
                                    if page_num is None:
                                        page_num = i + 1
                                    
                                    chart_data.append({
                                        'prefix': prefix,
                                        'num': chart_num,
                                        'title': title,
                                        'page': page_num
                                    })

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
            print("[警告] 无法提取任何图表标题", flush=True)
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

        if folder_path:
            for item in chart_data:
                append_to_progress(folder_path, {
                    '来源文件': os.path.basename(pdf_path),
                    '图表表头': item['prefix'] + item['num'],
                    '图表标题': item['title'],
                    '页码': item['page'] if item['page'] is not None else 1,
                    '链接': f"{pdf_path}#page={item['page'] if item['page'] is not None else 1}"
                })

    except Exception as e:
        print(f"[错误] 处理文件失败: {pdf_path}", flush=True)
        print(f"[原因] {str(e)}", flush=True)
        chart_data_list.append({
            '来源文件': os.path.basename(pdf_path),
            '图表表头': '',
            '图表标题': '警告！读取图表失败！',
            '页码': '',
            '链接': pdf_path
        })
        if folder_path:
            append_to_progress(folder_path, {
                '来源文件': os.path.basename(pdf_path),
                '图表表头': '',
                '图表标题': '警告！读取图表失败！',
                '页码': '',
                '链接': pdf_path
            })

def save_partial_csv(chart_data_list, input_path, part_num):
    """保存中间CSV文件"""
    if not chart_data_list:
        return None
    
    if os.path.isfile(input_path):
        base_name = os.path.splitext(input_path)[0]
        output_path = base_name + f"_chart_index_part{part_num}.csv"
    else:
        folder_name = os.path.basename(input_path)
        output_path = os.path.join(input_path, folder_name + f"_chart_index_part{part_num}.csv")
    
    # 避免覆盖已存在的文件
    counter = 1
    while os.path.exists(output_path):
        if os.path.isfile(input_path):
            base_name = os.path.splitext(input_path)[0]
            output_path = base_name + f"_chart_index_part{part_num}_{counter}.csv"
        else:
            folder_name = os.path.basename(input_path)
            output_path = os.path.join(input_path, folder_name + f"_chart_index_part{part_num}_{counter}.csv")
        counter += 1
    
    lines = ["来源文件,图表表头,图表标题,页码,链接,HYPERLINK公式"]
    for i, data in enumerate(chart_data_list):
        hyperlink = f"=HYPERLINK(E{i+2})"
        lines.append(f"{data['来源文件']},{data['图表表头']},{data['图表标题']},{data['页码']},{data['链接']},{hyperlink}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print(f"[保存] 第{part_num}批中间结果已保存: {os.path.basename(output_path)}", flush=True)
    return output_path

def merge_csv_files(part_files, input_path):
    """合并所有中间CSV文件"""
    if not part_files:
        return None
    
    if os.path.isfile(input_path):
        base_name = os.path.splitext(input_path)[0]
        output_path = base_name + "_chart_index.csv"
    else:
        folder_name = os.path.basename(input_path)
        output_path = os.path.join(input_path, folder_name + "_chart_index.csv")
    
    counter = 1
    while os.path.exists(output_path):
        if os.path.isfile(input_path):
            base_name = os.path.splitext(input_path)[0]
            output_path = base_name + f"_chart_index_{counter}.csv"
        else:
            folder_name = os.path.basename(input_path)
            output_path = os.path.join(input_path, folder_name + f"_chart_index_{counter}.csv")
        counter += 1
    
    all_lines = ["来源文件,图表表头,图表标题,页码,链接,HYPERLINK公式"]
    for part_file in part_files:
        with open(part_file, 'r', encoding='utf-8') as f:
            lines = f.read().split('\n')
            if len(lines) > 1:
                all_lines.extend(lines[1:])
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(all_lines))
    
    return output_path

def main():
    if len(sys.argv) < 2:
        print("用法: python generate_chart_index.py <文件或文件夹路径>")
        sys.exit(1)

    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    input_path = sys.argv[1]
    print(f"\n{'#'*60}")
    print(f"开始处理: {input_path}")
    print(f"{'#'*60}", flush=True)

    chart_data_list = []
    save_interval = 20
    part_num = 1
    part_files = []
    current_part_data = []
    processed_count = 0

    processed_files = get_processed_files(input_path)
    current_part_data = load_progress_data(input_path)
    existing_part_count = get_existing_part_count(input_path) if os.path.isdir(input_path) else 0
    part_num = existing_part_count + 1

    if processed_files:
        print(f"[恢复] 检测到已处理文件，将从中断点继续", flush=True)
        print(f"[恢复] 已处理文件数: {len(processed_files)}", flush=True)
        print(f"[恢复] 已有part文件数: {existing_part_count}", flush=True)

    if os.path.isfile(input_path):
        if input_path.lower().endswith('.pdf'):
            process_pdf(input_path, chart_data_list)
        else:
            print(f"[错误] 不是PDF文件: {input_path}", flush=True)

    elif os.path.isdir(input_path):
        print(f"\n[状态] 检测到文件夹，正在遍历...", flush=True)
        pdf_files = [f for f in os.listdir(input_path) if f.lower().endswith('.pdf')]
        total_files = len(pdf_files)
        print(f"[信息] 找到 {total_files} 个PDF文件", flush=True)

        for pdf_file in sorted(pdf_files):
            if pdf_file in processed_files:
                print(f"[跳过] 文件已处理: {pdf_file}", flush=True)
                continue

            processed_count += 1
            print(f"\n[进度] 正在处理第 {processed_count} / {total_files} 个文件: {pdf_file}", flush=True)
            
            pdf_path = os.path.join(input_path, pdf_file)
            process_pdf(pdf_path, current_part_data, input_path)

            mark_file_processed(input_path, pdf_file)
            
            if processed_count % save_interval == 0:
                part_path = rename_progress_to_part(input_path, part_num)
                if part_path:
                    part_files.append(part_path)
                    print(f"[保存] 第{part_num}批已保存: {os.path.basename(part_path)}", flush=True)
                current_part_data = []
                part_num += 1

        if current_part_data:
            part_path = rename_progress_to_part(input_path, part_num)
            if part_path:
                part_files.append(part_path)
                print(f"[保存] 最后一批已保存: {os.path.basename(part_path)}", flush=True)

        if part_files:
            print(f"\n[合并] 正在合并 {len(part_files)} 个中间文件...", flush=True)
            final_output = merge_csv_files(part_files, input_path)
            if final_output:
                chart_data_list = []
                with open(final_output, 'r', encoding='utf-8') as f:
                    lines = f.read().split('\n')
                    if len(lines) > 1:
                        for line in lines[1:]:
                            if line:
                                parts = line.split(',', 5)
                                if len(parts) >= 5:
                                    chart_data_list.append({
                                        '来源文件': parts[0],
                                        '图表表头': parts[1],
                                        '图表标题': parts[2],
                                        '页码': parts[3],
                                        '链接': parts[4]
                                    })

                record_file = get_record_file_path(input_path)
                if os.path.exists(record_file):
                    os.remove(record_file)
                progress_file = get_progress_file_path(input_path)
                if os.path.exists(progress_file):
                    os.remove(progress_file)
                print("[清理] 已删除恢复文件", flush=True)

    else:
        print(f"[错误] 路径不存在: {input_path}", flush=True)
        sys.exit(1)

    if not chart_data_list:
        print("\n[结果] 未提取到任何图表目录", flush=True)
        return

    if os.path.isfile(input_path):
        base_name = os.path.splitext(input_path)[0]
        output_path = base_name + "_chart_index.csv"
    else:
        folder_name = os.path.basename(input_path)
        output_path = os.path.join(input_path, folder_name + "_chart_index.csv")
    
    counter = 1
    while os.path.exists(output_path):
        if os.path.isfile(input_path):
            base_name = os.path.splitext(input_path)[0]
            output_path = base_name + f"_chart_index_{counter}.csv"
        else:
            folder_name = os.path.basename(input_path)
            output_path = os.path.join(input_path, folder_name + f"_chart_index_{counter}.csv")
        counter += 1
    
    print(f"\n{'#'*60}")
    print(f"完成！共生成 {len(chart_data_list)} 个图表索引")
    print(f"文件保存位置: {output_path}")
    print(f"{'#'*60}", flush=True)

if __name__ == "__main__":
    main()