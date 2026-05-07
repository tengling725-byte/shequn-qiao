# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pandas as pd

df = pd.read_excel(r'C:\Workspace\opencode\xlsx\员工绩效表-DEMO.xlsx')
print('员工姓名:')
for name in df['员工姓名']:
    print(name)