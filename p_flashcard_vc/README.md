# 闪记 (p_flashcard_vc)

基于小条记(p_spark_record)复制的闪记项目。

## 项目结构

```
p_flashcard_vc/
├── app.js                # 入口
├── app.json              # 配置
├── app.wxss              # 全局样式
├── pages/
│   ├── index/           # 首页
│   ├── note/            # 新建小条
│   ├── compose/         # 合成文章
│   ├── article/         # 文章详情
│   └── settings/       # 设置
├── utils/
│   └── database.js      # 本地存储
└── images/            # 图片资源
```

## 功能

- 微信登录
- 创建小条（文字+图片+录音）
- 分类管理
- AI润色（简明/口语/文言/文艺/正式）
- 合成文章

## 待修改

- [ ] app.json 修改名称
- [ ] 连接Vercel后端API
- [ ] 集成火山引擎AI