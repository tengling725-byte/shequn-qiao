from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side

wb = Workbook()
sheet = wb.active
sheet.title = "采购合同"

b = Border()
s = Side(style='thin')

sheet['A1'] = '采购合同'
sheet['A1'].font = Font(size=16, bold=True)
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.merge_cells('A1:D1')

sheet['A3'] = '甲方（采购方）：'
sheet['B3'] = '王一'
sheet['A4'] = '乙方（供应方）：'
sheet['B4'] = '李三'

sheet['A6'] = '产品名称'
sheet['B6'] = '数量'
sheet['C6'] = '单价'
sheet['D6'] = '小计'
for c in ['A6', 'B6', 'C6', 'D6']:
    sheet[c].font = Font(bold=True)

sheet['A7'] = '鼠标'
sheet['B7'] = 3000
sheet['C7'] = 10
sheet['D7'] = '=B7*C7'

sheet['A9'] = '总金额：'
sheet['B9'] = '=D7'
sheet['B9'].number_format = '¥#,##0'

sheet['A11'] = '付款方式：合同签订后一次性付清全款'
sheet['A12'] = '交货地点：由双方协商确定'
sheet['A13'] = '违约责任：如一方违约，需承担相应法律责任'

sheet['A15'] = '甲方（签字）：'
sheet['C15'] = '乙方（签字）：'
sheet['A16'] = '日期：'
sheet['C16'] = '日期：'

sheet.column_dimensions['A'].width = 20
sheet.column_dimensions['B'].width = 15
sheet.column_dimensions['C'].width = 15
sheet.column_dimensions['D'].width = 15

wb.save('C:\\Workspace\\opencode\\xlsx\\采购合同.xlsx')
print("合同已创建")