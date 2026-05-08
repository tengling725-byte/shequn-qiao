你描述的是一种**基于标签的声明式 parser**，而不是当前的“关键词匹配 + 状态机”方式。

下面我给出完整的设计方案。

---

## 一、整体架构

```
原始文本
    ↓
Lexer（词法分析）→ 识别「标签」和「体」
    ↓
Parser（语法分析）→ 构建「题库 - 题目」结构
    ↓
Normalizer（规范化）→ 标准化题型、选项、答案
    ↓
Shuffler（乱序）→ 题目乱序、选项乱序、答案同步更新
```

---

## 二、数据结构设计

### 2.1 题库 (QuestionBank)

```typescript
interface QuestionBank {
  title: string;           // 题库名称
  description?: string;    // 题库描述
  questions: Question[];   // 题目列表
  metadata?: {
    createdAt?: string;
    tags?: string[];
  };
}
```

### 2.2 题目 (Question)

```typescript
interface Question {
  id: string;              // 唯一标识
  stem: string;            // 题干（必填）
  type: 'single' | 'multiple' | 'true_false';  // 题型
  options: Option[];       // 选项列表
  correctAnswers: string[]; // 正确答案代码，如 ['A'] 或 ['A','C'] 或 ['正确']
  explanation?: string;     // 解析（可选）
  metadata?: {
    difficulty?: 1 | 2 | 3 | 4 | 5;
    tags?: string[];
  };
}
```

### 2.3 选项 (Option)

```typescript
interface Option {
  code: string;    // 'A', 'B', 'C', 'D'...
  text: string;    // 选项内容
}
```

### 2.4 标签定义 (Tags)

```typescript
const TAGS = {
  // 试卷级标签
  BANK: ['题库', '试卷', 'QuestionBank'],
  
  // 题目级标签
  QUESTION: ['题目', '题干', '问题', 'Question'],
  OPTIONS: ['选项', 'Options', '选择'],
  CORRECT: ['正确答案', '答案', 'Answer', '正确选项'],
  EXPLANATION: ['解析', '讲解', 'Explanation', '解析'],
  
  // 判断题特殊值
  TRUE_VALUES: ['正确', '对', 'True', 'true', '✓'],
  FALSE_VALUES: ['错误', '错', 'False', 'false', '✗']
};
```

---

## 三、函数设计

### 3.1 核心 Parser 类

```javascript
class TagBasedParser {
  constructor(customTags = {}) {
    this.tags = { ...TAGS, ...customTags };
    this.currentBank = null;
    this.currentQuestion = null;
  }

  /**
   * 主入口：解析全文
   * @param {string} content - 原始文本
   * @returns {QuestionBank}
   */
  parse(content) { ... }

  /**
   * 词法分析：按行切分，识别每行的「标签类型」和「体内容」
   * @param {string} line 
   * @returns {{ type: string, body: string } | null}
   */
  tokenize(line) { ... }

  /**
   * 判断一行是否以指定标签开头
   * @param {string} line 
   * @param {string[]} tagList 
   * @returns {string | null}
   */
  matchTag(line, tagList) { ... }

  /**
   * 提取标签后的内容（去除标点、空格）
   * @param {string} line 
   * @param {string} tag 
   * @returns {string}
   */
  extractBody(line, tag) { ... }

  /**
   * 解析选项体
   * @param {string} optionsBody 
   * @returns {Option[]}
   */
  parseOptions(optionsBody) { ... }

  /**
   * 解析正确答案体
   * @param {string} correctBody 
   * @param {Option[]} options 
   * @returns {{ type: string, answers: string[] }}
   */
  parseCorrectAnswer(correctBody, options) { ... }

  /**
   * 规范化题目对象
   * @param {Partial<Question>} raw 
   * @returns {Question}
   */
  normalizeQuestion(raw) { ... }
}
```

### 3.2 乱序器 (Shuffler)

```javascript
class QuestionShuffler {
  /**
   * 乱序整个题库
   * @param {QuestionBank} bank 
   * @returns {QuestionBank}
   */
  shuffleBank(bank) { ... }

  /**
   * 打乱题目顺序
   * @param {Question[]} questions 
   * @returns {Question[]}
   */
  shuffleQuestions(questions) { ... }

  /**
   * 打乱单个题目的选项顺序，并同步更新正确答案
   * @param {Question} question 
   * @returns {Question}
   */
  shuffleOptions(question) { ... }

  /**
   * 重新映射正确答案（选项乱序后调用）
   * @param {string[]} oldCorrectCodes 
   * @param {Option[]} oldOptions 
   * @param {Option[]} newOptions 
   * @returns {string[]}
   */
  remapCorrectAnswers(oldCorrectCodes, oldOptions, newOptions) { ... }
}
```

---

## 四、核心解析流程（伪代码）

```javascript
parse(content) {
  const lines = content.split('\n');
  let state = 'expecting_bank';  // expecting_bank | in_question | expecting_options | expecting_correct | expecting_explanation
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const token = this.tokenize(trimmed);
    if (!token) continue;
    
    switch (token.type) {
      case 'bank':
        this.currentBank = { title: token.body, questions: [] };
        state = 'in_question';
        break;
        
      case 'question':
        this.currentQuestion = { stem: token.body, options: [], correctAnswers: [] };
        state = 'expecting_options';
        break;
        
      case 'options':
        this.currentQuestion.options = this.parseOptions(token.body);
        state = 'expecting_correct';
        break;
        
      case 'correct':
        const { type, answers } = this.parseCorrectAnswer(token.body, this.currentQuestion.options);
        this.currentQuestion.type = type;
        this.currentQuestion.correctAnswers = answers;
        state = 'expecting_explanation';
        break;
        
      case 'explanation':
        this.currentQuestion.explanation = token.body;
        this.currentBank.questions.push(this.normalizeQuestion(this.currentQuestion));
        this.currentQuestion = null;
        state = 'in_question';
        break;
        
      default:
        // 多行处理：追加到当前正在积累的 body
        if (state === 'expecting_options' && this.currentQuestion) {
          // 选项可能跨行，特殊处理
        }
    }
  }
  
  return this.currentBank;
}
```

---

## 五、与现有代码的对比

| 维度 | 当前 parser | 新 parser |
|------|------------|-----------|
| 识别方式 | 关键词 `startsWith` | 标签匹配 + 体提取 |
| 格式依赖 | 依赖冒号、空格 | 标签后任意分隔符 |
| 多行支持 | 状态机复杂 | 按「体」累积，更清晰 |
| 正确答案映射 | 写死在 `normalizeQuestion` | 集中处理，支持乱序重映射 |
| 乱序后答案 | ❌ 需手动同步 | ✅ `remapCorrectAnswers` 自动重算 |
| 扩展性 | 新增关键词需改多处 | 修改 `TAGS` 配置即可 |

---

## 六、测试用例

```javascript
describe('TagBasedParser', () => {
  it('应正确解析标准格式', () => {
    const content = `
题库：Git 核心知识

题目：Git 中暂存区的概念是什么？
选项：
A. 直接提交的区域
B. 临时存放修改的区域
C. 只读区域
正确答案：B
解析：暂存区是 commit 前的准备区域。
    `;
    const result = parser.parse(content);
    expect(result.questions[0].correctAnswers).toEqual(['B']);
  });

  it('应正确解析多选 + 乱序后答案同步', () => {
    const content = `
题目：哪些是 Git 操作？
选项：
A. commit
B. push
C. pull
正确答案：ABC
    `;
    const result = parser.parse(content);
    const shuffled = shuffler.shuffleOptions(result.questions[0]);
    const expectedCodes = ['A','B','C'];
    expect(shuffled.correctAnswers.sort()).toEqual(expectedCodes.sort());
  });
});
```

---

## 七、下一步

这个重构的工作量较大（约 300-400 行新代码）。我建议你：

1. **先确认数据结构** 是否符合你的需求
2. **我帮你写出完整的 `TagBasedParser` 类**，你可以直接替换当前的 `QuizParser`
3. **保留 `normalizeQuestion` 和 `shuffleOptions`** 作为工具函数

你希望我直接输出完整的 `TagBasedParser.js` 文件吗？（包含所有函数实现，可直接复制使用）