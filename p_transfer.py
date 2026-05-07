import pandas as pd
import xlrd
from xlutils.copy import copy
import re

def clean_text(s):
    if pd.isna(s) or s is None:
        return ''
    s = str(s).replace('\n', ' ').replace('\r', ' ').strip()
    return re.sub(r'\s+', '', s)

def find_best_match(item_name, target_items, threshold=0.3):
    item_clean = clean_text(item_name)
    if not item_clean:
        return None, 0
    
    best_idx = None
    best_score = 0
    
    for idx, target_name in enumerate(target_items):
        target_clean = clean_text(target_name)
        if not target_clean:
            continue
        
        # Exact match
        if item_clean == target_clean:
            return idx, 1.0
        
        # Substring match
        if item_clean in target_clean or target_clean in item_clean:
            score = len(min(item_clean, target_clean)) / max(len(item_clean), len(target_clean))
            if score > best_score:
                best_score = score
                best_idx = idx
    
    if best_score >= threshold:
        return best_idx, best_score
    return None, 0

src_path = r'C:\my工作\公司_先风广集\04_财务报表\财务报表报送与信息采集（企业会计准则一般企业）-2025-先风广集_转换.xlsx'
tgt_path = r'C:\my工作\公司_先风广集\04_财务报表\财务报表报送与信息采集_电子税务局一般企业.xls'

# Read source
df_src = pd.read_excel(src_path)

# Parse source into 3 sections
# 资产负债表: rows 2-39 (asset + liability)
# 利润表: rows 43-78
# 现金流量表: rows 87-130

src_asset = []  # [name, 期末余额]
for r in range(2, 40):
    if r < len(df_src):
        name = df_src.iloc[r, 0]
        value = df_src.iloc[r, 1]
        if pd.notna(name):
            src_asset.append((clean_text(name), value))

src_liability = []  # [name, 期末余额]
for r in range(2, 40):
    if r < len(df_src):
        name = df_src.iloc[r, 3]
        value = df_src.iloc[r, 4]
        if pd.notna(name):
            src_liability.append((clean_text(name), value))

# Combine asset + liability for matching
src_items = src_asset + src_liability

# Read target with xlrd
wb = xlrd.open_workbook(tgt_path)
wb_copy = copy(wb)

# Process 资产负债表
ws = wb_copy.get_sheet(0)
ws_target = wb.sheet_by_name('资产负债表')

# Get target item names (column 1 for assets, column 5 for liabilities)
target_asset_names = []
for r in range(6, 45):
    name = ws_target.cell_value(r, 1)
    target_asset_names.append(name)

target_liability_names = []
for r in range(6, 45):
    name = ws_target.cell_value(r, 5)
    target_liability_names.append(name)

# Match and update - 资产: 期末→上年期末 (col 7)
matched = 0
for src_name, src_val in src_asset:
    idx, score = find_best_match(src_name, target_asset_names)
    if idx is not None:
        row = idx + 6
        ws.write(row, 7, src_val)
        matched += 1

# Match and update - 负债+权益: 期末→上年期末 (col 7)
for src_name, src_val in src_liability:
    idx, score = find_best_match(src_name, target_liability_names)
    if idx is not None:
        row = idx + 6
        ws.write(row, 7, src_val)
        matched += 1

print(f'资产负债表: matched {matched} items')

# Process 利润表 - 本期金额 → 上期金额
ws = wb_copy.get_sheet(1)
ws_target = wb.sheet_by_name('利润表')

# Source 利润表: rows 43-78, col 1 = 本期金额
src_profit = []
for r in range(43, 79):
    if r < len(df_src):
        name = df_src.iloc[r, 0]
        value = df_src.iloc[r, 1]
        if pd.notna(name):
            src_profit.append((clean_text(name), value))

# Target: col 1 = 项目, col 3 = 上期金额
target_profit_names = []
for r in range(5, 48):
    name = ws_target.cell_value(r, 1)
    target_profit_names.append(name)

matched = 0
for src_name, src_val in src_profit:
    idx, score = find_best_match(src_name, target_profit_names)
    if idx is not None:
        row = idx + 5
        ws.write(row, 3, src_val)
        matched += 1

print(f'利润表: matched {matched} items')

# Process 现金流量表 - 本期金额 → 上期金额
ws = wb_copy.get_sheet(2)
ws_target = wb.sheet_by_name('现金流量表')

# Source 现金流量表: rows 87-130, col 1 = 本期金额
src_cash = []
for r in range(87, 131):
    if r < len(df_src):
        name = df_src.iloc[r, 0]
        value = df_src.iloc[r, 1]
        if pd.notna(name):
            src_cash.append((clean_text(name), value))

# Target: col 1 = 项目, col 3 = 上期金额
target_cash_names = []
for r in range(5, 43):
    name = ws_target.cell_value(r, 1)
    target_cash_names.append(name)

matched = 0
for src_name, src_val in src_cash:
    idx, score = find_best_match(src_name, target_cash_names)
    if idx is not None:
        row = idx + 5
        ws.write(row, 3, src_val)
        matched += 1

print(f'现金流量表: matched {matched} items')

output_path = r'C:\my工作\公司_先风广集\04_财务报表\财务报表报送与信息采集_电子税务局一般企业_已更新.xls'
wb_copy.save(output_path)
print(f'Done: {output_path}')
