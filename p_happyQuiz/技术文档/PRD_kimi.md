 好的，基于你的更新，我输出修订后的设计文档。

---

# 小测 MVP 设计文档（修订版）

## 1. 产品定位

| 项目 | 内容 |
|-----|------|
| 名称 | 小测 |
| 一句话描述 | 个人题库管理 + 智能组卷 + 测验记录工具 |
| 目标用户 | 自学者、备考者、知识工作者 |
| 核心场景 | 上传题库 → 随机组卷 → 测验 → 即时/后看解析 → 追踪掌握度 |
| 差异化 | 本地优先（隐私）、AI解析非结构化文本、考试/游戏双模式 |

---

## 2. 功能范围（MVP）

```
┌─────────────────────────────────────────┐
│  题库管理                                │
│  ├── 导入：粘贴文本（MD/TXT格式）         │
│  ├── AI解析 → 预览确认 → 保存             │
│  ├── 本地存储（IndexedDB）                │
│  └── 云端存储（Supabase，可选同步）        │
├─────────────────────────────────────────┤
│  测验                                     │
│  ├── 选择题库 → 设置题量/模式             │
│  │   ├── 考试模式：做完看答案             │
│  │   └── 游戏模式：即时看答案+解析         │
│  ├── 答题（单题展示，选项乱序）            │
│  ├── 标记不确定 / 上一题/下一题           │
│  └── 提交 → 即时判分                      │
├─────────────────────────────────────────┤
│  结果与记录                               │
│  ├── 得分、正确率、用时                   │
│  ├── 逐题回顾（正确答案+解析）             │
│  ├── 错题自动收录                         │
│  └── 历史测验记录列表                     │
├─────────────────────────────────────────┤
│  用户系统（云端功能前置）                  │
│  └── 微信登录 / 手机号登录                 │
└─────────────────────────────────────────┘
```

**明确不做（V2考虑）**：
- Word/PDF导入
- 题库市场/付费
- 社交分享
- 复杂统计图表
- 多设备实时同步

---

## 3. 数据模型

### 3.1 题目结构（统一JSON）

```json
{
  "id": "uuid",
  "bankId": "题库uuid",
  "type": "single_choice | multiple_choice | true_false",
  "content": "题干文本",
  "options": [
    { "id": 0, "text": "选项A" },
    { "id": 1, "text": "选项B" }
  ],
  "correctIndex": [2],
  "explanation": "解析文本",
  "difficulty": 1,
  "tags": ["JS基础", "变量"],
  "source": "用户导入/内置",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3.2 题库结构

```json
{
  "id": "uuid",
  "title": "JavaScript基础",
  "description": "变量、函数、异步",
  "category": "编程",
  "questionCount": 25,
  "isLocal": true,
  "isSynced": false,
  "cloudId": null,
  "userId": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 3.3 测验记录结构

```json
{
  "id": "uuid",
  "bankId": "题库uuid",
  "bankTitle": "JavaScript基础",
  "userId": "用户id或local",
  "questionCount": 10,
  "correctCount": 7,
  "score": 70,
  "duration": 180,
  "quizMode": "exam | game",
  "answers": [
    {
      "questionId": "题uuid",
      "userAnswer": [1],
      "correctIndex": [2],
      "isCorrect": false,
      "timeSpent": 15,
      "showExplanationImmediately": false
    }
  ],
  "wrongQuestionIds": ["题uuid1", "题uuid2"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 4. 存储架构

### 4.1 本地存储（IndexedDB）

```
数据库名：QuizDB
版本：1

对象存储：
├─ banks (keyPath: id)
│   索引：isLocal, userId
├─ questions (keyPath: id)  
│   索引：bankId
├─ sessions (keyPath: id)
│   索引：bankId, userId, createdAt
└─ wrongQuestions (keyPath: id)
    索引：questionId, bankId
```

### 4.2 云端存储（Supabase）

```sql
-- 题库表
create table banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  title text not null,
  description text,
  category text,
  question_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 题目表
create table questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid references banks on delete cascade,
  type text check (type in ('single_choice', 'multiple_choice', 'true_false')),
  content text not null,
  options jsonb not null,
  correct_index int[] not null,
  explanation text,
  difficulty int default 1,
  tags text[] default '{}'
);

-- 测验记录表
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  bank_id uuid references banks,
  bank_title text,
  question_count int,
  correct_count int,
  score int,
  duration int,
  quiz_mode text check (quiz_mode in ('exam', 'game')),
  answers jsonb,
  wrong_question_ids uuid[],
  created_at timestamptz default now()
);

-- Row Level Security：用户只能看自己的数据
alter table banks enable row level security;
create policy "Users can only access own banks" on banks
  for all using (auth.uid() = user_id);
```

---

## 5. 核心算法

### 5.1 组卷算法

```javascript
function generateQuiz(bankId, questionCount, options = {}) {
  // 1. 获取题库所有题目
  const pool = await getQuestionsByBank(bankId);
  
  // 2. 过滤（如按难度、标签）
  let filtered = pool;
  if (options.difficulty) {
    filtered = filtered.filter(q => q.difficulty === options.difficulty);
  }
  if (options.excludeIds) {
    filtered = filtered.filter(q => !options.excludeIds.includes(q.id));
  }
  
  // 3. 随机洗牌（Fisher-Yates）
  const shuffled = shuffle([...filtered]);
  
  // 4. 截取题量
  const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
  
  // 5. 选项乱序 + 记录新正确答案位置
  return selected.map(q => {
    const { options: shuffledOpts, newCorrectIndex } = shuffleOptions(q.options, q.correctIndex);
    return {
      ...q,
      displayOptions: shuffledOpts,
      displayCorrectIndex: newCorrectIndex,
      userAnswer: null,
      isMarked: false,
      showExplanation: options.quizMode === 'game' // 游戏模式即时显示
    };
  });
}

function shuffleOptions(options, correctIndex) {
  const indexed = options.map((opt, i) => ({ ...opt, originalIndex: i }));
  const shuffled = shuffle(indexed);
  
  const newCorrectIndex = Array.isArray(correctIndex) 
    ? correctIndex.map(ci => shuffled.findIndex(s => s.originalIndex === ci))
    : shuffled.findIndex(s => s.originalIndex === correctIndex);
    
  return {
    options: shuffled.map(({ originalIndex, ...opt }) => opt),
    newCorrectIndex
  };
}
```

### 5.2 判分算法

```javascript
function calculateScore(answers) {
  let correct = 0;
  
  const details = answers.map(a => {
    const isCorrect = Array.isArray(a.correctIndex)
      ? arraysEqual([...a.userAnswer].sort(), [...a.correctIndex].sort())
      : a.userAnswer === a.correctIndex;
      
    if (isCorrect) correct++;
    
    return {
      ...a,
      isCorrect
    };
  });
  
  return {
    score: Math.round((correct / answers.length) * 100),
    correctCount: correct,
    totalCount: answers.length,
    details
  };
}
```

---

## 6. 页面结构（UniApp）

```
pages/
├── index/                    # 首页：题库列表 + 开始测验入口
│   └── index.vue
├── bank/
│   ├── list.vue              # 我的题库（本地+云端）
│   ├── import.vue            # 导入题库（粘贴文本）
│   ├── preview.vue           # AI解析后预览确认
│   └── detail.vue            # 题库详情（题目列表）
├── quiz/
│   ├── setup.vue             # 组卷设置（题量、模式选择）
│   ├── play.vue              # 答题界面（核心页面）
│   └── result.vue            # 结果页（得分+回顾）
├── review/
│   ├── history.vue           # 测验历史列表
│   ├── wrong.vue             # 错题本
│   └── detail.vue            # 单次测验详情
├── user/
│   └── index.vue             # 我的（登录/设置/关于）
└── login/
    └── index.vue             # 登录页（微信/手机号）
```

---

## 7. 关键流程

### 7.1 导入题库

```
用户粘贴文本
    ↓
前端提取纯文本
    ↓
判断格式：
    ├── MD格式 → 正则解析
    └── TXT格式 → 正则解析（按约定分隔符）
        ↓
解析失败 → 调用AI API解析
        ↓
结构化JSON预览
    ↓
用户编辑/删除/确认
    ↓
选择存储：
    ├── 本地 → IndexedDB
    └── 云端 → 需登录 → Supabase
```

### 7.2 测验流程（考试模式 vs 游戏模式）

```
┌─────────────────┐     ┌─────────────────┐
│    考试模式      │     │    游戏模式      │
│   (exam mode)   │     │   (game mode)   │
└────────┬────────┘     └────────┬────────┘
         ↓                       ↓
    选择题库/题量             选择题库/题量
         ↓                       ↓
    开始答题                   开始答题
         ↓                       ↓
    只显示题目+选项            显示题目+选项
    （不显示答案）              ↓
         ↓                  选择答案后立即：
    全部做完 → 提交              ├── 显示对错
         ↓                     ├── 显示正确答案
    展示结果页                   ├── 显示解析
    ├── 得分                     └── 自动下一题
    ├── 正确率               全部做完 → 结果页
    ├── 用时
    └── 逐题回顾（此时看解析）
```

---

## 8. API 设计（Supabase）

| 端点 | 方法 | 说明 |
|-----|------|------|
| `/rest/v1/banks` | GET/POST/DELETE | 题库CRUD |
| `/rest/v1/questions` | GET/POST | 题目（批量插入） |
| `/rest/v1/sessions` | GET/POST | 测验记录 |
| `/auth/v1/token` | POST | 微信登录/手机号登录 |
| `/storage/v1/object` | POST | 文件上传（未来扩展） |

---

## 9. 技术栈确认

| 层级 | 技术 | 用途 |
|-----|------|------|
| 前端框架 | UniApp + Vue3 | 小程序 + H5 |
| UI组件 | uni-ui / uview-plus | 快速搭建界面 |
| 本地存储 | IndexedDB (封装) | 离线题库、记录 |
| 云端 | Supabase | 数据库、认证、存储 |
| AI解析 | DeepSeek API | 非结构化文本→题目 |
| 部署 | 微信小程序后台 + Vercel(H5) | 双端发布 |

---

## 10. MVP里程碑（15天）

| 阶段 | 天数 | 产出 | 验收标准 |
|:---|:---:|------|---------|
| **S1：地基** | 1-3 | IndexedDB封装、首页框架 | 能增删改查本地题库 |
| **S2：核心** | 4-7 | 导入解析、组卷、答题（双模式） | 能完整做一次测验（考试/游戏） |
| **S3：闭环** | 8-10 | 判分、回顾、历史记录 | 能看到错题和统计 |
| **S4：云端** | 11-12 | Supabase接入、登录 | 数据可云端备份 |
| **S5：打磨** | 13-15 | UI优化、部署、测试 | 小程序+H5可访问 |

---

## 11. 内置题库（MVP填充）

| 题库 | 题数 | 来源 |
|-----|:---:|------|
| JavaScript基础 | 20 | 你今天学的语法 |
| SQL基础 | 15 | CRUD、JOIN、索引 |
| HTML/UniApp基础 | 10 | 标签、组件、生命周期 |
| HTTP协议 | 10 | 方法、状态码、缓存 |
| 设计模式入门 | 10 | 工厂、策略、状态、观察者 |

---