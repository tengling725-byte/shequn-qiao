import openpyxl
wb = openpyxl.load_workbook('C:\\Workspace\\opencode\\xlsx\\员工绩效表-DEMO.xlsx')
sheet = wb.active
for row in sheet.iter_rows():
    print([cell.value for cell in row])