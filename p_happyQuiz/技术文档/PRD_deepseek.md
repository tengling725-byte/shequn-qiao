以下是 **QuizEasy MVP 完整设计文档**，整合了所有讨论内容，你可以直接用于开发。

---

# QuizEasy MVP 完整设计文档

## 一、项目概述

| 项目名称 | QuizEasy |
|---------|---------|
| 一句话描述 | 支持 TXT/MD 题库上传、双模式答题、本地+云端双存储的轻量级测评工具 |
| 目标用户 | 个人学习者、教育者、题库创作者 |
| MVP 目标 | 验证“任意文本题库 → 结构化答题 → 双模式计分 → 记录追踪”的产品闭环 |
| 技术栈 | React + Vite + Supabase + localStorage |

---

## 二、功能范围

### 2.1 MVP 功能清单

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **题库管理** | 上传 TXT/MD 文件解析成结构化题库 | P0 |
| | 题库列表展示（标题、题目数、科目） | P0 |
| | 删除本地题库 | P0 |
| **答题核心** | 按题库顺序答题（一道一题） | P0 |
| | 两种答案显示时机：即时 / 考试模式 | P0 |
| | 两种计分方式：考试型 / 游戏型 | P0 |
| | 自动判卷、计分 | P0 |
| | 结果页展示得分 + 错题解析 | P0 |
| **测试记录** | 保存每次答题记录（本地存储） | P0 |
| | 历史记录列表 | P0 |
| | 点击记录查看错题详情 | P0 |
| **数据存储** | 本地存储（localStorage） | P0 |
| | 云端存储（Supabase，需登录） | P1 |
| **用户系统** | 注册/登录 | P1 |
| | 云端同步题库和记录 | P1 |

### 2.2 后续功能（P1/P2）

- 题库分享/市场
- 付费题库
- 多题型支持（判断、填空、简答）
- 随机组卷、每日挑战
- 统计分析图表
- 成就系统、等级系统

---

## 三、数据结构定义

### 3.1 题库（QuestionBank）

```typescript
interface QuestionBank {
  id: string;                    // UUID
  name: string;                  // 题库名称
  description?: string;          // 描述
  category?: string;             // 科目（JS/SQL/HTML）
  questionCount: number;         // 题目数量
  questions: Question[];         // 题目数组
  createdAt: string;             // ISO 时间
  updatedAt: string;             // ISO 时间
  userId?: string;               // 云端：所属用户
  isPublic?: boolean;            // 云端：是否公开
}
```

### 3.2 题目（Question）

```typescript
interface Question {
  id: string;                    // 题目唯一标识（q1, q2...）
  text: string;                  // 题干
  options: string[];             // 选项数组（4项）
  correct: number;               // 正确答案索引 0-3
  explanation?: string;          // 解析
}
```

### 3.3 答题会话配置（QuizSessionConfig）

```typescript
interface QuizSessionConfig {
  // 答案显示时机
  answerTiming: 'immediate' | 'exam';   // 即时 / 考试
  
  // 计分方式
  scoringMode: 'exam' | 'game';          // 考试型 / 游戏型
  
  // 游戏型专属配置（可选）
  gameConfig?: {
    baseScorePerQuestion: number;        // 每题基础分，默认 10
    streakBonus: number;                 // 连续正确额外加分，默认 5
    timeBonus: boolean;                  // 是否启用计时加分
    timeLimitPerQuestion?: number;       // 每题时间限制（秒）
  };
}
```

### 3.4 测试记录（TestRecord）

```typescript
interface TestRecord {
  id: string;                    // UUID
  bankId: string;                // 关联题库ID
  bankName: string;              // 题库名称（冗余）
  date: string;                  // ISO 时间
  
  // 配置信息
  config: {
    answerTiming: 'immediate' | 'exam';
    scoringMode: 'exam' | 'game';
  };
  
  // 得分信息（考试型）
  examScore?: number;            // 百分制分数
  
  // 得分信息（游戏型）
  gameScore?: number;            // 游戏分数（经验值）
  maxStreak?: number;            // 最高连对数
  
  // 通用信息
  total: number;
  correctCount: number;
  wrongQuestions: WrongQuestion[];
  answers: number[];             // 每道题用户选的答案索引
  
  userId?: string;               // 云端：所属用户
}
```

### 3.5 错题详情（WrongQuestion）

```typescript
interface WrongQuestion {
  id: string;
  text: string;
  userAnswer: string;            // 用户选的选项字母（A/B/C/D）
  correctAnswer: string;         // 正确答案字母
  explanation?: string;
}
```

### 3.6 用户设置（UserSettings）

```typescript
interface UserSettings {
  // 默认答题配置
  defaultAnswerTiming: 'immediate' | 'exam';
  defaultScoringMode: 'exam' | 'game';
  
  // 游戏型配置
  gameConfig: {
    baseScorePerQuestion: number;
    streakBonus: number;
    enableSound: boolean;
    enableAnimation: boolean;
  };
  
  // 主题
  theme: 'light' | 'dark';
}
```

---

## 四、TXT/MD 格式规范

### 4.1 用户模板（推荐格式）

```text
# 题库名称：JavaScript 基础测验

## 题目1
以下哪个是 JavaScript 的变量声明关键字？
A. var
B. const
C. let
D. 以上都是
答案：D
解析：var/let/const 都是 JS 声明变量的关键字

## 题目2
以下哪个是 React 的 Hook？
A. useState
B. useEffect
C. useContext
D. 以上都是
答案：D
解析：这些都是 React 提供的内置 Hook
```

### 4.2 解析规则

| 标记 | 含义 | 提取内容 |
|------|------|---------|
| `# 题库名称：xxx` | 题库名称 | `xxx` |
| `## 题目N` | 题目分隔符 | - |
| 第一行非标记文本 | 题干 | 完整行 |
| `A. xxx` / `B. xxx` / `C. xxx` / `D. xxx` | 选项 | `xxx` |
| `答案：X` | 正确答案 | `X` 转为索引 0-3 |
| `解析：xxx` | 解析 | `xxx` |

### 4.3 解析失败处理

- 解析失败时，展示具体错误位置
- 允许用户手动修改文本后重新解析
- 提供“手动添加题目”作为降级方案

---

## 五、页面结构与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页（题库列表） | 展示所有题库，上传入口 |
| `/quiz/:bankId` | 答题页 | 展示题目，记录答案 |
| `/result/:recordId` | 结果页 | 展示得分、错题、解析 |
| `/records` | 历史记录页 | 测试记录列表 |
| `/record/:recordId` | 记录详情页 | 错题回顾 |
| `/upload` | 上传页 | TXT/MD 上传 + 预览 + 确认入库 |
| `/settings` | 设置页 | 用户偏好配置 |

---

## 六、核心流程设计

### 6.1 上传题库流程

```text
用户选择 TXT/MD 文件
        ↓
前端读取文件内容
        ↓
调用 parseTxtToQuestions()
        ↓
展示解析预览（题库名、题目列表、选项、答案）
        ↓
用户确认 / 修改
        ↓
生成题库对象，存入 localStorage
        ↓
跳转到题库列表页
```

### 6.2 答题流程（含模式选择）

```text
用户选择题库 → 点击「开始答题」
        ↓
弹出配置弹窗（答案显示时机、计分方式）
        ↓
用户确认配置
        ↓
┌───────────────┴───────────────┐
↓                               ↓
即时模式                       考试模式
每答一题立即显示反馈            全部答完后统一显示
手动点击下一题                 自动/手动进入下一题
↓                               ↓
└───────────────┬───────────────┘
                ↓
          最后一题提交
                ↓
         自动判卷计算得分
                ↓
    生成测试记录，存入 localStorage
                ↓
         跳转到结果页展示
```

### 6.3 即时模式详细流程

```text
展示第 N 题
    ↓
用户选择选项
    ↓
【立即显示】正确/错误 + 解析
    ↓
用户点击「下一题」
    ↓
展示第 N+1 题
    ↓
循环...
    ↓
最后一题提交后，展示最终得分
```

### 6.4 考试模式详细流程

```text
展示第 N 题
    ↓
用户选择选项
    ↓
不显示反馈，只记录答案
    ↓
自动进入下一题（或手动）
    ↓
循环直到最后一题
    ↓
点击「提交试卷」
    ↓
统一展示得分 + 错题列表 + 解析
```

### 6.5 记录追踪流程

```text
结果页提交后自动生成记录
        ↓
记录存入 localStorage
        ↓
历史记录页读取并列表展示
        ↓
点击某条记录 → 展示错题详情
（当时答案 + 正确答案 + 解析）
```

---

## 七、计分算法设计

### 7.1 考试型计分

```javascript
function calculateExamScore(answers, questions) {
  let correctCount = 0;
  const maxScore = 100;
  
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correct) {
      correctCount++;
    }
  }
  
  const perQuestionScore = maxScore / questions.length;
  const totalScore = correctCount * perQuestionScore;
  
  return {
    examScore: Math.round(totalScore),
    correctCount,
    total: questions.length
  };
}
```

### 7.2 游戏型计分

```javascript
function calculateGameScore(answers, questions, config) {
  let totalScore = 0;
  let streak = 0;
  let maxStreak = 0;
  const baseScore = config.baseScorePerQuestion || 10;
  const streakBonus = config.streakBonus || 5;
  
  for (let i = 0; i < questions.length; i++) {
    const isCorrect = answers[i] === questions[i].correct;
    
    if (isCorrect) {
      streak++;
      let questionScore = baseScore;
      
      // 连续正确额外加分（每3连对加一次）
      if (streak >= 3) {
        questionScore += streakBonus * Math.floor(streak / 3);
      }
      
      totalScore += questionScore;
      
      if (streak > maxStreak) {
        maxStreak = streak;
      }
    } else {
      streak = 0;  // 答错重置连对计数
    }
  }
  
  return {
    gameScore: totalScore,
    maxStreak,
    correctCount: answers.filter((a, i) => a === questions[i].correct).length,
    total: questions.length
  };
}
```

---

## 八、界面设计

### 8.1 首页 / 题库列表

```
┌─────────────────────────────────────┐
│  QuizEasy                     [+ 上传] │
├─────────────────────────────────────┤
│  📚 我的题库                         │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ JavaScript 基础              │    │
│  │ 10 道题 · 最近更新 2025-01-15│    │
│  │ [开始答题] [删除]             │    │
│  └─────────────────────────────┘    │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ SQL 基础入门                 │    │
│  │ 8 道题 · 最近更新 2025-01-14 │    │
│  │ [开始答题] [删除]             │    │
│  └─────────────────────────────┘    │
│                                      │
│  [📊 历史记录] [⚙️ 设置]             │
└─────────────────────────────────────┘
```

### 8.2 答题配置弹窗

```
┌─────────────────────────────────────┐
│  ⚙️ 答题设置                         │
├─────────────────────────────────────┤
│  答案显示时机                         │
│  ○ 即时模式（每题显示答案和解析）       │
│  ● 考试模式（全部答完后统一显示）       │
│                                      │
│  计分方式                            │
│  ● 考试型（严肃计分，百分制）          │
│  ○ 游戏型（经验值，连对奖励）          │
│                                      │
│  ┌─────────────────────────────┐    │
│  │     [开始答题]               │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 8.3 答题页（即时模式）

```
┌─────────────────────────────────────┐
│  JavaScript 基础测验      [练习模式] │
│  进度：3 / 10                        │
├─────────────────────────────────────┤
│  以下哪个是 JavaScript 的变量声明     │
│  关键字？                            │
│                                      │
│  ● A. var                            │
│  ○ B. const                          │
│  ○ C. let                            │
│  ○ D. 以上都是                       │
├─────────────────────────────────────┤
│  ✅ 回答正确！                        │
│  var/let/const 都是 JS 声明变量的     │
│  关键字。                            │
├─────────────────────────────────────┤
│         [下一题]                      │
└─────────────────────────────────────┘
```

### 8.4 答题页（考试模式）

```
┌─────────────────────────────────────┐
│  JavaScript 基础测验      [考试模式] │
│  进度：3 / 10                        │
├─────────────────────────────────────┤
│  以下哪个是 JavaScript 的变量声明     │
│  关键字？                            │
│                                      │
│  ○ A. var                            │
│  ○ B. const                          │
│  ○ C. let                            │
│  ● D. 以上都是                       │
├─────────────────────────────────────┤
│         [下一题]                      │
│  （无即时反馈）                       │
└─────────────────────────────────────┘
```

### 8.5 结果页（考试型）

```
┌─────────────────────────────────────┐
│  📊 考试成绩：85分                   │
│  正确：17/20                         │
│  超过 72% 的参与者                    │
├─────────────────────────────────────┤
│  ❌ 错题回顾（3道）                   │
│                                      │
│  题目：以下哪个是 React 的状态管理    │
│  方案？                              │
│  你的答案：A. Redux                  │
│  正确答案：D. 以上都是                │
│  解析：Redux/MobX/Zustand 都是       │
├─────────────────────────────────────┤
│  [再试一次]    [返回首页]             │
└─────────────────────────────────────┘
```

### 8.6 结果页（游戏型）

```
┌─────────────────────────────────────┐
│  🎮 本次得分：1,250 经验              │
│  正确：15/20                         │
│  最高连对：8 题                       │
│  获得成就：「连对大师」✨              │
├─────────────────────────────────────┤
│  等级提升：Lv.12 → Lv.13              │
│  解锁新皮肤：代码忍者 🥷               │
├─────────────────────────────────────┤
│  [再试一次]    [返回首页]             │
└─────────────────────────────────────┘
```

### 8.7 历史记录页

```
┌─────────────────────────────────────┐
│  📊 历史记录                         │
├─────────────────────────────────────┤
│  2025-01-15 14:30                    │
│  JavaScript 基础                     │
│  考试模式 · 85分 (17/20)              │
│  [查看详情]                          │
├─────────────────────────────────────┤
│  2025-01-14 20:15                    │
│  JavaScript 基础                     │
│  游戏模式 · 1,250 XP · 连对8题        │
│  [查看详情]                          │
├─────────────────────────────────────┤
│  2025-01-13 09:30                    │
│  SQL 基础入门                        │
│  考试模式 · 62分 (5/8)                │
│  [查看详情]                          │
└─────────────────────────────────────┘
```

---

## 九、技术实现要点

### 9.1 TXT 解析函数

```javascript
function parseTxtToBank(fileContent, fileName) {
  const lines = fileContent.split('\n');
  const bank = {
    id: crypto.randomUUID(),
    name: fileName.replace(/\.(txt|md)$/, ''),
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let currentQuestion = null;
  
  for (const line of lines) {
    // 匹配 "## 题目N"
    if (line.startsWith('## 题目')) {
      if (currentQuestion) bank.questions.push(currentQuestion);
      currentQuestion = { 
        id: `q${bank.questions.length + 1}`, 
        options: [],
        correct: -1
      };
    }
    // 匹配题干（第一个非标记行）
    else if (currentQuestion && !currentQuestion.text && line.trim() && !line.startsWith('##')) {
      currentQuestion.text = line.trim();
    }
    // 匹配选项
    else if (currentQuestion && /^[A-D]\./.test(line.trim())) {
      const optionText = line.trim().substring(2).trim();
      currentQuestion.options.push(optionText);
    }
    // 匹配答案
    else if (currentQuestion && line.startsWith('答案：')) {
      const answerLetter = line.substring(3).trim().toUpperCase();
      const index = ['A', 'B', 'C', 'D'].indexOf(answerLetter);
      if (index !== -1) currentQuestion.correct = index;
    }
    // 匹配解析
    else if (currentQuestion && line.startsWith('解析：')) {
      currentQuestion.explanation = line.substring(3).trim();
    }
  }
  
  if (currentQuestion) bank.questions.push(currentQuestion);
  bank.questionCount = bank.questions.length;
  return bank;
}
```

### 9.2 答题引擎 Hook

```javascript
function useQuiz(bankId, config) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [immediateFeedback, setImmediateFeedback] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  
  const bank = getBank(bankId);
  const questions = bank.questions;
  const isImmediate = config.answerTiming === 'immediate';
  
  // 选择答案
  const selectAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
    
    // 即时模式：立即显示反馈
    if (isImmediate) {
      const isCorrect = answerIndex === questions[currentIndex].correct;
      setImmediateFeedback({
        isCorrect,
        explanation: questions[currentIndex].explanation
      });
    }
    
    // 考试模式：自动进入下一题
    if (!isImmediate && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // 下一题（即时模式用）
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImmediateFeedback(null);
    } else {
      submitQuiz();
    }
  };
  
  // 提交试卷
  const submitQuiz = () => {
    let result;
    if (config.scoringMode === 'exam') {
      result = calculateExamScore(answers, questions);
    } else {
      result = calculateGameScore(answers, questions, config.gameConfig);
    }
    
    setFinalResult(result);
    setIsFinished(true);
    
    // 保存记录
    saveTestRecord(bank, answers, config, result);
  };
  
  return {
    currentQuestion: questions[currentIndex],
    currentIndex,
    total: questions.length,
    answers,
    immediateFeedback,
    finalResult,
    isFinished,
    selectAnswer,
    nextQuestion,
    submitQuiz
  };
}
```

### 9.3 本地存储服务

```javascript
// 保存题库
function saveBankLocal(bank) {
  const banks = JSON.parse(localStorage.getItem('quiz_banks') || '[]');
  const index = banks.findIndex(b => b.id === bank.id);
  if (index >= 0) {
    banks[index] = bank;
  } else {
    banks.push(bank);
  }
  localStorage.setItem('quiz_banks', JSON.stringify(banks));
}

// 读取所有题库
function getBanksLocal() {
  return JSON.parse(localStorage.getItem('quiz_banks') || '[]');
}

// 删除题库
function deleteBankLocal(bankId) {
  const banks = getBanksLocal().filter(b => b.id !== bankId);
  localStorage.setItem('quiz_banks', JSON.stringify(banks));
}

// 保存测试记录
function saveRecordLocal(record) {
  const records = JSON.parse(localStorage.getItem('quiz_records') || '[]');
  records.unshift(record); // 最新的在最前
  localStorage.setItem('quiz_records', JSON.stringify(records.slice(0, 200)));
}

// 读取测试记录
function getRecordsLocal() {
  return JSON.parse(localStorage.getItem('quiz_records') || '[]');
}
```

### 9.4 用户设置服务

```javascript
// 默认设置
const DEFAULT_SETTINGS = {
  defaultAnswerTiming: 'immediate',
  defaultScoringMode: 'exam',
  gameConfig: {
    baseScorePerQuestion: 10,
    streakBonus: 5,
    enableSound: true,
    enableAnimation: true
  },
  theme: 'light'
};

// 获取设置
function getSettings() {
  const saved = localStorage.getItem('quiz_settings');
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
}

// 保存设置
function saveSettings(settings) {
  localStorage.setItem('quiz_settings', JSON.stringify(settings));
}
```

---

## 十、数据库表结构（Supabase，P1阶段）

```sql
-- 题库表
CREATE TABLE question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  questions JSONB NOT NULL,
  question_count INT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 测试记录表
CREATE TABLE test_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bank_id UUID REFERENCES question_banks(id),
  bank_name TEXT NOT NULL,
  config JSONB NOT NULL,
  exam_score INT,
  game_score INT,
  max_streak INT,
  total INT NOT NULL,
  correct_count INT NOT NULL,
  wrong_questions JSONB,
  answers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_test_records_user_id ON test_records(user_id);
CREATE INDEX idx_test_records_bank_id ON test_records(bank_id);
CREATE INDEX idx_question_banks_user_id ON question_banks(user_id);
```

---

## 十一、MVP 验收标准

| 编号 | 验收项 | 通过标准 |
|------|--------|---------|
| 1 | 上传解析 | 上传符合格式的 TXT 文件，能正确解析出题库 |
| 2 | 题库管理 | 列表展示、删除功能正常 |
| 3 | 即时模式 | 每题答完后立即显示正确/错误 + 解析 |
| 4 | 考试模式 | 全部答完后统一显示得分和错题解析 |
| 5 | 考试型计分 | 百分制计算正确 |
| 6 | 游戏型计分 | 连续正确额外加分，统计最高连对 |
| 7 | 配置弹窗 | 答题前能选择模式，配置被正确应用 |
| 8 | 配置记忆 | 下次答题时记住上次的选择 |
| 9 | 记录保存 | 刷新页面后历史记录仍然存在 |
| 10 | 记录区分 | 历史记录中标明是哪种模式和得分类型 |
| 11 | 错题回顾 | 点击历史记录能看到错题详情 |
| 12 | 无报错 | 控制台无红色错误 |

---

## 十二、后续扩展方向

| 阶段 | 功能 | 优先级 |
|------|------|--------|
| P1 | 用户注册/登录，云端同步题库和记录 | 高 |
| P1 | 题库分享链接，生成二维码 | 高 |
| P2 | 多题型支持（判断、填空） | 中 |
| P2 | 随机组卷、每日挑战 | 中 |
| P3 | 付费题库市场 | 低 |
| P3 | AI 智能解析任意格式文档 | 低 |

---

## 十三、开发排期

| 阶段 | 内容 | 预估时间 |
|------|------|---------|
| Day 1 | 项目初始化 + 固定题库 + 基础答题流程 | 4-6 小时 |
| Day 2 | TXT 解析 + 本地存储 | 4-6 小时 |
| Day 3 | 答题配置弹窗 + 即时/考试模式 | 4-6 小时 |
| Day 4 | 考试型/游戏型计分 | 4-6 小时 |
| Day 5 | 历史记录 + 错题回顾 | 4-6 小时 |
| Day 6 | UI 优化 + 部署 | 4-6 小时 |
| Day 7 | 测试 + Bug 修复 | 2-4 小时 |

---
