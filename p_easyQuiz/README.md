# EasyQuiz - 在线答题系统

## 启动方式

### 方式一：使用 Node.js 服务器（推荐）

```bash
# 进入目录
cd p_easyQuiz

# 启动服务器
node server.js
```

然后在浏览器打开 http://localhost:8080

### 方式二：使用 Python 服务器

```bash
# 进入目录
cd p_easyQuiz

# 启动服务器
python -m http.server 8080
```

然后在浏览器打开 http://localhost:8080

### 方式三：使用 http-server 工具

```bash
# 安装 http-server
npm install

# 启动
npm start
```

## 功能

- 内置4个JavaScript基础题库
- 支持上传题库（JSON/TXT/MD格式）
- 支持粘贴题库文本
- AI智能解析（豆包）
- 考试模式/游戏模式
- 错题复习
- 历史记录