let builtInQuizzes = [];

const QuizApp = {
  state: {
    currentPage: 'home',
    currentQuiz: null,
    questions: [],
    shuffledQuestions: [],
    currentIndex: 0,
    userAnswers: [],
    mode: 'exam',
    questionCount: 10,
    score: 0,
    startTime: 0,
    answerTime: 0,
    streak: 0,
    hasAnswered: false,
    correctCount: 0,
    totalScore: 0,
    customQuizzes: [],
    selectedQuizTitle: '',
    isLoggedIn: false,
    userEmail: '',
    loginMode: 'login'
  },

  scoring: {
    exam: { correct: 10, wrong: 0 },
    game: { correct: 5, time5: 5, time10: 3, wrong: -5, streak3: 10, streak5: 20 }
  },

  init() {
    this.state.currentQuiz = null;
    this.state.customQuizzes = this.loadCustomQuizzes();
    window.QuizApp = this;
    this.loadBuiltInQuizzes();
    this.checkLoginStatus();
  },

  async loadBuiltInQuizzes() {
    builtInQuizzes = await QuizLoader.loadAll();
    this.checkLoginStatus();
    this.render();
  },

  loadCustomQuizzes() {
    try {
      const data = localStorage.getItem('easyQuiz_custom');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCustomQuizzes() {
    localStorage.setItem('easyQuiz_custom', JSON.stringify(this.state.customQuizzes));
  },

  addCustomQuiz(quizData) {
    const name = quizData.title || '自定义题库';
    this.state.customQuizzes.push({
      name: name,
      data: quizData,
      questions: quizData.questions ? quizData.questions.length : 0
    });
    this.saveCustomQuizzes();
  },

  deleteCustomQuiz(index) {
    if (confirm('确定删除这个自定义题库？')) {
      this.state.customQuizzes.splice(index, 1);
      this.saveCustomQuizzes();
      this.render();
    }
  },

  clearCustomQuizzes() {
    if (confirm('确定清空所有自定义题库？')) {
      this.state.customQuizzes = [];
      this.saveCustomQuizzes();
      this.render();
    }
  },

  navigate(page) {
    this.state.currentPage = page;
    this.render();
  },

  selectQuiz(quizData) {
    this.state.currentQuiz = quizData;
    this.state.questions = quizData.questions;
    this.navigate('setup');
  },

  setMode(mode) {
    this.state.mode = mode;
    this.render();
  },

  setQuestionCount(count) {
    this.state.questionCount = count;
    this.render();
  },

  startQuiz() {
    if (!this.state.currentQuiz || !this.state.currentQuiz.questions) {
      alert('题库数据为空，请先选择题库');
      return;
    }

    const needShuffle = (options) => {
      for (const opt of options) {
        const text = opt.text || '';
        if (text.includes('都对') || text.includes('都是') || text.includes('全对') || text.includes('以上都是')) {
          return false;
        }
      }
      return true;
    };

    const totalQuestions = this.state.currentQuiz.questions.length;
    const count = Math.min(this.state.questionCount, totalQuestions);

    const shuffled = [...this.state.currentQuiz.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(q => {
        const shouldShuffle = needShuffle(q.options);
        return {
          ...q,
          options: shouldShuffle 
            ? [...q.options].sort(() => Math.random() - 0.5)
            : [...q.options]
        };
      });

    this.state.shuffledQuestions = shuffled;
    this.state.currentIndex = 0;
    this.state.userAnswers = [];
    this.state.score = 0;
    this.state.streak = 0;
    this.state.startTime = Date.now();
    this.state.answerTime = Date.now();
    this.state.hasAnswered = false;

    this.navigate('quiz');
  },

  selectAnswer(optionId) {
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    if (!q) return;

    if (q.type === 'multiple') {
      this.toggleAnswer(optionId);
      return;
    }

    if (this.state.mode === 'game' && this.state.hasAnswered) return;

    this.state.userAnswers[this.state.currentIndex] = optionId;
    this.state.hasAnswered = true;

    if (this.state.mode === 'game') {
      this.calculateScore(optionId);
    }

    this.render();
  },

  toggleAnswer(optionId) {
    if (this.state.mode === 'game' && this.state.hasAnswered) return;

    const current = this.state.userAnswers[this.state.currentIndex] || [];
    const idx = current.indexOf(optionId);
    
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(optionId);
    }
    
    this.state.userAnswers[this.state.currentIndex] = current;
    this.state.hasAnswered = current.length > 0;

    if (this.state.mode === 'game' && current.length > 0) {
      this.calculateMultiScore(current);
    }

    this.render();
  },

  calculateScore(optionId) {
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    const selectedOpt = q.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOpt && selectedOpt.isCorrect;
    const timeUsed = (Date.now() - this.state.answerTime) / 1000;

    let points = 0;
    if (isCorrect) {
      points += this.scoring.game.correct;
      if (timeUsed <= 5) points += this.scoring.game.time5;
      else if (timeUsed <= 10) points += this.scoring.game.time10;

      this.state.streak++;
      if (this.state.streak >= 3) points += this.scoring.game.streak3;
      if (this.state.streak >= 5) points += this.scoring.game.streak5;
    } else {
      points += this.scoring.game.wrong;
      this.state.streak = 0;
    }

    this.state.score = Math.max(0, this.state.score + points);
  },

  calculateMultiScore(answerIds) {
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
    const isCorrect = answerIds.length === correctIds.length && 
                     answerIds.every(id => correctIds.includes(id));
    const timeUsed = (Date.now() - this.state.answerTime) / 1000;

    let points = 0;
    if (isCorrect) {
      points += this.scoring.game.correct;
      if (timeUsed <= 5) points += this.scoring.game.time5;
      else if (timeUsed <= 10) points += this.scoring.game.time10;

      this.state.streak++;
      if (this.state.streak >= 3) points += this.scoring.game.streak3;
      if (this.state.streak >= 5) points += this.scoring.game.streak5;
    } else {
      points += this.scoring.game.wrong;
      this.state.streak = 0;
    }

    this.state.score = Math.max(0, this.state.score + points);
  },

  nextQuestion() {
    if (this.state.currentIndex < this.state.shuffledQuestions.length - 1) {
      this.state.currentIndex++;
      this.state.hasAnswered = false;
      this.state.answerTime = Date.now();
      this.render();
    } else {
      this.submitQuiz();
    }
  },

  prevQuestion() {
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      const answer = this.state.userAnswers[this.state.currentIndex];
      this.state.hasAnswered = answer !== undefined || (Array.isArray(answer) && answer.length > 0);
      this.render();
    }
  },

  submitQuiz() {
    const { shuffledQuestions, userAnswers, mode } = this.state;

    let correctCount = 0;
    let totalScore = 0;

    shuffledQuestions.forEach((q, i) => {
      let isCorrect = false;
      
      if (q.type === 'multiple') {
        const answerIds = userAnswers[i] || [];
        const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
        isCorrect = answerIds.length > 0 && 
                   answerIds.every(id => correctIds.includes(id)) && 
                   correctIds.every(id => answerIds.includes(id));
      } else {
        const answer = userAnswers[i];
        if (answer !== undefined) {
          const selectedOpt = q.options.find(opt => opt.id === answer);
          isCorrect = selectedOpt && selectedOpt.isCorrect;
        }
      }

      if (mode === 'exam') {
        if (isCorrect) {
          correctCount++;
          totalScore += this.scoring.exam.correct;
        }
      } else {
        if (isCorrect) correctCount++;
      }

      const answer = userAnswers[i];
      if (answer !== undefined) {
        QuizStorage.addErrors(q, Array.isArray(answer) ? answer.join(',') : answer, isCorrect);
      }
    });

    if (mode === 'game') {
      totalScore = this.state.score;
    }

    const result = {
      quizTitle: this.state.currentQuiz.title,
      mode,
      total: shuffledQuestions.length,
      correct: correctCount,
      score: totalScore,
      time: Math.floor((Date.now() - this.state.startTime) / 1000)
    };

    QuizStorage.addHistory(result);
    this.state.correctCount = correctCount;
    this.state.totalScore = totalScore;

    this.navigate('result');
  },

  uploadFile(file) {
    const reader = new FileReader();
    const that = this;
    reader.onload = (e) => {
      try {
        const data = QuizParser.parse(e.target.result, file.name);
        if (data.needsAI) {
          that.showAIParserModal(data);
          return;
        }
        const checkResult = QuizParser.checkQuizData(data, e.target.result, file.name);
        if (checkResult) {
          that.showAIParserModal(checkResult);
          return;
        }
        data.title = `题库_${file.name.replace(/\.[^.]+$/, '')}_${that.getDateStr()}`;
        console.log(`导入${data.questions.length}题，名称为${data.title}`);
        that.addCustomQuiz(data);
        alert('题库已添加：' + data.title);
        that.render();
      } catch (err) {
        that.showAIParserModal({
          needsAI: true,
          error: err.message,
          content: e.target.result,
          filename: file.name
        });
      }
    };
    reader.readAsText(file);
  },

  parseInput(content) {
    const that = this;
    try {
      const data = QuizParser.parse(content, 'input.txt');
      if (data.needsAI) {
        that.showAIParserModal(data);
        return;
      }
      const checkResult = QuizParser.checkQuizData(data, content, 'input.txt');
      if (checkResult) {
        that.showAIParserModal(checkResult);
        return;
      }
      data.title = `题库_粘贴_${that.getDateStr()}`;
      console.log(`导入${data.questions.length}题，名称为${data.title}`);
      that.addCustomQuiz(data);
      alert('题库已添加：' + data.title);
      that.render();
    } catch (err) {
      that.showAIParserModal({
        needsAI: true,
        error: err.message,
        content: content,
        filename: 'input.txt'
      });
    }
  },

  getDateStr() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  },

  showAIParserModal(data) {
    const modal = document.getElementById('aiParserModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.dataset.content = data.content;
      modal.dataset.filename = data.filename;
      modal.querySelector('.parse-error').textContent = data.error;
    }
  },

  async useAIParse() {
    const modal = document.getElementById('aiParserModal');
    if (!modal) return;

    const content = modal.dataset.content;
    const filename = modal.dataset.filename;

    modal.style.display = 'none';
    this.showLoading('正在使用AI解析...');

    try {
      const data = await AIAnalyzer.parseQuizWithAI(content, filename);
      data.title = `题库_${filename.replace(/\.[^.]+$/, '')}_${this.getDateStr()}`;
      console.log(`导入${data.questions.length}题，名称为${data.title}`);
      this.addCustomQuiz(data);
      this.hideLoading();
      alert('题库已添加：' + data.title);
      this.render();
    } catch (err) {
      this.hideLoading();
      alert('AI解析失败：' + err.message);
    }
  },

  cancelAIParse() {
    const modal = document.getElementById('aiParserModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  showLoading(text) {
    let loading = document.getElementById('loadingOverlay');
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loadingOverlay';
      loading.innerHTML = '<div class="loading-box"><div class="loading-spinner"></div><div class="loading-text">加载中...</div></div>';
      document.body.appendChild(loading);
    }
    loading.querySelector('.loading-text').textContent = text || '加载中...';
    loading.style.display = 'flex';
  },

  hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.style.display = 'none';
  },

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    switch (this.state.currentPage) {
      case 'home':
        app.innerHTML = this.renderHome();
        break;
      case 'setup':
        app.innerHTML = this.renderSetup();
        break;
      case 'quiz':
        app.innerHTML = this.renderQuiz();
        break;
      case 'result':
        app.innerHTML = this.renderResult();
        break;
      case 'history':
        app.innerHTML = this.renderHistory();
        break;
      case 'errors':
        app.innerHTML = this.renderErrors();
        break;
    }

    this.attachEvents();
  },

  renderHome() {
    const customOptions = this.state.customQuizzes.map((q, i) => {
      return '<option value="custom:' + i + '">' + q.name + '(自定义 ' + q.questions + '题)</option>';
    }).join('');

    const builtOptions = builtInQuizzes.map(q => {
      return '<option value="builtin:' + q.data.title + '">' + q.name + '(' + q.questions + '题)</option>';
    }).join('');

    const customManageHtml = this.state.customQuizzes.length > 0
      ? '<div class="custom-quiz-list">' +
        this.state.customQuizzes.map((q, i) =>
          '<div class="custom-quiz-item">' +
            '<span>' + q.name + ' (' + q.questions + '题)</span>' +
            '<button class="btn-small" onclick="QuizApp.exportCustomQuiz(' + i + ')">导出</button>' +
            '<button class="btn-small" onclick="QuizApp.deleteCustomQuiz(' + i + ')">删除</button>' +
          '</div>'
        ).join('') +
        '<button class="btn-text" onclick="QuizApp.clearCustomQuizzes()">清空自定义题库</button>' +
        '</div>'
      : '';

    const authHtml = this.state.isLoggedIn
      ? '<div class="user-info"><span>' + this.state.userEmail + '</span><button class="btn-text" onclick="QuizApp.handleLogout()">登出</button></div>'
      : '<button class="btn btn-outline" onclick="QuizApp.showLoginModal()">登录</button>';

    return '<div class="page home">' +
      '<h1>EasyQuiz</h1>' +
      '<p class="subtitle">选择题库开始答题</p>' +
      '<div class="quiz-list">' +
        '<select id="quizSelect" class="quiz-select" onchange="QuizApp.onQuizSelect()">' +
          '<option value="">-- 请选择题库 --</option>' +
          '<optgroup label="内置题库">' + builtOptions + '</optgroup>' +
          (customOptions ? '<optgroup label="自定义题库">' + customOptions + '</optgroup>' : '') +
        '</select>' +
        '<button class="btn btn-primary" onclick="QuizApp.startSelectedQuiz()">开始答题</button>' +
        '<button class="btn btn-outline" onclick="document.getElementById(\'fileInput\').click()">上传题库</button>' +
        '<input type="file" id="fileInput" accept=".json,.txt,.md" style="display:none">' +
        '<button class="btn btn-outline" onclick="QuizApp.showPasteModal()">粘贴题库</button>' +
      '</div>' +
      customManageHtml +
      '<div class="nav-links">' +
        '<a href="#" onclick="QuizApp.navigate(\'history\')">历史记录</a>' +
        '<a href="#" onclick="QuizApp.navigate(\'errors\')">错题复习</a>' +
      '</div>' +
      authHtml +
      '<div id="pasteModal" class="modal" style="display:none">' +
        '<div class="modal-content">' +
          '<h3>粘贴题库内容</h3>' +
          '<textarea id="pasteContent" placeholder="粘贴 JSON/TXT/MD 格式的题库内容"></textarea>' +
          '<div class="modal-buttons">' +
            '<button class="btn btn-primary" onclick="QuizApp.submitPaste()">确认</button>' +
            '<button class="btn btn-outline" onclick="document.getElementById(\'pasteModal\').style.display=\'none\'">取消</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="aiParserModal" class="modal" style="display:none">' +
        '<div class="modal-content">' +
          '<h3>解析失败</h3>' +
          '<p class="parse-error" style="color:#666;margin-bottom:15px;"></p>' +
          '<p style="margin-bottom:20px;">是否使用AI（豆包）智能解析题库？</p>' +
          '<div class="modal-buttons">' +
            '<button class="btn btn-primary" onclick="QuizApp.useAIParse()">AI解析</button>' +
            '<button class="btn btn-outline" onclick="QuizApp.cancelAIParse()">取消</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="loginModal" class="modal" style="display:none">' +
        '<div class="modal-content">' +
          '<h3>' + (this.state.loginMode === 'login' ? '登录' : '注册') + '</h3>' +
          '<input type="email" id="loginEmail" placeholder="邮箱" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">' +
          '<input type="password" id="loginPassword" placeholder="密码" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">' +
          '<div class="modal-buttons">' +
            '<button class="btn btn-primary" onclick="QuizApp.handleLoginSubmit()">' + (this.state.loginMode === 'login' ? '登录' : '注册') + '</button>' +
            '<button class="btn btn-outline" onclick="QuizApp.toggleLoginMode()">' + (this.state.loginMode === 'login' ? '切换到注册' : '切换到登录') + '</button>' +
            '<button class="btn btn-outline" onclick="document.getElementById(\'loginModal\').style.display=\'none\'">取消</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  renderSetup() {
    const quiz = this.state.currentQuiz;
    if (!quiz || !quiz.questions) {
      return '<div class="page"><p>题库加载失败</p><button onclick="QuizApp.navigate(\'home\')">返回</button></div>';
    }
    const counts = [5, 10, 20, quiz.questions.length];
    const countLabels = counts.map(c => c === quiz.questions.length ? '全部' : c);

    let btnGroupHtml = counts.map((c, i) => {
      return '<button class="btn' + (this.state.questionCount === c ? ' active' : '') + '" onclick="QuizApp.setQuestionCount(' + c + ')">' + countLabels[i] + '</button>';
    }).join('');

    return '<div class="page setup">' +
      '<h1>' + quiz.title + '</h1>' +
      '<p class="subtitle">' + (quiz.description || '') + '</p>' +
      '<div class="setting-group">' +
        '<label>题量</label>' +
        '<div class="btn-group">' + btnGroupHtml + '</div>' +
      '</div>' +
      '<div class="setting-group">' +
        '<label>模式</label>' +
        '<div class="btn-group">' +
          '<button class="btn' + (this.state.mode === 'exam' ? ' active' : '') + '" onclick="QuizApp.setMode(\'exam\')">考试模式</button>' +
          '<button class="btn' + (this.state.mode === 'game' ? ' active' : '') + '" onclick="QuizApp.setMode(\'game\')">游戏模式</button>' +
        '</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-large" onclick="QuizApp.startQuiz()">开始答题</button>' +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回</a>' +
    '</div>';
  },

  renderQuiz() {
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    if (!q) return '<div class="page"><p>加载失败</p></div>';
    
    const { currentIndex, userAnswers, mode, shuffledQuestions } = this.state;
    const answered = userAnswers[currentIndex];
    const typeLabel = q.type === 'multiple' ? '（多选）' : q.type === 'true_false' ? '（判断）' : '（单选）';
    const typeClass = q.type === 'multiple' ? ' multiple' : q.type === 'true_false' ? ' true-false' : ' single';
    
    // 不同题型的前缀图标
    const getPrefix = (type) => {
      if (type === 'multiple') return '☑ ';
      if (type === 'true_false') return '';
      return '○ ';
    };
    const prefix = getPrefix(q.type);

    let optionsHtml = q.options.map(opt => {
      const isMulti = q.type === 'multiple';
      const selected = isMulti ? (answered || []).includes(opt.id) : answered === opt.id;
      let classes = 'option' + typeClass;
      if (selected) classes += ' selected';
      if (mode === 'game' && answered !== undefined) {
        if (opt.isCorrect) classes += ' correct';
        else if (selected) classes += ' wrong';
      }
      return '<button type="button" class="' + classes + '" onclick="window.QuizApp.selectAnswer(' + opt.id + ')"><span>' + prefix + opt.text + '</span></button>';
    }).join('');

    // 多选时显示已选数量
    let selectionInfo = '';
    if (q.type === 'multiple' && answered && answered.length > 0) {
      selectionInfo = '<div class="selection-info">已选 ' + answered.length + ' 项</div>';
    }

    let feedbackHtml = '';
    if (mode === 'game' && answered !== undefined) {
      if (q.type === 'multiple') {
        const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
        const userIds = answered || [];
        const allCorrect = userIds.length === correctIds.length && userIds.every(id => correctIds.includes(id));
        feedbackHtml = '<div class="feedback ' + (allCorrect ? 'correct' : 'wrong') + '">' + (allCorrect ? '✓ 回答正确' : '✗ 回答错误') + '</div>';
      } else {
        const opt = q.options.find(o => o.id === answered);
        const isCorrect = opt && opt.isCorrect;
        feedbackHtml = '<div class="feedback ' + (isCorrect ? 'correct' : 'wrong') + '">' + (isCorrect ? '✓ 回答正确' : '✗ 回答错误') + '</div>';
      }
      if (q.explanation) {
        feedbackHtml += '<div class="q-explanation">解析: ' + q.explanation + '</div>';
      }
    }

    return '<div class="page quiz">' +
      '<div class="quiz-header">' +
        '<span class="progress">' + (currentIndex + 1) + ' / ' + shuffledQuestions.length + '</span>' +
        (mode === 'game' ? '<span class="score">得分: ' + this.state.score + '</span>' : '') +
      '</div>' +
      '<div class="question">' +
        '<div class="question-content">' + q.content + '</div>' +
        '<div class="question-type">' + typeLabel + '</div>' +
      '</div>' +
      '<div class="options">' + optionsHtml + selectionInfo + '</div>' +
      feedbackHtml +
      '<div class="nav-buttons">' +
        '<button class="btn btn-outline"' + (currentIndex === 0 ? ' disabled' : '') + ' onclick="window.QuizApp.prevQuestion()">上一题</button>' +
        '<button class="btn btn-primary" onclick="window.QuizApp.nextQuestion()">' + (currentIndex === shuffledQuestions.length - 1 ? '提交' : '下一题') + '</button>' +
      '</div>' +
    '</div>';
  },

  renderResult() {
    const { correctCount, totalScore, shuffledQuestions, userAnswers, mode } = this.state;
    const total = shuffledQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);

    let analysisHtml = shuffledQuestions.map((q, i) => {
      let isCorrect = false;
      let userAnswerText = '';
      let correctAnswerText = '';
      
      if (q.type === 'multiple') {
        const answerIds = userAnswers[i] || [];
        const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
        isCorrect = answerIds.length > 0 && 
                  answerIds.every(id => correctIds.includes(id)) && 
                  correctIds.every(id => answerIds.includes(id));
        userAnswerText = answerIds.map(id => q.options.find(o => o.id === id)?.text).join('、') || '未作答';
        correctAnswerText = q.options.filter(o => o.isCorrect).map(o => o.text).join('、');
      } else {
        const answer = userAnswers[i];
        const selectedOpt = q.options.find(opt => opt.id === answer);
        isCorrect = selectedOpt && selectedOpt.isCorrect;
        userAnswerText = selectedOpt?.text || '未作答';
        correctAnswerText = q.options.find(opt => opt.isCorrect)?.text || '';
      }
      
      // 构建选项显示
      const optionsText = q.options.map((opt, idx) => {
        const prefix = opt.isCorrect ? '✓' : ' ';
        const selected = q.type === 'multiple' 
          ? (userAnswers[i] || []).includes(opt.id)
          : userAnswers[i] === opt.id;
        const mark = selected ? '●' : '○';
        return mark + ' ' + opt.text;
      }).join('\n');

      return '<div class="analysis-item ' + (isCorrect ? 'correct' : 'wrong') + '">' +
        '<div class="analysis-header">' +
          '<span class="q-number">' + (i + 1) + '</span>' +
          '<span class="q-status">' + (isCorrect ? '✓' : '✗') + '</span>' +
          '<span class="q-type">' + (q.type === 'multiple' ? '（多选）' : q.type === 'true_false' ? '（判断）' : '（单选）') + '</span>' +
        '</div>' +
        '<div class="q-content">' + q.content + '</div>' +
        '<div class="q-options">' + optionsText + '</div>' +
        '<div class="q-answer">' +
          '你的答案: ' + userAnswerText +
          (!isCorrect ? ' | 正确答案: ' + correctAnswerText : '') +
        '</div>' +
        (q.explanation ? '<div class="q-explanation">' + q.explanation.replace(/\n/g, '<br>') + '</div>' : '') +
      '</div>';
    }).join('');

    return '<div class="page result">' +
      '<h1>答题完成</h1>' +
      '<div class="score-card">' +
        '<div class="score-value">' + percentage + '%</div>' +
        '<div class="score-detail">' + correctCount + ' / ' + total + '</div>' +
        (mode === 'game' ? '<div class="score-points">得分: ' + totalScore + '</div>' : '') +
      '</div>' +
      '<div class="analysis">' +
        '<h3>逐题解析</h3>' +
        analysisHtml +
      '</div>' +
      '<div class="result-actions">' +
        '<button class="btn btn-outline" onclick="QuizApp.startQuiz()">重新作答</button>' +
        '<button class="btn btn-primary" onclick="QuizApp.navigate(\'home\')">返回主页</button>' +
      '</div>' +
    '</div>';
  },

  renderHistory() {
    const history = QuizStorage.getHistory();

    let listHtml = history.map(r => {
      return '<div class="history-item">' +
        '<div class="history-title">' + r.quizTitle + '</div>' +
        '<div class="history-meta">' +
          '<span class="mode">' + (r.mode === 'exam' ? '考试' : '游戏') + '</span>' +
          '<span class="score">' + r.score + '分</span>' +
          '<span class="correct">' + r.correct + '/' + r.total + '</span>' +
        '</div>' +
        '<div class="history-time">' + new Date(r.timestamp).toLocaleString() + '</div>' +
      '</div>';
    }).join('');

    return '<div class="page history">' +
      '<h1>历史记录</h1>' +
      (history.length === 0 ? '<p class="empty">暂无记录</p>' : '<div class="history-list">' + listHtml + '</div>') +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回</a>' +
    '</div>';
  },

  renderErrors() {
    const errors = QuizStorage.getErrors();

    let listHtml = errors.map((q, i) => {
      return '<div class="error-item">' +
        '<div class="error-number">' + (i + 1) + '</div>' +
        '<div class="error-content">' + q.content + '</div>' +
        '<div class="error-answer">正确答案: ' + q.options.find(opt => opt.isCorrect)?.text + '</div>' +
        (q.explanation ? '<div class="error-explanation">解析: ' + q.explanation + '</div>' : '') +
        '<button class="btn-small" onclick="QuizStorage.removeError(\'' + q.id + '\'); QuizApp.navigate(\'errors\')">移除</button>' +
      '</div>';
    }).join('');

    return '<div class="page errors">' +
      '<h1>错题复习</h1>' +
      (errors.length === 0 ? '<p class="empty">暂无错题</p>' : '<div class="error-list">' + listHtml + '</div>') +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回</a>' +
    '</div>';
  },

  attachEvents() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) this.uploadFile(e.target.files[0]);
      });
    }
    window.QuizApp = this;
  },

  selectBuiltIn(title) {
    const quiz = builtInQuizzes.find(q => q.data.title === title);
    if (quiz) {
      this.selectQuiz(quiz.data);
    }
  },

  onQuizSelect() {
    const select = document.getElementById('quizSelect');
    this.state.selectedQuizTitle = select ? select.value : '';
  },

  startSelectedQuiz() {
    const value = this.state.selectedQuizTitle;
    if (!value) {
      alert('请先选择题库');
      return;
    }
    if (value.startsWith('custom:')) {
      const index = parseInt(value.split(':')[1], 10);
      const custom = this.state.customQuizzes[index];
      if (custom) {
        this.selectQuiz(custom.data);
      }
    } else if (value.startsWith('builtin:')) {
      const title = value.split(':')[1];
      const quiz = builtInQuizzes.find(q => q.data.title === title);
      if (quiz) {
        this.selectQuiz(quiz.data);
      }
    }
  },

  showPasteModal() {
    const modal = document.getElementById('pasteModal');
    if (modal) modal.style.display = 'flex';
  },

  submitPaste() {
    const input = document.getElementById('pasteContent');
    if (input && input.value.trim()) {
      this.parseInput(input.value.trim());
      const modal = document.getElementById('pasteModal');
      if (modal) modal.style.display = 'none';
    }
  },

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
  },

  toggleLoginMode() {
    this.state.loginMode = this.state.loginMode === 'login' ? 'register' : 'login';
    this.render();
    this.showLoginModal();
  },

  async handleLoginSubmit() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('请输入邮箱和密码');
      return;
    }

    this.showLoading(this.state.loginMode === 'login' ? '登录中...' : '注册中...');

    try {
      if (this.state.loginMode === 'login') {
        const user = await Auth.login(email, password);
        this.state.isLoggedIn = true;
        this.state.userEmail = user.email;
        alert('登录成功');
      } else {
        const user = await Auth.register(email, password);
        this.state.isLoggedIn = true;
        this.state.userEmail = user.email;
        alert('注册成功');
      }
      const modal = document.getElementById('loginModal');
      if (modal) modal.style.display = 'none';
      this.render();
    } catch (err) {
      alert(err.message || (this.state.loginMode === 'login' ? '登录失败' : '注册失败'));
    } finally {
      this.hideLoading();
    }
  },

  async handleLogout() {
    try {
      await Auth.logout();
    } catch (e) {}
    this.state.isLoggedIn = false;
    this.state.userEmail = '';
    this.render();
  },

  async checkLoginStatus() {
    try {
      const user = await Auth.check();
      if (user) {
        this.state.isLoggedIn = true;
        this.state.userEmail = user.email;
      }
    } catch (e) {
      this.state.isLoggedIn = false;
      this.state.userEmail = '';
    }
  },

  exportCustomQuiz(index) {
    const quiz = this.state.customQuizzes[index];
    if (!quiz || !quiz.data) return;
    
    const q = quiz.data;
    let txt = '';
    
    if (q.title) {
      txt += '# ' + q.title + '\n\n';
    }
    
    q.questions.forEach((question, i) => {
      const typeLabel = question.type === 'multiple' ? '【多选】' : question.type === 'true_false' ? '【判断】' : '【单选】';
      txt += typeLabel + '\n';
      txt += (i + 1) + '. ' + question.content + '\n';
      
      question.options.forEach((opt, j) => {
        const letter = String.fromCharCode(65 + j);
        const isCorrect = question.correctIndex && question.correctIndex.includes(opt.id);
        const mark = isCorrect ? '✓' : ' ';
        txt += letter + '. ' + opt.text + ' ' + mark + '\n';
      });
      
      // 显示正确答案
      if (question.correctIndex && question.correctIndex.length > 0) {
        const answers = question.correctIndex.map(idx => String.fromCharCode(65 + idx)).join('');
        const correctOptions = question.options.filter(o => question.correctIndex.includes(o.id)).map(o => o.text).join('、');
        txt += '答案：' + answers + ' (' + correctOptions + ')\n';
      }
      
      if (question.explanation) {
        txt += '解析：' + question.explanation.replace(/\n/g, '\n       ') + '\n';
      }
      
      txt += '\n---\n\n';
    });
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (q.title || '题库') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
};

window.QuizApp = QuizApp;

document.addEventListener('DOMContentLoaded', () => {
  QuizApp.init();
});