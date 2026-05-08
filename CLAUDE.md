# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 基本规则

- 每次对话必须称呼我为"小花"
- 对于不确定的事情，必须请示我来决定
- 如果我的指示不清楚，向我提问来澄清
- 在动手做事之前，复述任务的目标和行动计划，得到我的同意再执行
- 对于后台运行的长时间任务，必须每隔1分钟向我汇报一次状态
- 被纠正后反思原因，将防再犯规则写入 `./AI指引/` 目录，并在本文件「自省学到的规则」章节添加引用

## 仓库架构

这是一个**多项目仓库**，包含多个独立的 `p_` 前缀项目（产品/工具/研究），外加 Python 脚本和工具集。

- `p_*` — 独立项目目录，每个都是一个完整的子项目
- `r_*` — 参考/研究资料目录（.gitignore 排除，不跟踪）
- `skills/` — Claude Code skill 安装目录（软链接到 `~/.agents/skills`）
- `tools/` — 工具脚本
- 根目录 `.py` 文件 — 独立的 Python 脚本（多为 PDF/Excel 处理）

## 工作流程
1. 先充分提问把需求/方案聊透，不要急着写代码
2. 达成一致后批量实现
3. 每个功能点完成后运行相关测试验证
4. 代码审查后确保通过再提交

## 单元测试
- "测试全部通过"才算完成
- "测试失败了"需要修复后再继续

## 提交规范
- 使用英文 commit message
- 格式：<type>(<scope>): <subject>
- 每个任务独立 commit，便于 review 和回滚

**项目概览**见 `./项目汇总.md`，**每个项目的运行方式**见 `./p_项目运行方式分析.md`。

## 自省学到的规则

- **输出文件目录规则**：单一源文件输出到同目录，多源文件跨目录时必须询问用户
- **日期处理规则**：处理"今天"等日期必须调用系统 date 命令，不可依赖大模型知识
- **Cloudflare Pages 部署规则**：静态站点先 `wrangler pages project create` 创建项目；上传用 `--commit-dirty=true` 处理未提交状态；DNS 只需添加 CNAME 指向 `.pages.dev` 地址
- **JS const 与 window 关系**：`const`/`let` 不挂载到 `window`，但内联 `onclick` 通过作用域链查 `window`。对象定义后必须 `window.X = X` 显式赋值，否则点击无反应（详见 `./AI指引/前端调试常见陷阱.md`）
- **D1 数据库迁移**：`wrangler d1 execute --file` 默认本地执行，生产数据库必须加 `--remote`，否则 Worker 查询时报 `no such table`
- **p_easyQuiz 部署架构**：前端 Pages + 后端 Worker 独立部署，CORS 通过 Worker 的 `ALLOWED_ORIGINS` 环境变量控制
- **JS await 优先级陷阱**：`await fn().filter()` 是 `await (fn().filter())` 而不是 `(await fn()).filter()`。Promise 上没有 `.filter()` 会抛 TypeError（详见 `./AI指引/代码审查经验.md`）
- **静态文件服务路径遍历**：`req.url` 直接拼路径是安全漏洞，必须做路径边界校验
- **密钥管理**：密钥不落盘到配置文件（toml/yaml/json），走平台 Secret 管理；`.env` 必须在 `.gitignore` 中
- **无用依赖**：`package.json` 中未引用的依赖应移除，减少安装时间和安全审计范围

## 代码规范

- 使用中文注释
- 保持代码简洁

## 常用命令

| 场景 | 命令 |
|------|------|
| 运行 Python 脚本 | `python <script.py>` |
| p_easyQuiz 本地启动 | `node server.js` 或 `npm start`（端口 8080） |
| p_easyQuiz 部署 | `wrangler deploy`（Worker）+ `wrangler pages deploy public --commit-dirty=true`（Pages） |
| p_file_summarizer 启动 | `python app.py`（端口 5000） |
| p_shinefore_vc / Next.js 项目 | `npm run dev` |
| p_happyQuiz（uni-app） | `npm run dev:h5` |
| 纯静态项目（大部分 p_*） | 直接用浏览器打开 `index.html` |
| Cloudflare Worker 部署 | `wrangler deploy` |
| Cloudflare D1 操作 | `wrangler d1 execute <db-name> --file=<sql> --remote` |

## Skills

- 安装新 skill：在 `C:\Workspace\opencode\skills\` 中创建子目录并安装
- 无法安装到该目录时：报错，并在该目录中放入软链接，链接到 `~/.agents/skills`
