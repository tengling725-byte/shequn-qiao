/**
 * TagBasedParser - 基于标签的题库解析器
 * 
 * 支持的格式：
 * 1. 显式标签：### 题目：、**题干**：、正确答案：等
 * 2. 数字序号：1. 题干、2、题干、3 - 题干
 * 3. 软标签：题1、第2题、题目3、No.5
 * 4. 选项：A. 内容、A、内容、(A) 内容、【A】内容
 * 5. 判断题：正确/错误、对/错、True/False、不正确/不对
 * 
 * 输出格式与旧版 QuizParser 完全兼容，可直接替换
 * 支持简繁中文标签识别
 */

// ========== 繁简转换映射表 ==========
const TRAD_TO_SIMP = {
  // 常用字
  '題': '题', '幹': '干', '選': '选', '項': '项',
  '講': '讲', '說': '说', '明': '明', '確': '确',
  '誤': '误', '錯': '错', '問': '问', '擇': '择',
  '對': '对', '試': '试', '卷': '卷', '標': '标',
  '準': '准', '參': '参', '考': '考', '正': '正',
  '解': '解', '析': '析', '答': '答', '案': '案',
  '選': '选', '擇': '择', '項': '项', '目': '目'
};

// 扩展映射：常见繁体词组
const TRAD_PHRASES = {
  '題目': '题目',
  '題幹': '题干',
  '問題': '问题',
  '選項': '选项',
  '選擇': '选择',
  '正確': '正确',
  '錯誤': '错误',
  '講解': '讲解',
  '說明': '说明',
  '答案': '答案',
  '解析': '解析'
};

/**
 * 繁转简函数
 * @param {string} str - 原始字符串
 * @returns {string} 简体字符串
 */
const toSimplified = (str) => {
  if (!str) return str;
  // 先尝试替换常见词组
  let result = str;
  for (const [trad, simp] of Object.entries(TRAD_PHRASES)) {
    result = result.replace(new RegExp(trad, 'g'), simp);
  }
  // 再替换单个字符
  return result.split('').map(ch => TRAD_TO_SIMP[ch] || ch).join('');
};

// ========== 标签配置（使用简体） ==========
const DEFAULT_TAGS = {
  // 试卷级标签
  BANK: ['题库', '试卷', 'QuestionBank', 'Bank'],
  
  // 题目级标签
  QUESTION: ['题目', '题干', '问题', 'Question', 'Stem'],
  OPTIONS: ['选项', 'Options', 'Choices', '选择'],
  CORRECT: ['正确答案', '答案', 'Answer', 'Correct', '正确选项', '标准答案', '参考答案'],
  EXPLANATION: ['解析', '讲解', 'Explanation', 'Explain', '注解', '详解', '解析：'],
  
  // 判断题真值
  TRUE_VALUES: ['正确', '对', 'True', 'true', '✓', '是'],
  FALSE_VALUES: ['错误', '错', 'False', 'false', '✗', '否', '不正确', '不对', 'not true', 'not false']
};

// ========== 辅助函数 ==========
const stripMarkdown = (line) => {
  // 去掉行首的 Markdown 标记、括号、书名号、空格等
  return line.replace(/^[#*>\-\s\[\]\(\)\{\}《》【】]+/, '');
};

// ========== 主类 ==========
class TagBasedParser {
  constructor(customTags = {}) {
    this.tags = {
      ...DEFAULT_TAGS,
      ...customTags
    };
    this.reset();
  }

  reset() {
    this.banks = [];
    this.currentBank = null;
    this.currentQuestion = null;
    this.currentSection = null;
    this.currentMultiline = '';
    this.currentOptionsText = '';
  }

  /**
   * 主入口：解析全文
   * @param {string} content - 原始文本
   * @param {string} filename - 文件名（用于判断格式）
   * @returns {Object} 解析结果
   */
  parse(content, filename = 'unknown') {
    this.reset();
    
    // 自动检测格式（JSON 还是 Markdown/文本）
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return this.parseJSON(content);
      } catch (e) {
        console.warn('JSON 解析失败，尝试文本解析:', e.message);
      }
    }
    
    return this.parseText(content);
  }

  /**
   * 解析 JSON 格式题库
   */
  parseJSON(content) {
    try {
      const data = JSON.parse(content);
      if (!data.questions) {
        throw new Error('无效的 JSON 格式：缺少 questions 字段');
      }
      return {
        title: data.title || '未命名题库',
        description: data.description || '',
        questions: data.questions.map((q, i) => this.normalizeQuestion(q, i))
      };
    } catch (e) {
      throw new Error('JSON 解析失败: ' + e.message);
    }
  }

  /**
   * 解析文本格式题库
   */
  parseText(content) {
    // 初始化多题库收集器
    this.banks = [];
    this.currentBank = null;

    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // 转换为简体用于匹配标签
      const simplified = toSimplified(trimmed);

      const token = this.tokenize(simplified, trimmed, this.currentSection);

      if (!token) {
        // 题目标记后紧跟的独立行：作为题干内容（如 "## 题目 1" 后下一行是真正题干）
        if (this.currentQuestion && this.currentSection === 'stem' && !this.currentQuestion.stem) {
          this.currentQuestion.stem = trimmed;
          continue;
        }
        // 未识别的行：如果是多行内容，追加到当前块
        if (this.currentMultiline !== null) {
          this.currentMultiline += '\n' + trimmed;
        }
        continue;
      }

      // 处理多行内容累积
      if (this.currentMultiline) {
        this.flushMultiline();
      }

      this.processToken(token);
    }

    // 处理最后的多行内容
    if (this.currentMultiline) {
      this.flushMultiline();
    }

    // 保存最后一道题
    this.finalizeCurrentQuestion();

    // 保存最后一个题库
    if (this.currentBank && this.currentBank.questions.length > 0) {
      this.banks.push(this.currentBank);
    }

    if (this.banks.length === 0) {
      throw new Error('解析失败，未找到有效题目');
    }

    // 单题库：返回旧格式兼容
    if (this.banks.length === 1) {
      return this.banks[0];
    }
    // 多题库：返回新格式
    return { banks: this.banks };
  }

  /**
   * 词法分析：识别每行的类型
   * @param {string} line - 已转换为简体的行
   * @param {string} original - 原始行（用于保留内容）
   * @returns {{ type: string, body: string } | null}
   */
  tokenize(line, original = null, currentSection = null) {
    // 使用原始行作为内容，简化行用于匹配
    const contentLine = original || line;
    // 先清理行首 Markdown 标记（### 、- 等），统一后续匹配
    const cleaned = stripMarkdown(line);

    // 1. 显式标签（最高优先级）—— 任何 section 都识别
    const explicitTag = this.matchExplicitTag(line, contentLine);
    if (explicitTag) {
      return explicitTag;
    }

    // 解析 section 中：选项格式和 TF 答案极可能是内容（如 "A选项不对"），抑制识别
    // stem section 中：选项格式是正常过渡（题干→选项），不抑制
    const suppressInline = currentSection === 'explanation';

    // 2. 数字序号（1. 题干）
    const numbered = this.matchNumberedQuestion(cleaned);
    if (numbered) {
      return { type: 'question', body: numbered.body };
    }

    // 3. 软标签（题1、第2题、题目3）
    const softLabeled = this.matchSoftLabeledQuestion(cleaned);
    if (softLabeled && softLabeled.body) {
      return { type: 'question', body: softLabeled.body };
    }

    if (!suppressInline) {
      // 4. 选项（A. B. C.）
      if (this.isOptionFormat(cleaned)) {
        return { type: 'option', body: contentLine };
      }

      // 5. 独立判断题答案（"正确"、"错误"、"对"、"错" 等单独一行）
      if (this.isStandaloneTFAnswer(cleaned || line)) {
        return { type: 'correct', body: contentLine };
      }
    }

    return null;
  }

  /**
   * 处理识别到的 token
   */
  processToken(token) {
    switch (token.type) {
      case 'bank':
        // 保存上一个题库，创建新题库（支持多题库文件）
        if (this.currentBank && this.currentBank.questions.length > 0) {
          this.banks.push(this.currentBank);
        }
        this.currentBank = {
          title: token.body || '未命名题库',
          description: '',
          questions: []
        };
        break;
        
      case 'question':
        // 保存上一道题
        this.finalizeCurrentQuestion();
        // 创建新题目（如 body 只是编号 "1"，题干由后续内容行填充）
        let stem = token.body || '';
        if (/^\d{1,3}$/.test(stem.trim())) stem = '';
        this.currentQuestion = {
          stem: stem,
          options: [],
          correctAnswers: [],
          explanation: '',
          type: 'single'
        };
        this.currentSection = 'stem';
        break;
        
      case 'options':
        this.currentSection = 'options';
        this.currentOptionsText = token.body || '';
        break;
        
      case 'correct':
        if (this.currentQuestion) {
          const parsed = this.parseCorrectAnswer(token.body, this.currentQuestion.options);
          this.currentQuestion.type = parsed.type;
          this.currentQuestion.correctAnswers = parsed.answers;
        }
        // 答案已确定，后续行不再吸入题干，避免分隔线和 section 标题泄漏
        this.currentSection = 'answered';
        break;
        
      case 'explanation':
        if (this.currentQuestion) {
          this.currentQuestion.explanation = token.body;
        }
        this.currentSection = 'explanation';
        break;
        
      case 'option':
        if (this.currentQuestion && (this.currentSection === 'options' || this.currentSection === 'stem')) {
          const opt = this.parseOptionLine(token.body);
          if (opt) {
            this.currentQuestion.options.push(opt);
          }
        }
        break;
        
      default:
        break;
    }
  }

  /**
   * 处理多行内容
   */
  flushMultiline() {
    if (!this.currentMultiline) return;

    switch (this.currentSection) {
      case 'options':
        // 多行选项：按行解析
        const lines = this.currentMultiline.split('\n');
        for (const line of lines) {
          const opt = this.parseOptionLine(line.trim());
          if (opt && this.currentQuestion) {
            this.currentQuestion.options.push(opt);
          }
        }
        // 也处理选项标签后的单行内容
        if (this.currentOptionsText) {
          const opt = this.parseOptionLine(this.currentOptionsText);
          if (opt && this.currentQuestion) {
            this.currentQuestion.options.push(opt);
          }
          this.currentOptionsText = '';
        }
        break;
      case 'explanation':
        if (this.currentQuestion) {
          this.currentQuestion.explanation += '\n' + this.currentMultiline.trim();
        }
        break;
      case 'stem':
        if (this.currentQuestion) {
          this.currentQuestion.stem += '\n' + this.currentMultiline;
        }
        break;
      default:
        // answered / 未知 section：丢弃（分隔线、section 标题等）
        break;
    }

    this.currentMultiline = '';
  }

  /**
   * 保存当前题目（包含转换层）
   */
  finalizeCurrentQuestion() {
    if (this.currentQuestion && this.isQuestionValid(this.currentQuestion)) {
      // 无题库标签时自动创建默认题库
      if (!this.currentBank) {
        this.currentBank = {
          title: '导入题库',
          description: '',
          questions: []
        };
      }
      const normalized = this.normalizeQuestion(this.currentQuestion, this.currentBank.questions.length);
      this.currentBank.questions.push(normalized);
    }
    this.currentQuestion = null;
    this.currentSection = null;
  }

  /**
   * 匹配显式标签
   */
  matchExplicitTag(line, originalLine = null) {
    const trimmed = line.trim();
    const cleaned = stripMarkdown(trimmed);
    // 用于提取 body：优先用原始行（保留繁体），回退到简体行
    const originalCleaned = originalLine ? stripMarkdown(originalLine.trim()) : cleaned;

    // 试卷标签
    for (const tag of this.tags.BANK) {
      if (cleaned.toLowerCase().startsWith(tag.toLowerCase())) {
        const body = this.extractBody(originalCleaned, tag) || this.extractBody(cleaned, tag);
        return { type: 'bank', body };
      }
    }

    // 题目标签
    for (const tag of this.tags.QUESTION) {
      if (cleaned.toLowerCase().startsWith(tag.toLowerCase())) {
        const body = this.extractBody(originalCleaned, tag) || this.extractBody(cleaned, tag);
        if (body) return { type: 'question', body };
      }
    }

    // 选项标签
    for (const tag of this.tags.OPTIONS) {
      if (cleaned.toLowerCase().startsWith(tag.toLowerCase())) {
        const body = this.extractBody(originalCleaned, tag) || this.extractBody(cleaned, tag);
        return { type: 'options', body };
      }
    }

    // 正确答案标签
    for (const tag of this.tags.CORRECT) {
      if (cleaned.toLowerCase().startsWith(tag.toLowerCase())) {
        const body = this.extractBody(originalCleaned, tag) || this.extractBody(cleaned, tag);
        return { type: 'correct', body };
      }
    }

    // 解析标签
    for (const tag of this.tags.EXPLANATION) {
      if (cleaned.toLowerCase().startsWith(tag.toLowerCase())) {
        const body = this.extractBody(originalCleaned, tag) || this.extractBody(cleaned, tag);
        return { type: 'explanation', body };
      }
    }

    return null;
  }

  /**
   * 提取标签后的内容
   */
  extractBody(line, tag) {
    // 构建正则：标签 + 可选冒号/空格/括号 + 内容
    const regex = new RegExp(`(?:${tag})[\\]】》:：\\s]*(.*)`, 'i');
    const match = line.match(regex);
    if (match && match[1]) {
      return match[1].replace(/[*_~]+$/g, '').trim();
    }
    // 兜底：去掉标签后返回剩余部分
    const remaining = line.replace(new RegExp(`^${tag}`, 'i'), '').trim();
    // 如果兜底也没替换成功（繁简不匹配），返回空让调用方回退到简体行
    if (remaining === line.trim()) {
      return '';
    }
    return remaining.replace(/^[:：\s]+/, '').replace(/[*_~]+$/g, '');
  }

  /**
   * 匹配数字序号题目（1. 2、3- 等）
   */
  matchNumberedQuestion(line) {
    const patterns = [
      /^(\d+)[.、]\s*(.+)/,      // 1. 或 1、
      /^(\d+)\s*-\s*(.+)/,       // 1 -
      /^\((\d+)\)\s*(.+)/        // (1)
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[2] && match[2].trim()) {
        return {
          body: match[2].trim(),
          rawNumber: match[1]
        };
      }
    }
    return null;
  }

  /**
   * 匹配软标签题目（题1、第2题、题目3、No.5 等）
   * 使用 [题題] 兼容简体繁体
   */
  matchSoftLabeledQuestion(line) {
    const patterns = [
      /^[题題](\d+)\s+(.+)/,           // 题1 或 題1
      /^第(\d+)[题題]\s+(.+)/,         // 第2题 或 第2題
      /^[题題目](\d+)\s+(.+)/,         // 题目3 或 題目3
      /^[问問題](\d+)\s+(.+)/,         // 问题4 或 問題4
      /^(?:No\.|NO\.|no\.)(\d+)\s+(.+)/i,  // No.5
      /^(\d+)[题題]\s+(.+)/            // 1题 或 1題
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[2] && match[2].trim()) {
        return {
          body: match[2].trim(),
          rawNumber: match[1]
        };
      }
    }
    return null;
  }

  /**
   * 判断是否为独立判断题答案行（"正确"、"错误"、"对"、"错" 等）
   */
  isStandaloneTFAnswer(line) {
    const trimmed = line.trim();
    const allValues = [...this.tags.TRUE_VALUES, ...this.tags.FALSE_VALUES];
    return allValues.some(v => trimmed.toLowerCase() === v.toLowerCase());
  }

  /**
   * 判断是否为选项行
   */
  isOptionFormat(line) {
    return /^[A-Ga-g][.、:）)】]\s*/.test(line) ||
           /^（[A-G]）/.test(line) ||
           /^[(][A-G][)]/.test(line) ||
           /^[A-Ga-g]\s+[^\d]/.test(line);
  }

  /**
   * 解析单行选项
   */
  parseOptionLine(line) {
    // 先清理行首 Markdown 标记（如 "- A. content" → "A. content"）
    const cleaned = stripMarkdown(line);
    const patterns = [
      /^([A-Ga-g])[.、:）)】\s]+(.*)/,
      /^（([A-Ga-g])）\s*(.*)/,
      /^\(([A-Ga-g])\)\s*(.*)/,
      /^【([A-Ga-g])】\s*(.*)/
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        return {
          code: match[1].toUpperCase(),
          text: match[2].trim()
        };
      }
    }
    
    return null;
  }

  /**
   * 解析正确答案
   */
  parseCorrectAnswer(body, options) {
    // 先繁转简，确保繁简答案都能匹配
    const answerText = toSimplified(body.trim());
    const lowerAnswer = answerText.toLowerCase();

    // 判断题：检查是否为真值/假值
    if (this.tags.TRUE_VALUES.some(v => lowerAnswer === v.toLowerCase())) {
      return { type: 'true_false', answers: ['正确'] };
    }
    if (this.tags.FALSE_VALUES.some(v => lowerAnswer === v.toLowerCase())) {
      return { type: 'true_false', answers: ['错误'] };
    }
    
    // 选择题：提取字母
    const letters = answerText.match(/[A-Z]/gi);
    if (letters && letters.length > 0) {
      const answers = [...new Set(letters.map(l => l.toUpperCase()))];
      const type = answers.length > 1 ? 'multiple' : 'single';
      return { type, answers };
    }
    
    // 默认：单选题，空答案
    return { type: 'single', answers: [] };
  }

  /**
   * 核心转换层：将内部数据结构转换为旧版 QuizParser 兼容格式
   */
  normalizeQuestion(raw, index = 0) {
    // 幂等：已规范化的题目直接清理 isCorrect 后返回，避免双重 normalize 丢失 correctAnswerIds
    if (raw.correctAnswerIds && raw.correctAnswerIds.length > 0) {
      return {
        ...raw,
        options: (raw.options || []).map(opt => ({
          id: opt.id,
          code: opt.code || String.fromCharCode(65 + opt.id),
          text: opt.text
        }))
      };
    }

    const qid = `q-${Date.now()}-${index}`;

    // 判断题特殊处理
    if (raw.type === 'true_false') {
      // 兼容三种答案格式：correctAnswers 数组、answer 字符串、options[].isCorrect
      let tfAnswer = (raw.correctAnswers && raw.correctAnswers[0]) || raw.answer || '';
      // JSON 格式回退：从 options[].isCorrect 推导
      if (!tfAnswer && raw.options) {
        const correctOpt = raw.options.find(o => o.isCorrect);
        if (correctOpt) tfAnswer = correctOpt.text;
      }
      const isCorrect = this.tags.TRUE_VALUES.some(v => tfAnswer === v);
      return {
        id: qid,
        type: 'true_false',
        content: raw.stem || raw.content,
        options: [
          { id: 0, text: '正确' },
          { id: 1, text: '错误' }
        ],
        correctAnswerIds: isCorrect ? [0] : [1],
        explanation: raw.explanation || '',
        difficulty: raw.difficulty || 1,
        tags: raw.tags || []
      };
    }

    // 转换选项（去掉 isCorrect，改用 correctAnswerIds）
    const rawOptions = raw.options || [];
    const options = rawOptions.map((opt, idx) => ({
      id: idx,
      code: opt.code || String.fromCharCode(65 + idx), // JSON 格式无 code 时自动生成
      text: opt.text
    }));

    // 正确答案：优先从 correctAnswers（字母）推导，其次从 isCorrect 推导
    let correctAnswerIds;
    if (raw.correctAnswers && raw.correctAnswers.length > 0) {
      // 文本解析：correctAnswers 是字母数组，匹配 code
      correctAnswerIds = rawOptions
        .map((opt, idx) => raw.correctAnswers.includes(opt.code) ? idx : -1)
        .filter(id => id >= 0);
    } else if (rawOptions.some(o => o.isCorrect !== undefined)) {
      // JSON 格式：isCorrect 在选项上
      correctAnswerIds = rawOptions
        .map((opt, idx) => opt.isCorrect ? idx : -1)
        .filter(id => id >= 0);
    } else {
      correctAnswerIds = [];
    }

    let type = raw.type;
    if (type === 'multiple') type = 'multiple';
    else if (type === 'true_false') type = 'true_false';
    else type = 'single';

    return {
      id: qid,
      type: type,
      content: raw.stem || raw.content,
      options: options,
      correctAnswerIds: correctAnswerIds,
      explanation: raw.explanation || '',
      difficulty: raw.difficulty || 1,
      tags: raw.tags || []
    };
  }

  /**
   * 检查题目是否有效
   */
  isQuestionValid(question) {
    return question && 
           question.stem && 
           question.stem.trim() &&
           question.correctAnswers &&
           question.correctAnswers.length > 0;
  }

  /**
   * 检查题库数据（兼容旧版）
   */
  checkQuizData(data, content, filename) {
    if (!data.questions || data.questions.length < 5) {
      return { 
        needsAI: true, 
        error: `导入${data.questions?.length || 0}题，文件可能不规范，是否采用AI解析题目`, 
        content, 
        filename 
      };
    }
    return null;
  }

  // ========== 乱序功能 ==========
  
  shuffleBank(bank) {
    if (!bank || !bank.questions) return bank;
    const shuffled = { ...bank, questions: [...bank.questions] };
    for (let i = shuffled.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled.questions[i], shuffled.questions[j]] = [shuffled.questions[j], shuffled.questions[i]];
    }
    return shuffled;
  }

  shuffleOptions(question) {
    if (!question || !question.options || question.options.length === 0) return question;

    // 打乱顺序
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);

    // 旧 code → 新 code 映射（通过 id 找到每个选项的新位置）
    const oldCodeToNewCode = {};
    for (let i = 0; i < question.options.length; i++) {
      const opt = question.options[i];
      const newIndex = shuffled.findIndex(s => s.id === opt.id);
      oldCodeToNewCode[opt.code] = String.fromCharCode(65 + newIndex);
    }

    // 重新分配 code（A B C D...），id 不变
    const finalOptions = shuffled.map((opt, idx) => ({
      ...opt,
      code: String.fromCharCode(65 + idx)
    }));

    return {
      ...question,
      options: finalOptions,
      _oldCodeToNewCode: oldCodeToNewCode
    };
  }

  shuffleAllOptions(bank) {
    if (!bank || !bank.questions) return bank;
    return {
      ...bank,
      questions: bank.questions.map(q => this.shuffleOptions(q))
    };
  }
}

// ========== 兼容旧版 QuizParser API ==========
const QuizParser = {
  parse(content, filename) {
    try {
      const parser = new TagBasedParser();
      return parser.parse(content, filename);
    } catch (e) {
      return { needsAI: true, error: e.message, content, filename };
    }
  },

  checkQuizData(data, content, filename) {
    const parser = new TagBasedParser();
    return parser.checkQuizData(data, content, filename);
  },

  shuffleOptions(questions) {
    const parser = new TagBasedParser();
    return questions.map(q => parser.shuffleOptions(q));
  }
};

// ========== 导出 ==========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TagBasedParser, QuizParser };
}