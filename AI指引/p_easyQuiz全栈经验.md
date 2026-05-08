# p_easyQuiz 全栈经验

基于对 p_easyQuiz 全量代码的复盘，按架构层次梳理的真实踩坑和设计决策。

---

## 一、前端（纯原生 JS SPA）

### const 对象 + 内联 onclick 必须挂 window

`const QuizApp = {...}` 不会自动挂到 `window`，但 `onclick="QuizApp.xxx()"` 通过 window 作用域查找。不加 `window.QuizApp = QuizApp`，所有按钮静默无反应，且不抛异常（内联事件吞 TypeError）。

### hash 路由的自净机制

`navigate()` 内部设 `location.hash` 会触发 `hashchange`，而 hashchange 又调路由 —— 死循环。用 `_ignoreHash` 标记：navigate 改 hash 前设 true，hashchange handler 检测到 true 跳过本次路由。

### innerHTML 渲染 + escapeHtml 是一体的

全应用用 innerHTML 拼页面，用户上传的题目内容直接插入 HTML 字符串。必须在每个拼接入点调用 escapeHtml（转义 `& < >`），否则用户上传一道含 `<script>` 的题目就是 XSS。

### 哈希去重比 JSON 全文比较高效

DJB2 哈希 O(n) 算出 content hash 存入 Set，O(1) 判重。比每次导入遍历所有已导入题库做 JSON.stringify 比较高效——题库多了差距明显。

---

## 二、后端（Cloudflare Workers）

### CORS 通配符手写后缀匹配

CORS 标准不支持 `*.pages.dev`，Worker 里自己实现：`*` 全放通、精确域名、`*.domain` 后缀匹配三种模式。CORS origin 检查逻辑放主路由入口，用 `withCors()` 包装函数统一给每个 Response 注入 header，避免遗漏。

### 跨域 Session 的三个必要条件

Pages（`*.pages.dev`）调 Workers（`*.workers.dev`）是跨域。Session cookie 必须：`HttpOnly`（防 XSS 读 token）+ `SameSite=None`（允许跨站发送）+ `Secure`（仅 HTTPS）。少一个都不行。

### 401 用 CustomEvent 全局广播

api.js 统一拦截所有 401，`dispatchEvent(new CustomEvent('unauthorized'))` 通知上层。app.js 监听此事件处理 session 过期跳转。好处：每个 API 调用方不需要自己处理登录过期。

### 手写路由不需要框架

Worker 用 if-else 链匹配 method + path，拆到 auth.js / db.js / session.js / ai-proxy.js 各模块。几十个端点以内完全够用，依赖为零。

---

## 三、数据库（Cloudflare D1）

### D1 迁移默认本地执行

`wrangler d1 execute --file` 默认操作本地，不加 `--remote` 输出 "successfully" 但生产库没变化。线上 Worker 报 `no such table` 才知道。

### Session 表 JOIN 减少查询

session 查询时一次 JOIN users 表同时拿到 user_id / username / email，省去先查 session 再查 user 的二次查询。

### D1 适合全免费栈

D1 + Workers + Pages 都是 Cloudflare 免费层，个人/小团队项目零成本。成本天然决定选型。

---

## 四、动态加载数据

### 登录/未登录双路径存储

storage.js 每个方法先判断 `Auth.isLoggedIn()`：已登录走 Worker API，未登录走 localStorage。登录后 `syncLocalToCloud()` 一次性把本地临时数据批量同步到云端。

### 题库加载三层：config → 文件 → 内存缓存

quiz-loader.js 先用 config.json 拿题库清单，再逐个 fetch JSON 文件，结果放内存 cache 避免重复请求。新增题库只需加 JSON + 更新 config，代码不动。

---

## 五、接受用户上传

### parser + AI 兜底的宽进严出

上传文件先走本地 parser（TagBasedParser），失败则弹窗询问是否 AI 解析。AI 通过 Worker 代理调用豆包 API，Key 不落前端。AI 返回结果再经 normalizeQuestion 统一为标准格式。

### parser 的实战细节

- **繁简兼容**：繁简映射表 + 词组优先替换，题库来源可能混用繁简
- **多题库文件**：一份文件可含多个题库（banks 数组），单题库自动降级为旧格式向后兼容
- **section 抑制**：解析 section 中的 "A选项" 可能是文本内容，通过当前 section 判断是否抑制选项格式匹配
- **幂等 normalize**：已有 correctAnswerIds 的题目直接返回，避免导入/乱序/选择等路径重复处理

### 乱序时 code 和 correctAnswerIds 的同步

shuffleOptions 打乱选项后重分配 code（A B C D），但 correctAnswerIds 基于 id 而非 code 索引，所以乱序不影响正确答案映射。同时维护 _oldCodeToNewCode 供需要旧映射的场景使用。

### 判断题三种答案来源归一化

normalizeQuestion 处理判断题时依次尝试三种来源：correctAnswers 数组（"正确"/"错误"）→ options[].isCorrect → 直接 answer 字符串，最终统一为 correctAnswerIds: [0] 或 [1]。

---

## 六、部署

### 前后端独立部署

Pages 部署前端静态文件（`wrangler pages deploy public`），Worker 部署后端 API（`wrangler deploy`），无互相依赖。CORS 在 Worker 端通过 `ALLOWED_ORIGINS` 环境变量控制。

### 本地开发服务器也做路径遍历防护

`node server.js` 虽是开发用途，但仍用 `path.normalize` + 前缀比对防 `../` 攻击。开发不养成习惯，上线容易遗漏。

---

## 核心原则

- **零依赖**：前端原生 JS、后端无框架，部署简单维护成本低
- **密钥不落前端**：第三方 API 调用经 Worker 代理，Key 走 `wrangler secret put`
- **宽进严出**：接受 JSON/Markdown/TXT/繁简混用，内部统一标准格式
- **渐进降级**：parser 失败 → AI 解析；AI 失败 → 明确错误反馈
- **错误路径显式处理**：CORS header 不漏、401 广播、session 过期都有明确的代码路径对应

---

## 七、当前代码的可维护性问题（诚实评估）

以下问题在代码规模尚小时不明显，但随功能增长会急剧恶化。

### 问题一：app.js 职责过度集中

1300 行的 app.js 把路由、渲染、答题逻辑、文件上传、登录注册、题库管理、导出全部塞在 `QuizApp` 对象里。七个职责混在一起，所有状态堆在 `this.state` 扁平大对象中，任何方法都可能修改任何状态。

**后果**：加一个新功能（如收藏题、笔记、排行榜）就得往这个文件继续塞代码。到 2000-3000 行时，找 bug 需要在整个文件里跳来跳去，改一处可能影响看似无关的另一处（因为共享 `this.state`）。

### 问题二：innerHTML 全量重建，每次切页面都销毁重建 DOM

`navigate(page)` → `app.innerHTML = this.renderXxx()` 把整个页面 DOM 树销毁再从头生成。以下内容实际上不需要每次重建：
- 题库列表（导入后没变过）
- 历史记录列表（数据不变的情况下）
- 自定义题库列表

**三重浪费**：
1. 浏览器重绘/重排的 CPU 开销
2. 之前 `addEventListener` 绑的事件全丢，必须每次 render 后重新 `attachEvents()`
3. 滚动位置、输入框焦点等用户状态丢失

**具体风险**：当自定义题库积累到 50+、错题积累到几百条时，home 页和 errors 页一次渲染几百个 DOM 节点，滚动会出现可感知的不流畅。

### 问题三：数据三处存储，同步逻辑散落

用户数据同时存在于三个位置：
- 内存：`this.state.customQuizzes`
- 本地：`localStorage`（未登录时）
- 云端：Worker → D1（登录后）

`addCustomQuiz` 要同时操作内存、localStorage、可能还要调 `API.saveQuiz`。`handleLogout` 要清四样东西：`this.state`、`easyQuiz_custom`、`quiz_custom`、`quiz_errors`、`quiz_history`。同步逻辑分散在 app.js 各处（handleLoginSubmit、handleLogout、syncLocalToCloud、addCustomQuiz、saveCustomQuizzes），没有一个统一的"数据层"。

**最可能的 bug**：localStorage 里有但云端没有、登录后云端同步覆盖了本地新加的数据、登出时漏清某个 key。

### 问题四：HTML 模板全用 JS 字符串拼接

所有页面的 HTML 模板都用字符串拼接写在 JS 方法里。`renderHome` 一个函数 80 行字符串拼接，改一个按钮样式要在一堆 `${}` 中翻找。没有任何模板语法高亮或 IDE 支持。

### 当前结论

现在代码能用，功能正确，测试通过。当前规模下这些问题只是"不舒服"，不是"不能工作"。真正的临界点在于：

- 新增 2-3 个页面 → app.js 破 2000 行，开始难维护
- 自定义题库 50+ → home 页渲染开始卡顿
- 错题几百条 → errors 页一次 innerHTML 几百个 analysis-item

---

## 八、如果将来重构，方向建议

**不做大爆炸式重写**。按痛苦程度的优先级逐步来：

### 第一步：渲染改为增量更新

不再全量 `app.innerHTML = ...`。每个页面区域用独立的 `<div id="xxx">` 容器，数据变了只更新对应容器。滚动位置、输入焦点不丢失，重绘开销大幅降低。

### 第二步：抽离数据层 DataStore

把 localStorage 和 API 的读写统一到一个模块。外部只需调 `DataStore.addQuiz()` / `DataStore.getHistory()`，不关心底层是本地还是云端。同步逻辑只有一个入口，不会漏清或重复。

### 第三步：app.js 按页面拆 view 模块

每个页面一个 view（home.js、quiz.js、result.js、errors.js 等），各管各的渲染和事件。app.js 只负责路由调度和初始化。

### 不急着做的事

- 不用急着上框架（React/Vue）。当前纯原生 JS 的零依赖优势是真实的，上框架会引入构建工具链，复杂度翻倍。
- 不用急着把所有逻辑从 app.js 搬出来。先按痛苦程度最高的问题逐步改，每次改完跑一遍测试确保不坏。