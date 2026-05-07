# Cloudflare Pages 部署指南

## 方式一：通过 Cloudflare Dashboard 上传

### 步骤

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com
   - 进入 Pages 页面

2. **创建项目**
   - 点击 "Create a project"
   - 选择 "Upload assets" (不用连接Git)

3. **上传文件**
   - 将 `p_easyQuiz` 文件夹内容打包上传
   - 确保包含所有文件：
     - `index.html`
     - `css/style.css`
     - `js/*.js`
     - `js/题库/*.json`

4. **设置自定义域名**
   - 在项目设置中点击 "Custom domains"
   - 添加你的阿里云域名
   - 按照 Cloudflare 指示配置 DNS

5. **DNS 配置（阿里云）**
   - 登录阿里云域名控制台
   - 添加 DNS 记录指向 Cloudflare

## 方式二：通过 Wrangler CLI 部署

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy .
```

## 方式三：通过 GitHub 集成

1. 将项目推送到 GitHub
2. 在 Cloudflare Pages 连接 GitHub 仓库
3. 配置构建命令（静态站无需构建）

---

## 注意事项

### 1. API Key 安全
当前 API Key 以 Base64 形式硬编码在前端，存在暴露风险。生产环境建议：
- 使用 Cloudflare Workers 作为代理
- 或使用环境变量注入

### 2. 题库文件
所有 `js/题库/*.json` 文件将作为静态资源部署到 CDN。

### 3. 自定义域名配置
```
域名: quiz.example.com
CNAME → 你的Cloudflare项目地址
```