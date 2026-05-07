const TXT_PATTERNS = {
  questionSeparator: /(^|:)\s*(题目\d*|Q\d*|#\d*)/i,
  optionPrefix: /^[A-D]\.|^[①-④]|\./,
  answerPattern: /答案\s*[:：]\s*([A-D]|正确|错误|true|false)/i,
  answerAlt: /^ANS:\s*([A-D])/i,
  explanationPattern: /解析\s*[:：]\s*/i,
  explanationAlt: /^EXP:\s*/
};

class ParserService {
  constructor() {
    this.content = '';
    this.questions = [];
    this.bankTitle = '';
  }

  async parse(text, options = {}) {
    this.content = text;
    this.questions = [];
    
    const lines = text.split('\n').filter(line => line.trim());
    
    this.detectFormat(lines);
    
    if (options.useAI !== false && this.questions.length === 0) {
      return this.parseWithAI(text);
    }
    
    return this.questions;
  }

  detectFormat(lines) {
    const firstLine = lines[0] || '';
    
    if (firstLine.includes('# ')) {
      this.parseMD(lines);
    } else if (firstLine.match(/^Q:/)) {
      this.parseSimple(lines);
    } else if (firstLine.match(/^[A-D]\./)) {
      this.parseOptionsFirst(lines);
    }
  }

  parseMD(lines) {
    let currentQuestion = null;
    let inOptions = false;
    let inAnswer = false;
    let inExplanation = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.startsWith('![{')) continue;
      
      if (line.startsWith('# ') && !this.bankTitle) {
        this.bankTitle = line.replace(/^#+\s*/, '');
        continue;
      }
      
      if (line.startsWith('## ') || line.match(/^Q[:：]/)) {
        if (currentQuestion) {
          this.questions.push(this.normalizeQuestion(currentQuestion));
        }
        currentQuestion = {
          type: 'single_choice',
          content: '',
          options: [],
          correctIndex: 0,
          explanation: ''
        };
        inOptions = false;
        inAnswer = false;
        inExplanation = false;
        continue;
      }

      if (currentQuestion) {
        if (line.match(/^[ABCD]\./) || line.match(/^【[ABCD]】/)) {
          inOptions = true;
          inAnswer = false;
          inExplanation = false;
          const optionText = line.replace(/^[ABCD]\.\s*|^【[ABCD]】\s*/, '');
          currentQuestion.options.push({
            id: currentQuestion.options.length,
            text: optionText
          });
        } else if (line.includes('【答案】') || line.match(/^ANS:/)) {
          inOptions = false;
          inAnswer = true;
          inExplanation = false;
          const answer = line.match(/【答案】\s*([A-D])/)?.[1] || 
                       line.match(/ANS:\s*([A-D])/)?.[1] || 'A';
          const index = answer.charCodeAt(0) - 65;
          currentQuestion.correctIndex = index;
        } else if (line.includes('【解析】') || line.match(/^EXP:/)) {
          inOptions = false;
          inAnswer = false;
          inExplanation = true;
          const explanation = line.replace(/【解析】\s*/i, '').replace(/^EXP:\s*/, '');
          currentQuestion.explanation = explanation;
        } else if (inExplanation) {
          currentQuestion.explanation += '\n' + line;
        } else if (!inOptions && !inAnswer) {
          currentQuestion.content += (currentQuestion.content ? '\n' : '') + line;
        }
      }
    }

    if (currentQuestion) {
      this.questions.push(this.normalizeQuestion(currentQuestion));
    }
  }

  parseSimple(lines) {
    let currentQuestion = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) continue;

      if (trimmed.startsWith('Q:')) {
        if (currentQuestion) {
          this.questions.push(this.normalizeQuestion(currentQuestion));
        }
        currentQuestion = {
          type: 'single_choice',
          content: trimmed.replace('Q:', '').trim(),
          options: [],
          correctIndex: 0,
          explanation: ''
        };
      } else if (trimmed.match(/^[A-D]\./)) {
        currentQuestion.options.push({
          id: currentQuestion.options.length,
          text: trimmed.replace(/^[A-D]\.\s*/, '')
        });
      } else if (trimmed.startsWith('ANS:')) {
        const answer = trimmed.replace('ANS:', '').trim();
        currentQuestion.correctIndex = answer.charCodeAt(0) - 65;
      } else if (trimmed.startsWith('EXP:')) {
        currentQuestion.explanation = trimmed.replace('EXP:', '').trim();
      }
    }

    if (currentQuestion) {
      this.questions.push(this.normalizeQuestion(currentQuestion));
    }
  }

  parseOptionsFirst(lines) {
    let currentQuestion = null;
    let contentLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) continue;

      if (trimmed.startsWith('---')) {
        if (currentQuestion) {
          currentQuestion.content = contentLines.join('\n').trim();
          this.questions.push(this.normalizeQuestion(currentQuestion));
        }
        currentQuestion = {
          type: 'single_choice',
          content: '',
          options: [],
          correctIndex: 0,
          explanation: ''
        };
        contentLines = [];
      } else if (trimmed.match(/^[A-D]\./)) {
        if (!currentQuestion) {
          currentQuestion = {
            type: 'single_choice',
            content: '',
            options: [],
            correctIndex: 0,
            explanation: ''
          };
        }
        currentQuestion.options.push({
          id: currentQuestion.options.length,
          text: trimmed.replace(/^[A-D]\.\s*/, '')
        });
      } else if (trimmed.startsWith('ANS:')) {
        if (currentQuestion) {
          const answer = trimmed.replace('ANS:', '').trim();
          currentQuestion.correctIndex = answer.charCodeAt(0) - 65;
        }
      } else if (trimmed.startsWith('EXP:')) {
        if (currentQuestion) {
          currentQuestion.explanation = trimmed.replace('EXP:', '').trim();
        }
      } else if (!trimmed.match(/^[A-D]\.|^ANS:|^EXP:|^---/)) {
        contentLines.push(trimmed);
        if (!currentQuestion) {
          currentQuestion = {
            type: 'single_choice',
            content: '',
            options: [],
            correctIndex: 0,
            explanation: ''
          };
        }
      }
    }

    if (currentQuestion && contentLines.length > 0) {
      currentQuestion.content = contentLines.join('\n').trim();
      this.questions.push(this.normalizeQuestion(currentQuestion));
    }
  }

  normalizeQuestion(q) {
    let type = q.type || 'single_choice';
    
    if (q.options.length === 2) {
      const optTexts = q.options.map(o => o.text.toLowerCase());
      if (
        (optTexts[0] === '正确' && optTexts[1] === '错误') ||
        (optTexts[0] === '对' && optTexts[1] === '错') ||
        (optTexts[0] === 'true' && optTexts[1] === 'false')
      ) {
        type = 'true_false';
      }
    }

    if (type === 'true_false') {
      return {
        id: q.id || this.generateId(),
        type: 'true_false',
        content: q.content,
        options: [
          { id: 0, text: '正确' },
          { id: 1, text: '错误' }
        ],
        correctIndex: q.correctIndex === 0 || q.correctIndex === 1 ? q.correctIndex : 0,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 1,
        tags: q.tags || [],
        source: 'parse',
        createdAt: new Date().toISOString()
      };
    }

    return {
      id: q.id || this.generateId(),
      type: type,
      content: q.content || '未命制题目',
      options: q.options || [],
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || '暂无解析',
      difficulty: q.difficulty || 1,
      tags: q.tags || [],
      source: 'parse',
      createdAt: new Date().toISOString()
    };
  }

  generateId() {
    return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getBankTitle() {
    return this.bankTitle || '导入题库';
  }

  async parseWithAI(text) {
    return [];
  }
}

export default new ParserService();