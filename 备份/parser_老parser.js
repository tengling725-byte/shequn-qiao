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

    // 检测内容是否为 JSON 格式（粘贴内容可能是 JSON）
    const trimmed = content.trim();
    if (ext !== 'json' && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
      try { return this.parseJSON(content); } catch(e) { /* 不是合法 JSON，走原有逻辑 */ }
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
      // 去掉 Markdown 粗体
      let raw = line.replace(/\*\*/g, '').trim();
      const lowerRaw = raw.toLowerCase();

      // ---------- 1️⃣ 判断题答案映射（增强版）----------
      const tfMap = {
        // 正确类
        '正确': '正确',
        '对': '正确',
        'true': '正确',
        // 错误类（包含你要求的否定词）
        '错误': '错误',
        '错': '错误',
        'false': '错误',
        '不正确': '错误',
        '不对': '错误',
        'not true': '错误'
      };

      // 去掉可能的前缀「答案：」
      let pureTf = lowerRaw.replace(/^答案[:：]/, '');

      if (tfMap[pureTf]) {
        return { type: 'true_false', answer: tfMap[pureTf] };
      }

      // ---------- 2️⃣ 选择题答案（A、B、C）----------
      const choiceRaw = raw.replace(/^(答案|Answer)[:：]/i, '');
      const letterMatch = choiceRaw.match(/[A-Z]/gi);
      if (letterMatch && letterMatch.length > 0) {
        const answers = [...new Set(letterMatch.map(l => l.toUpperCase()))];
        return { type: 'choice', answers };
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
        const hasCorrectIndex = currentQuestion && currentQuestion.correctIndex && currentQuestion.correctIndex.length > 0;
        const hasTFAnswer = currentQuestion && currentQuestion.answer;
        if (currentQuestion && currentQuestion.content && currentQuestion.options.length >= 2 && (hasCorrectIndex || hasTFAnswer)) {
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

      // 提取答案（选择题答案 A、判断题正确/错误）
      if (isAnswerMarker(line)) {
        const answerData = extractAnswer(line);
        if (answerData) {
          if (answerData.type === 'true_false') {
            currentQuestion.answer = answerData.answer;
          } else if (answerData.type === 'choice') {
            currentQuestion.correctIndex = answerData.answers.map(a => a.charCodeAt(0) - 'A'.charCodeAt(0));
          }
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
      type: (type === 'multiple_choice' || type === 'multiple') ? 'multiple' : type === 'true_false' ? 'true_false' : 'single',
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