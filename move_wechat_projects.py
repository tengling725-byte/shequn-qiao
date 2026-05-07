import os
import shutil

源目录 = r"C:\my工作\微信文件"
目标根目录 = r"C:\my工作"

项目映射 = {
    "得瑞": "项目_得瑞",
    "印芯": "项目_印芯", 
    "海容": "项目_海容",
    "光子瑞利": "项目_光子瑞利",
    "莱特": "项目_莱特",
    "麦斯塔": "项目_麦斯塔"
}

日志内容 = []
移动数量 = 0
已存在数量 = 0

# 遍历所有文件
for root, dirs, files in os.walk(源目录):
    if "工作相关" not in root:
        continue
    
    for folder in dirs:
        if folder in 项目映射:
            项目文件夹源 = os.path.join(root, folder)
            目标项目目录 = os.path.join(目标根目录, 项目映射[folder])
            
            # 确保目标目录存在
            if not os.path.exists(目标项目目录):
                os.makedirs(目标项目目录)
            
            # 处理该项目下的所有文件（包括子目录）
            for dirpath, subdirs, subfiles in os.walk(项目文件夹源):
                for file in subfiles:
                    源文件路径 = os.path.join(dirpath, file)
                    if os.path.isfile(源文件路径):
                        # 获取文件名和扩展名
                        文件名, 扩展名 = os.path.splitext(file)
                        # 新文件名添加"来自微信"
                        新文件名 = f"{文件名}来自微信{扩展名}"
                        目标文件路径 = os.path.join(目标项目目录, 新文件名)
                        
                        # 复制文件（如果目标已存在则跳过）
                        if os.path.exists(目标文件路径):
                            已存在数量 += 1
                        else:
                            shutil.copy2(源文件路径, 目标文件路径)
                            移动数量 += 1
                        
                        # 记录日志
                        日志内容.append(f"{源文件路径} -> {目标文件路径}")

print(f"已移动 {移动数量} 个文件")
print(f"已存在跳过 {已存在数量} 个文件")

# 写入日志
日志文件 = os.path.join(目标根目录, "微信文件移动日志_项目_20260427.txt")
with open(日志文件, "w", encoding="utf-8") as f:
    f.write(f"微信文件移动日志 - 项目类 (2026-04-27)\n")
    f.write(f"移动文件数量: {移动数量}\n")
    f.write(f"已存在数量: {已存在数量}\n")
    f.write("="*80 + "\n\n")
    for line in 日志内容:
        f.write(line + "\n")

print(f"日志已写入: {日志文件}")