import os

base_folder = r"C:\Users\Sophie\Documents\r_行业研究报告\半导体"
keywords = ["月报", "月度", "周报", "周度"]

total_deleted = 0

for root, dirs, files in os.walk(base_folder):
    folder_deleted = 0
    for file in files:
        if any(kw in file for kw in keywords):
            file_path = os.path.join(root, file)
            try:
                os.remove(file_path)
                print(f"已删除: {file}")
                folder_deleted += 1
                total_deleted += 1
            except Exception as e:
                print(f"删除失败 {file}: {e}")
    if folder_deleted > 0:
        print(f"  该文件夹删除了 {folder_deleted} 个文件")

print(f"\n总计删除了 {total_deleted} 个文件")