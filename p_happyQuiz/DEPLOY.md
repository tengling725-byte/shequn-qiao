# 小测 - Supabase 部署指南

## 1. 初始化 Supabase 项目

```bash
# 安装 CLI（如果未安装）
npm install -g supabase

# 初始化
cd p_happyQuiz
supabase init

# 链接到项目（输入数据库密码）
supabase link --project-ref kzxufzrbqdnhlxcfozkc
```

## 2. 设置环境变量

在 Supabase 后台设置环境变量：
- 进入 Settings → Edge Functions
- 添加变量：`DOUBAO_API_KEY = fbe2e6b0-582c-42c8-80a7-b1cbd403500a`

或者用 CLI：
```bash
supabase secrets set DOUBAO_API_KEY=fbe2e6b0-582c-42c8-80a7-b1cbd403500a
```

## 3. 部署 Edge Function

```bash
supabase functions deploy parse
```

## 4. 创建数据库表

在 Supabase 后台 SQL Editor 执行：
```sql
-- 执行 supabase/migrations/20260507_initial.sql 的内容
```

或者：
```bash
supabase db push
```

## 5. 前端配置

在 `src/storage/supabase.js` 中填写你的配置：
```javascript
const supabaseUrl = 'https://kzxufzrbqdnhlxcfozkc.supabase.co';
const supabaseAnonKey = '你的 anon key';
```

---

## 运行项目

```bash
# H5 运行
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```