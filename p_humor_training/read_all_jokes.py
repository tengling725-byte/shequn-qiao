# -*- coding: utf-8 -*-
import mammoth
import os

folder = r'C:\Workspace\opencode\jokes_source'
files = os.listdir(folder)

all_text = []

for f in files:
    filepath = os.path.join(folder, f)
    print(f"Processing: {f}")
    try:
        with open(filepath, 'rb') as docx_file:
            if f.endswith('.docx'):
                result = mammoth.convert_to_markdown(docx_file)
                all_text.append(f"=== {f} ===\n")
                all_text.append(result.value)
    except Exception as e:
        print(f"Error: {e}")

# Write all content
with open(r'C:\Workspace\opencode\all_jokes.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(all_text))

print("Done! Total files processed:", len(files))