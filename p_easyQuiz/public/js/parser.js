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
    return this.parseTextContent(content);
  },

  parseMD(content) {
    return this.parseTextContent(content);
  },

  parseTextContent(content) {
    const questions = [];
    const optChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    
    const isContentMarker = (line) => {
      const markers = ['题干', 'Question', '题目', '问题', '第1题', '第2题', '第3题', 'No.1', 'No.2', '题1', '题2', '题3', '第N题'];
      
      const hasNumberPrefix = /^\d+\.\s/.test(line);
      return markers.some(m => line.toLowerCase().startsWith(m.toLowerCase())) || hasNumberPrefix;
    };
    
    const isAnswerMarker = (line) => {
      // 选择题答案标记
      const letterMarkers = ['答案', 'Answer', '正确答案', '标准答案', '参考答案', '正解', 'ANS:', 'ans:'];
      // 判断题答案标记（必须出现在答案行开头）
      const tfMarkers = ['正确', '错误', '对', '错', 'True', 'False', '不正确', '不对', 'not true', 'not false'];
      
      const isTFAnswer = tfMarkers.some(m => line.toLowerCase().startsWith(m.toLowerCase()));
      const isLetterAnswer = letterMarkers.some(m => line.toLowerCase().startsWith(m.toLowerCase()));
      
      return isLetterAnswer || isTFAnswer;
    };
    
    const isExplanationMarker = (line) => {
      const markers = ['解析', 'Explanation', '讲解', '解释', '注解', '详解', 'EXP:', 'exp:'];
      return markers.some(m => line.toLowerCase().startsWith(m.toLowerCase()));
    };
    
    const isOptionFormat = (line) => {
      return /^[A-Ga-g][.、:）)】]/.test(line) || /^（[A-G]）/.test(line) || /^[(][A-G][)]/.test(line) || /^[A-Ga-g]\s+[^\d]/.test(line);
    };
    
    const stripFormatMarkers = (line) => {
      let i = 0;
      const symbols = '-*#`>【】（）()·•[] ';
      while (i < line.length) {
        const char = line[i];
        if (symbols.includes(char)) {
          i++;
        } else {
          break;
        }
      }
      return line.substring(i).trim();
    };
    
    const extractAnswer = (line) => {
      const lineLower = line.toLowerCase().trim();
      
      // 判断题答案 - 行首精确匹配
      const tfPatterns = [
        // 正确答案
        { pattern: /^正确$/i, answer: '正确' },
        { pattern: /^对$/i, answer: '对' },
        { pattern: /^True$/i, answer: 'True' },
        { pattern: /^not false$/i, answer: '正确' },
        // 错误答案（直接）
        { pattern: /^错误$/i, answer: '错误' },
        { pattern: /^错$/i, answer: '错' },
        { pattern: /^False$/i, answer: 'False' },
        // 错误答案（否定形式）
        { pattern: /^不正确$/i, answer: '错误' },
        { pattern: /^不对$/i, answer: '错误' },
        { pattern: /^not true$/i, answer: '错误' }
      ];
      
      for (const p of tfPatterns) {
        if (p.pattern.test(lineLower)) {
          return { type: 'true_false', answer: p.answer };
        }
      }
      
      // 选择题答案：支持多种分隔格式
      // A、BC → ABC  A,B,C → ABC  ABC → ABC  A B C → ABC  A;C → ABC
      const cleanedLine = line.replace(/^(答案|Answer|正确答案|标准答案|参考答案|正解|ANS:|ans:)\s*[:：]?\s*/i, '');
      const ansMatch = cleanedLine.match(/[A-Ga-g]/gi);
      
      if (ansMatch && ansMatch.length > 0) {
        const answers = ansMatch.map(a => a.toUpperCase()).filter(c => c >= 'A' && c <= 'G');
        // 去重并保持顺序
        const uniqueAnswers = [...new Set(answers)];
        return { type: 'choice', answers: uniqueAnswers };
      }
      return null;
    };
    
    const lines = content.split('\n');
    let currentQuestion = null;
    let currentSection = 'content';
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      
      line = stripFormatMarkers(line);
      if (!line) continue;
      
      if (isContentMarker(line)) {
        if (currentQuestion && currentQuestion.content && currentQuestion.options.length >= 2 && currentQuestion.correctIndex.length > 0) {
          questions.push(this.normalizeQuestion(currentQuestion, questions.length));
        }
        currentQuestion = { id: `q-${questions.length + 1}`, options: [], type: 'single', correctIndex: [], content: '', explanation: '', answer: '' };
        currentSection = 'content';
        
        const contentAfterMarker = line.replace(/^(题干|Question|题目|问题|第\d+题|No\.\d+|题\d+|第N题|\d+\.)\s*/i, '').trim();
        if (contentAfterMarker) {
          currentQuestion.content = contentAfterMarker;
        }
        continue;
      }
      
      if (!currentQuestion) {
        currentQuestion = { id: `q-${questions.length + 1}`, options: [], type: 'single', correctIndex: [], content: '', explanation: '', answer: '' };
      }
      
      if (isAnswerMarker(line)) {
        currentSection = 'answer';
        const result = extractAnswer(line);
        if (result) {
          if (result.type === 'true_false') {
            currentQuestion.answer = result.answer;
          } else {
            currentQuestion.correctIndex = result.answers.map(a => optChars.indexOf(a));
          }
          currentQuestion._originalAnswer = line;
        }
        continue;
      }
      
      if (isExplanationMarker(line)) {
        currentSection = 'explanation';
        // 解析段落保留原始行内容（用户需要显示原行）
        currentQuestion.explanation = line;
        continue;
      }
      
      if (currentSection === 'explanation') {
        currentQuestion.explanation += '\n' + line;
        continue;
      }
      
      if (isOptionFormat(line)) {
        let optText = line.replace(/^[A-Ga-g][.、:）)】]\s*/, '').replace(/^（[A-G]）\s*/, '').replace(/^[(][A-G][)]\s*/, '').replace(/^[A-Ga-g]\s+/, '').trim();
        if (optText) {
          currentQuestion.options.push({ id: currentQuestion.options.length, text: optText });
        }
        continue;
      }
      
      if (currentSection === 'content' && currentQuestion.content === '') {
        currentQuestion.content = line;
      } else if (currentSection === 'content') {
        currentQuestion.content += ' ' + line;
      }
    }
    
    // 解析完成后统一判断类型
    const hasOptions = currentQuestion && currentQuestion.options.length >= 2;
    const hasAnswer = (currentQuestion && currentQuestion.correctIndex && currentQuestion.correctIndex.length > 0) || 
                     (currentQuestion && currentQuestion.answer);
    
    const isTFAnswer = currentQuestion && currentQuestion.answer && 
      ['正确', '错误', '对', '错', 'True', 'False', '不正确', '不对', 'not true', 'not false'].some(
        m => currentQuestion.answer.toLowerCase().startsWith(m.toLowerCase())
      );
    
    // 统一判断类型
    if (hasOptions) {
      currentQuestion.type = currentQuestion.correctIndex?.length > 1 ? 'multiple' : 'single';
    } else if (isTFAnswer) {
      currentQuestion.type = 'true_false';
    }
    
    // 保存条件：必须有题干和答案
    const canSave = currentQuestion && currentQuestion.content && hasAnswer && 
      (hasOptions || isTFAnswer);
    
    if (canSave) {
      questions.push(this.normalizeQuestion(currentQuestion, questions.length));
    }
    
    const titleMatch = content.match(/#\s*题库名称[：:]\s*(.+)/);
    const title = titleMatch ? titleMatch[1] : '导入题库';
    
    if (questions.length === 0) {
      throw new Error('解析失败，未找到有效题目');
    }
    
    return { title, description: '', category: '', questions };
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

    // 判断题处理：无选项但有判断题答案
    const isTFAnswer = q.answer && ['正确', '错误', '对', '错', 'True', 'False'].some(
      m => q.answer.toLowerCase().includes(m.toLowerCase())
    );
    
    if (isTFAnswer) {
      normalized.type = 'true_false';
      const isCorrect = (q.answer === '正确' || q.answer === 'True' || q.answer === '对');
      normalized.options = [
        { id: 0, text: '正确', isCorrect: isCorrect },
        { id: 1, text: '错误', isCorrect: !isCorrect }
      ];
    } else if (normalized.type === 'true_false' && normalized.options.length === 0) {
      const isCorrect = (q.answer === '正确' || q.answer === 'True' || q.answer === '对');
      normalized.options = [
        { id: 0, text: '正确', isCorrect: isCorrect },
        { id: 1, text: '错误', isCorrect: !isCorrect }
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