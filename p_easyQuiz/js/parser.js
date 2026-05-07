const QuizParser = {
  parse(content, filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const txt = filename.toLowerCase();

    // 检测 .txt 文件是否实际是 MD 格式
    const isMDFormat = content.includes('## 题目') ||
                      content.includes('### ') ||
                      content.match(/^#{1,3}\s*[\u4e00-\u9fa5]/m) ||
                      content.includes('**A.**') ||
                      content.includes('> **');

    if (ext === 'txt' && isMDFormat) {
      return this.parseMD(content);
    }

    try {
      switch (ext) {
        case 'json':
          return this.parseJSON(content);
        case 'txt':
          return this.parseTXT(content);
        case 'md':
          return this.parseMD(content);
        default:
          return this.parseJSON(content);
      }
    } catch (error) {
      return { needsAI: true, error: error.message, content, filename };
    }
  },

  checkQuizData(data, content, filename) {
    if (!data.questions || data.questions.length < 5) {
      return { needsAI: true, error: `导入${data.questions?.length || 0}题，文件可能不规范，是否采用AI解析题目`, content, filename };
    }
    return null;
  },

  parseJSON(content) {
    try {
      const data = JSON.parse(content);
      if (!data.questions) throw new Error('无效的JSON格式');
      return {
        title: data.title || '未命名题库',
        description: data.description || '',
        category: data.category || '',
        questions: data.questions.map((q, i) => this.normalizeQuestion(q, i))
      };
    } catch (e) {
      throw new Error('JSON解析失败: ' + e.message);
    }
  },

  parseTXT(content) {
    const questions = [];
    const blocks = content.split(/^---$/m);

    blocks.forEach((block, index) => {
      block = block.trim();
      if (!block) return;

      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 4) return;

      let q = { id: `txt-${index + 1}`, options: [], type: 'single' };

      lines.forEach(line => {
        if (line.startsWith('Q:')) {
          q.content = line.substring(2).trim();
        } else if (/^[A-D]\./.test(line)) {
          q.options.push({ id: q.options.length, text: line.substring(2).trim() });
        } else if (line.startsWith('ANS:')) {
          const ans = line.substring(4).trim().toUpperCase();
          if (ans.length > 1) {
            q.type = 'multiple';
            q.correctIndex = ans.split('').map(c => c.charCodeAt(0) - 65);
          } else {
            q.correctIndex = [ans.charCodeAt(0) - 65];
          }
        } else if (line.startsWith('EXP:')) {
          q.explanation = line.substring(4).trim();
        }
      });

      if (q.content && q.options.length >= 2) {
        questions.push(this.normalizeQuestion(q, index));
      }
    });

    if (questions.length === 0) throw new Error('TXT解析失败，未找到有效题目');
    return { title: '导入题库', description: '', category: '', questions };
  },

  parseMD(content) {
    const questions = [];
    const optChars = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // 先提取标题
    const titleMatch = content.match(/#\s*题库名称[：:]\s*(.+)/);
    const title = titleMatch ? titleMatch[1] : '导入题库';
    
    // 更灵活的分隔符匹配（支持多种题号格式）
    const splitPatterns = [
      /^##\s*题目\s*\d+/m,
      /^##\s*[\u4e00-\u9fa5]+\d*/m,
      /^###\s*\d+[.、]/m,
      /^##\s*\d+[.、]/m,
      /^## /m,
      /^### /m
    ];
    
    let blocks = [];
    // 尝试多种分隔符（按优先级排序）
    const separators = [
      /^##\s*题目/m,    // ## 题目1
      /^---+$/m,         // ---
      /\n\n+/            // 空行分隔
    ];
    
    for (const sep of separators) {
      blocks = content.split(sep);
      if (blocks.length > 1) break;
    }

    blocks.forEach((block, index) => {
      block = block.trim();
      if (!block) return;
      if (block.length < 10) return;

      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return;

      let q = { id: `md-${index + 1}`, options: [], type: 'single', correctIndex: [] };
      let foundContent = false;

      lines.forEach((line, i) => {
        // 答案识别（包含"答案"或"解读"的行）
        if (line.includes('答案') || line.includes('解读')) {
          const expMatch = line.match(/[：:]\s*([A-D])/);
          if (expMatch) {
            q.correctIndex = [optChars.indexOf(expMatch[1].toUpperCase())];
            const colonIdx = line.indexOf('：');
            if (colonIdx >= 0) q.explanation = line.substring(colonIdx + 1).trim();
            return;
          }
        }
        
        // 题目内容识别
        if (!foundContent && line.includes('？') && !line.startsWith('-')) {
          q.content = line.replace(/^[#]+\s*/, '').trim();
          foundContent = true;
          return;
        }

        // 选项识别（最灵活）
        const optMatch = line.match(/^- ?\*\*?([A-D])\.\*\*?\s*(.+)/);
        if (optMatch) {
          q.options.push({ id: q.options.length, text: optMatch[2] });
          return;
        }
        
        const optMatch2 = line.match(/^- ?\[([A-D])\]\s*(.+)/);
        if (optMatch2) {
          q.options.push({ id: q.options.length, text: optMatch2[2] });
          return;
        }
        
        // 纯选项格式，如 "A. xxx"
        if (/^[A-D]\.\s*/.test(line)) {
          q.options.push({ id: q.options.length, text: line.replace(/^[A-D]\.\s*/, '').trim() });
          return;
        }
      });

      // 修正题目内容（去除多余的标题）
      if (q.content) {
        q.content = q.content.replace(/^#{1,3}\s*[\u4e00-\u9fa5]+\d*\s*/m, '')
                          .replace(/^#{1,3}\s*/m, '')
                          .trim();
      }

      if (q.content && q.options.length >= 2 && q.correctIndex.length > 0) {
        questions.push(this.normalizeQuestion(q, index));
      }
    });

    // 尝试从选项中推断答案（对于无显式答案的题目）
    if (questions.length === 0 && blocks.length > 1) {
      for (const block of blocks) {
        const lines = block.split('\n');
        let content = '', options = [], correctOpt = '';
        
        for (const line of lines) {
          // 获取题目内容
          if (/^#{1,3}\s*[\u4e00-\u9fa5]/.test(line) && !options.length) {
            content = line.replace(/^#{1,3}\s*/, '').trim();
            continue;
          }
          
          // 获取选项
          const optMatch = line.match(/^[-*]?\s*\*\*?([A-D])\.\*\*?\s*(.+)/);
          if (optMatch) {
            options.push({ id: options.length, text: optMatch[2] });
            continue;
          }
          
          // 尝试从解读中获取答案
          const jieduMatch = line.match(/>\*\*解读[：:]\s*([^A-D]+)/);
          if (jieduMatch && options.length > 0) {
            // 根据解读内容推断答案
            const jieduText = jieduMatch[1];
            for (let i = 0; i < options.length; i++) {
              if (jieduText.includes(optChars[i])) {
                correctOpt = optChars[i];
                break;
              }
            }
          }
        }
        
        if (content && options.length >= 2 && correctOpt) {
          const q = {
            id: `md-${questions.length + 1}`,
            content,
            options,
            correctIndex: [optChars.indexOf(correctOpt)],
            explanation: '',
            type: 'single'
          };
          questions.push(this.normalizeQuestion(q, questions.length));
        }
      }
    }

// 提取标题
    const mdTitleMatch = content.match(/#\s*题库名称[：:]\s*(.+)/);
    const mdTitle = mdTitleMatch ? mdTitleMatch[1] : title;
    
    return { title: mdTitle, description: '', category: '', questions };
  },

  normalizeQuestion(q, index) {
    const type = (q.type || 'single').toLowerCase();
    let correctIndex = q.correctIndex;
    if (!Array.isArray(correctIndex)) {
      correctIndex = [correctIndex];
    }
    correctIndex = correctIndex.map(i => parseInt(i)).filter(i => !isNaN(i));

    let options = q.options || [];
    if (!Array.isArray(options)) {
      options = Object.keys(options).map(key => ({ id: parseInt(key), text: options[key] }));
    }

    const normalized = {
      id: q.id || `q-${index + 1}`,
      type: type === 'multiple_choice' ? 'multiple' : type === 'true_false' ? 'true_false' : 'single',
      content: q.content || q.question || '',
      options: options.map((opt, i) => {
        const optId = opt.id !== undefined ? opt.id : i;
        return {
          id: optId,
          text: opt.text || opt.content || opt || '',
          isCorrect: correctIndex.includes(optId)
        };
      }),
      explanation: q.explanation || q.explain || '',
      difficulty: q.difficulty || 1,
      tags: q.tags || []
    };

    if (normalized.type === 'true_false' && normalized.options.length === 0) {
      normalized.options = [
        { id: 0, text: '正确', isCorrect: false },
        { id: 1, text: '错误', isCorrect: true }
      ];
    }

    return normalized;
  },

  shuffleOptions(questions) {
    return questions.map(q => {
      const shuffled = { ...q, options: [...q.options].sort(() => Math.random() - 0.5) };
      shuffled.options = shuffled.options.map((opt, i) => ({ ...opt, id: i }));
      return shuffled;
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizParser;
}