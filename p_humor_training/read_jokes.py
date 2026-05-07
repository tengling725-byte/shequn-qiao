# -*- coding: utf-8 -*-
import os
import sys

folder = r'C:\Users\Sophie\Documents\脱口秀等\脱口秀\3.单人脱口秀段子-2250条'

files = os.listdir(folder)

output = []

for f in files:
    filepath = os.path.join(folder, f)
    output.append(f"\n=== {f} ===\n")
    try:
        from docx import Document
        doc = Document(filepath)
        for p in doc.paragraphs:
            text = p.text.strip()
            if text and len(text) > 5:
                output.append(text)
                output.append('---')
    except Exception as e:
        output.append(f"Error: {str(e)}\n")

with open(r'C:\Workspace\opencode\jokes_output.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done! Output written to jokes_output.txt")