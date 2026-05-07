# organize-wechat-files

English name: organize-wechat-files

将微信聊天导出的文件按年份和文件类型分类整理。

## 使用方法

```powershell
# 进入技能目录
cd C:\Workspace\opencode\skills\organize-wechat-files

# 运行整理程序
.\organize-wechat-files.ps1 -source_path "源文件夹路径" -target_path "目标文件夹路径"
```

## 参数说明

| 参数 | 说明 | 必需 | 默认值 |
|------|------|------|--------|
| source_path | 源文件夹路径（微信文件目录） | 是 | - |
| target_path | 目标文件夹路径 | 是 | - |
| operation | 操作方式：move（移动）或 copy（复制） | 否 | move |
| skip_existing | 已存在则跳过 | 否 | true |
| mark_empty | 标记空目录 | 否 | true |
| generate_log | 生成日志 | 否 | true |

## 示例

```powershell
# 基本用法
.\organize-wechat-files.ps1 -source_path "C:\Users\xxx\Documents\wechat\file" -target_path "C:\整理\微信文件"

# 复制模式（不移动原文件）
.\organize-wechat-files.ps1 -source_path "C:\Users\xxx\Documents\wechat\file" -target_path "C:\整理\微信文件" -operation "copy"
```

## 工作相关关键词

默认包含以下关键词的文件会归入"工作相关"子目录：

- 元创
- 先风
- 广集
- 小蜂
- 得瑞
- 麦斯塔
- 海容
- 存风
- 容风
- 安风
- 苹起
- 苹一
- 苹二
- shinefore
- 印芯
- 莱特
- 融卡
- 光子瑞利

## 注意事项

1. **操作方式**：默认是移动（剪切），不是复制，原文件会被移到目标目录
2. **跳过已存在**：如果目标目录已有同名文件，默认会跳过
3. **空目录标记**：处理完成后，源文件夹的空子目录会标记为 `_已空`
4. **日志文件**：会在目标文件夹根目录生成日志文件

## 依赖

- PowerShell 5.1+
- Windows 操作系统