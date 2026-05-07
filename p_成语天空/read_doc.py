# -*- coding: utf-8 -*-
import win32com.client
import os

doc_path = r"C:\Workspace\opencode\p_成语填空\谦辞敬辞类53个.doc"
print(f"File exists: {os.path.exists(doc_path)}")

word = win32com.client.Dispatch("Word.Application")
word.Visible = False

doc = word.Documents.Open(doc_path)

output = []
for para in doc.Paragraphs:
    text = para.Range.Text.strip()
    if text:
        output.append(text)

doc.Close(False)
word.Quit()

# Write to file with proper encoding
with open(r"C:\Workspace\opencode\p_成语填空\成语.txt", "w", encoding="utf-8") as f:
    for line in output:
        f.write(line + "\n")

print("Done! File saved.")
for line in output[:20]:
    print(line)