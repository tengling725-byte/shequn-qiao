let builtInQuizzes = [];

const escapeHtml = (str) => {
  if (!str) return str;
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const hashContent = (data) => {
  const str = JSON.stringify(data?.questions || data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(16);
};

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
    _importedHashes: new Set(),
    selectedQuizTitle: '',
    isLoggedIn: false,
    userEmail: '',
    username: '',
    redirectAfterLogin: null
  },

  // 最小 hash 路由：页面 ↔ hash 映射
  HASH_MAP: { history: '#/history', errors: '#/errors', myQuizzes: '#/my-quizzes' },

  parseHash() {
    const h = location.hash;
    if (h === '#/history') return 'history';
    if (h === '#/my-quizzes') return 'myQuizzes';
    if (h === '#/errors') return 'errors';
    return null;
  },

  initHashRouting() {
    const route = () => {
      // 跳过由 navigate() 内部触发的 hash 变化
      if (this._ignoreHash) { this._ignoreHash = false; return; }
      const page = this.parseHash() || 'home';
      if (page !== this.state.currentPage) {
        if (['history', 'myQuizzes', 'errors'].includes(page)) {
          this.requireLogin(page);
        } else {
          this.navigate(page);
        }
      }
    };
    addEventListener('hashchange', route);
    route();
  },

  // 登录守卫：未登录跳转登录页，登录后回跳
  requireLogin(page) {
    if (!this.state.isLoggedIn) {
      alert('请先登录后使用此功能');
      this.state.redirectAfterLogin = page;
      this.navigate('login');
      return false;
    }
    this.navigate(page);
    return true;
  },

  scoring: {
    exam: { correct: 10, wrong: 0 },
    game: { correct: 5, time5: 5, time10: 3, wrong: -5, streak3: 10, streak5: 20 }
  },

  init() {
    this.state.currentQuiz = null;
    this.state.customQuizzes = this.loadCustomQuizzes();
    // 用已有题库的哈希填充去重集合
    this.state._importedHashes = new Set(
      this.state.customQuizzes.map(q => q.hash || hashContent(q.data))
    );
    window.QuizApp = this;
    this.loadBuiltInQuizzes();
    this.checkLoginStatus().then(() => {
      this.initHashRouting();
    });
    // 监听 401 未授权事件
    addEventListener('unauthorized', () => {
      const wasLoggedIn = this.state.isLoggedIn;
      this.state.isLoggedIn = false;
      this.state.userEmail = '';
      this.state.username = '';
      this.state.redirectAfterLogin = null;
      // 仅当之前已登录、session 过期时才跳转登录页；初始未登录时不跳转
      if (wasLoggedIn) {
        this.navigate('login');
      }
    });
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
    const hash = hashContent(quizData);
    // 哈希去重
    if (this.state._importedHashes.has(hash)) {
      alert('这个题库已经导入过了');
      return false;
    }
    this.state._importedHashes.add(hash);
    this.state.customQuizzes.push({
      name: name,
      data: quizData,
      questions: quizData.questions ? quizData.questions.length : 0,
      hash: hash
    });
    this.saveCustomQuizzes();
    // 已登录时同步到云端
    if (this.state.isLoggedIn) {
      QuizStorage.saveCustom(name, quizData);
    }
  },

  async syncCustomToCloud(index) {
    const quiz = this.state.customQuizzes[index];
    if (!quiz) return;

    const localHash = quiz.hash || hashContent(quiz.data);

    try {
      const cloudQuizzes = await API.getQuizzes();
      const dupe = (cloudQuizzes.quizzes || []).find(q => q.content_hash === localHash);
      if (dupe) {
        alert('已在库中');
        quiz.cloudId = dupe.id;
        quiz.hash = localHash;
        this.saveCustomQuizzes();
        this.render();
        return;
      }
    } catch (e) { /* 查询失败继续上传 */ }

    try {
      const result = await API.saveQuiz(quiz.name, quiz.data, localHash);
      if (result && result.quiz) {
        quiz.cloudId = result.quiz.id;
        quiz.hash = localHash;
        this.saveCustomQuizzes();
        this.render();
      }
    } catch (e) {
      alert('上传失败: ' + (e.message || '网络错误'));
    }
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

  async startCloudQuiz(quizId) {
    this.showLoading('加载题库...');
    try {
      const data = await API.getQuiz(quizId);
      if (data && data.quiz && data.quiz.data) {
        this.selectQuiz(data.quiz.data);
      } else {
        alert('加载题库失败');
      }
    } catch (e) {
      alert('加载题库失败: ' + (e.message || '网络错误'));
    }
    this.hideLoading();
  },

  startLocalQuiz(index) {
    const custom = this.state.customQuizzes[index];
    if (custom && custom.data) {
      this.selectQuiz(custom.data);
    }
  },

  async deleteCloudQuiz(quizId) {
    if (!confirm('确定删除这个题库？')) return;
    try {
      await API.deleteQuiz(quizId);
      this.navigate('myQuizzes');
    } catch (e) {
      alert('删除失败: ' + (e.message || '网络错误'));
    }
  },

  navigate(page) {
    this.state.currentPage = page;
    // 标记内部导航，防止 href="#" 触发的 hashchange 覆盖当前页面
    this._ignoreHash = true;
    if (this.HASH_MAP[page]) {
      location.hash = this.HASH_MAP[page];
    } else if (page === 'home') {
      history.replaceState(null, '', location.pathname);
    }
    this.render();
  },

  selectQuiz(quizData) {
    // 规范化：将 JSON 的 isCorrect 格式统一转换为 correctAnswerIds 格式
    const parser = new TagBasedParser();
    quizData.questions = quizData.questions.map((q, i) => parser.normalizeQuestion(q, i));
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

    const needShuffle = (q) => {
      // 解析含"选项"关键字 → 不洗牌
      if (q.explanation && q.explanation.includes('选项')) return false;
      for (const opt of q.options) {
        const text = opt.text || '';
        if (/都对|都不对|都错|全对|全错|以上都对|以上都错|均对|均错|均不对|以上都是/.test(text)) {
          return false;
        }
      }
      return true;
    };

    const parser = new TagBasedParser();
    const totalQuestions = this.state.currentQuiz.questions.length;
    const count = Math.min(this.state.questionCount, totalQuestions);

    const shuffled = [...this.state.currentQuiz.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(q => {
        if (needShuffle(q)) {
          return parser.shuffleOptions(q);
        }
        return q;
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
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    if (this.state.mode === 'game' && this.state.hasAnswered) return;

    const current = this.state.userAnswers[this.state.currentIndex] || [];
    const idx = current.indexOf(optionId);

    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(optionId);
    }

    this.state.userAnswers[this.state.currentIndex] = current;

    // 游戏模式：等待"确定"按钮，不立即判分
    // 考试模式：勾选即生效
    if (this.state.mode !== 'game') {
      this.state.hasAnswered = current.length > 0;
    }

    this.render();
  },

  confirmMultiAnswer() {
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    const current = this.state.userAnswers[this.state.currentIndex] || [];
    this.state.hasAnswered = true;
    if (current.length > 0) {
      this.calculateMultiScore(current);
    }
    this.render();
  },

  calculateScore(optionId) {
    const q = this.state.shuffledQuestions[this.state.currentIndex];
    const selectedOpt = q.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOpt && q.correctAnswerIds.includes(selectedOpt.id);
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
    const correctIds = q.correctAnswerIds || [];
    const isCorrect = [...answerIds].sort().join(',') === [...correctIds].sort().join(',');
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
        const correctIds = q.correctAnswerIds || [];
        isCorrect = answerIds.length > 0 &&
                   [...answerIds].sort().join(',') === [...correctIds].sort().join(',');
      } else {
        const answer = userAnswers[i];
        if (answer !== undefined) {
          const selectedOpt = q.options.find(opt => opt.id === answer);
          isCorrect = selectedOpt && q.correctAnswerIds.includes(selectedOpt.id);
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
        const answerStr = Array.isArray(answer) ? answer.join(',') : String(answer);
        const qWithAnswer = { ...q, userAnswer: answerStr };
        QuizStorage.addErrors(qWithAnswer, answerStr, isCorrect);
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
        const baseName = file.name.replace(/\.[^.]+$/, '');
        // 多题库文件：分别添加（先于 checkQuizData，后者只认 data.questions）
        if (data.banks) {
          data.banks.forEach(bank => {
            bank.title = `题库_${bank.title || baseName}_${that.getDateStr()}`;
            that.addCustomQuiz(bank);
          });
          alert(`已添加 ${data.banks.length} 个题库`);
        } else {
          const checkResult = QuizParser.checkQuizData(data, e.target.result, file.name);
          if (checkResult) {
            that.showAIParserModal(checkResult);
            return;
          }
          data.title = `题库_${data.title || baseName}_${that.getDateStr()}`;
          that.addCustomQuiz(data);
          alert('题库已添加：' + data.title);
        }
        if (!that.state.isLoggedIn) {
          alert('未登录，题库仅为暂存，建议登录');
        }
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
      // 多题库文件：分别添加（先于 checkQuizData，后者只认 data.questions）
      if (data.banks) {
        data.banks.forEach(bank => {
          bank.title = `题库_${bank.title || '粘贴'}_${that.getDateStr()}`;
          that.addCustomQuiz(bank);
        });
        alert(`已添加 ${data.banks.length} 个题库`);
      } else {
        const checkResult = QuizParser.checkQuizData(data, content, 'input.txt');
        if (checkResult) {
          that.showAIParserModal(checkResult);
          return;
        }
        data.title = `题库_${data.title || '粘贴'}_${that.getDateStr()}`;
        that.addCustomQuiz(data);
        alert('题库已添加：' + data.title);
      }
      if (!that.state.isLoggedIn) {
        alert('未登录，题库仅为暂存，建议登录');
      }
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

  async render() {
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
      case 'myQuizzes':
        app.innerHTML = await this.renderMyQuizzes();
        break;
      case 'history':
        app.innerHTML = await this.renderHistory();
        break;
      case 'errors':
        app.innerHTML = await this.renderErrors();
        break;
      case 'login':
        app.innerHTML = this.renderLogin();
        break;
      case 'register':
        app.innerHTML = this.renderRegister();
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
        this.state.customQuizzes.map((q, i) => {
          let cloudBtn = '';
          if (this.state.isLoggedIn) {
            if (q.cloudId) {
              cloudBtn = '<button class="btn-small" disabled>已在库中</button>';
            } else {
              cloudBtn = '<button class="btn-small btn-primary" onclick="QuizApp.syncCustomToCloud(' + i + ')">上传到我的题库</button>';
            }
          } else {
            cloudBtn = '<button class="btn-small btn-primary" onclick="QuizApp.navigate(\'login\')">上传到我的题库</button>';
          }
          return '<div class="custom-quiz-item">' +
            '<span>' + q.name + ' (' + q.questions + '题)</span>' +
            '<div class="quiz-item-actions">' +
              '<button class="btn-small" onclick="QuizApp.exportCustomQuiz(' + i + ')">导出</button>' +
              cloudBtn +
              '<button class="btn-small" onclick="QuizApp.deleteCustomQuiz(' + i + ')">删除</button>' +
            '</div>' +
          '</div>';
        }).join('') +
        '<button class="btn-text" onclick="QuizApp.clearCustomQuizzes()">清空自定义题库</button>' +
        '</div>'
      : '';

    const authHtml = this.state.isLoggedIn
      ? '<div class="user-info"><span>' + this.state.username + ' (' + this.state.userEmail + ')</span><button class="btn-text" onclick="QuizApp.handleLogout()">登出</button></div>'
      : '<div class="auth-links"><a href="#" data-testid="login-link" onclick="QuizApp.navigate(\'login\')">登录</a> | <a href="#" data-testid="register-link" onclick="QuizApp.navigate(\'register\')">注册</a></div>';

    return '<div class="page home">' +
      '<h1>EasyQuiz</h1>' +
      '<p class="subtitle">选择题库开始答题</p>' +
      '<div class="quiz-list">' +
        '<select id="quizSelect" data-testid="quiz-select" class="quiz-select" onchange="QuizApp.onQuizSelect()">' +
          '<option value="">-- 请选择题库 --</option>' +
          '<optgroup label="内置题库">' + builtOptions + '</optgroup>' +
          (customOptions ? '<optgroup label="自定义题库">' + customOptions + '</optgroup>' : '') +
        '</select>' +
        '<button class="btn btn-primary" data-testid="start-quiz" onclick="QuizApp.startSelectedQuiz()">开始答题</button>' +
        '<button class="btn btn-outline" data-testid="upload-btn" onclick="document.getElementById(\'fileInput\').click()">上传题库</button>' +
        '<input type="file" id="fileInput" data-testid="file-input" accept=".json,.txt,.md" style="display:none">' +
        '<button class="btn btn-outline" data-testid="paste-btn" onclick="QuizApp.showPasteModal()">粘贴题库</button>' +
      '</div>' +
      customManageHtml +
      '<div class="nav-links">' +
        '<a href="#/my-quizzes" onclick="return QuizApp.requireLogin(\'myQuizzes\')">我的题库</a>' +
        '<a href="#/history" onclick="return QuizApp.requireLogin(\'history\')">历史记录</a>' +
        '<a href="#/errors" onclick="return QuizApp.requireLogin(\'errors\')">错题复习</a>' +
      '</div>' +
      authHtml +
      '<div id="pasteModal" class="modal" style="display:none">' +
        '<div class="modal-content">' +
          '<h3>粘贴题库内容</h3>' +
          '<textarea id="pasteContent" data-testid="paste-textarea" placeholder="粘贴 JSON/TXT/MD 格式的题库内容"></textarea>' +
          '<div class="modal-buttons">' +
            '<button class="btn btn-primary" data-testid="paste-submit" onclick="QuizApp.submitPaste()">确认</button>' +
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
          '<button class="btn' + (this.state.mode === 'exam' ? ' active' : '') + '" data-testid="mode-exam" onclick="QuizApp.setMode(\'exam\')">考试模式</button>' +
          '<button class="btn' + (this.state.mode === 'game' ? ' active' : '') + '" data-testid="mode-game" onclick="QuizApp.setMode(\'game\')">游戏模式</button>' +
        '</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-large" data-testid="start-btn" onclick="QuizApp.startQuiz()">开始答题</button>' +
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

    let optionsHtml = q.options.map(opt => {
      const isMulti = q.type === 'multiple';
      const selected = isMulti ? (answered || []).includes(opt.id) : answered === opt.id;
      let classes = 'option' + typeClass;
      if (selected) classes += ' selected';
      if (mode === 'game' && this.state.hasAnswered) {
        if (q.correctAnswerIds.includes(opt.id)) classes += ' correct';
        else if (selected) classes += ' wrong';
      }
      return '<button type="button" class="' + classes + '" data-testid="option-' + opt.id + '" onclick="window.QuizApp.selectAnswer(' + opt.id + ')"><span>' + opt.code + '. ' + escapeHtml(opt.text) + '</span></button>';
    }).join('');

    // 多选时显示已选数量
    let selectionInfo = '';
    if (q.type === 'multiple' && answered && answered.length > 0) {
      selectionInfo = '<div class="selection-info">已选 ' + answered.length + ' 项</div>';
    }

    let feedbackHtml = '';
    if (mode === 'game' && this.state.hasAnswered) {
      if (q.type === 'multiple') {
        const correctIds = q.correctAnswerIds || [];
        const userIds = answered || [];
        const allCorrect = [...userIds].sort().join(',') === [...correctIds].sort().join(',');
        feedbackHtml = '<div class="feedback ' + (allCorrect ? 'correct' : 'wrong') + '">' + (allCorrect ? '✓ 回答正确' : '✗ 回答错误') + '</div>';
      } else {
        const opt = q.options.find(o => o.id === answered);
        const isCorrect = opt && q.correctAnswerIds.includes(opt.id);
        feedbackHtml = '<div class="feedback ' + (isCorrect ? 'correct' : 'wrong') + '">' + (isCorrect ? '✓ 回答正确' : '✗ 回答错误') + '</div>';
      }
      if (q.explanation) {
        feedbackHtml += '<div class="q-explanation">解析: ' + escapeHtml(q.explanation) + '</div>';
      }
    }

    // 游戏模式下多选：须点"确定"后才能继续
    const needConfirm = mode === 'game' && q.type === 'multiple' && !this.state.hasAnswered;
    let confirmBtn = '';
    if (needConfirm && answered && answered.length > 0) {
      confirmBtn = '<button class="btn btn-primary btn-large" style="margin-bottom:16px;" onclick="window.QuizApp.confirmMultiAnswer()">确定</button>';
    }

    return '<div class="page quiz">' +
      '<div class="quiz-header">' +
        '<span class="progress">' + (currentIndex + 1) + ' / ' + shuffledQuestions.length + '</span>' +
        (mode === 'game' ? '<span class="score">得分: ' + this.state.score + '</span>' : '') +
      '</div>' +
      '<div class="question">' +
        '<div class="question-content">' + escapeHtml(q.content) + '</div>' +
        '<div class="question-type">' + typeLabel + '</div>' +
      '</div>' +
      '<div class="options">' + optionsHtml + selectionInfo + '</div>' +
      confirmBtn +
      feedbackHtml +
      '<div class="nav-buttons">' +
        '<button class="btn btn-outline"' + (currentIndex === 0 ? ' disabled' : '') + ' data-testid="prev-btn" onclick="window.QuizApp.prevQuestion()">上一题</button>' +
        '<button class="btn btn-primary" data-testid="next-btn"' + (needConfirm ? ' disabled' : '') + ' onclick="window.QuizApp.nextQuestion()">' + (currentIndex === shuffledQuestions.length - 1 ? '提交' : '下一题') + '</button>' +
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
        const correctIds = q.correctAnswerIds || [];
        isCorrect = answerIds.length > 0 &&
                  [...answerIds].sort().join(',') === [...correctIds].sort().join(',');
        userAnswerText = answerIds.map(id => q.options.find(o => o.id === id)?.code).join('、') || '未作答';
        correctAnswerText = (q.correctAnswerIds || []).map(id => q.options.find(o => o.id === id)?.code).join('、');
      } else {
        const answer = userAnswers[i];
        const selectedOpt = q.options.find(opt => opt.id === answer);
        isCorrect = selectedOpt && q.correctAnswerIds.includes(selectedOpt.id);
        userAnswerText = selectedOpt?.code || '未作答';
        correctAnswerText = q.options.find(o => q.correctAnswerIds.includes(o.id))?.code || '';
      }

      // 构建选项显示（带 code）
      const optionsText = q.options.map((opt, idx) => {
        const isAnswer = q.correctAnswerIds.includes(opt.id);
        const selected = q.type === 'multiple'
          ? (userAnswers[i] || []).includes(opt.id)
          : userAnswers[i] === opt.id;
        const mark = selected ? '●' : '○';
        return mark + ' ' + opt.code + '. ' + escapeHtml(opt.text) + (isAnswer ? ' ✓' : '');
      }).join('\n');

      return '<div class="analysis-item ' + (isCorrect ? 'correct' : 'wrong') + '">' +
        '<div class="analysis-header">' +
          '<span class="q-number">' + (i + 1) + '</span>' +
          '<span class="q-status">' + (isCorrect ? '✓' : '✗') + '</span>' +
          '<span class="q-type">' + (q.type === 'multiple' ? '（多选）' : q.type === 'true_false' ? '（判断）' : '（单选）') + '</span>' +
        '</div>' +
        '<div class="q-content">' + escapeHtml(q.content) + '</div>' +
        '<div class="q-options">' + optionsText + '</div>' +
        '<div class="q-answer">' +
          '你的答案: ' + userAnswerText +
          (!isCorrect ? ' | 正确答案: ' + correctAnswerText : '') +
        '</div>' +
        (q.explanation ? '<div class="q-explanation">解析: ' + escapeHtml(q.explanation).replace(/\n/g, '<br>') + '</div>' : '') +
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

  async renderHistory() {
    const history = await QuizStorage.getHistory();

    let listHtml = (history || []).map(r => {
      return '<div class="history-item">' +
        '<div class="history-title">' + r.quiz_title + '</div>' +
        '<div class="history-meta">' +
          '<span class="mode">' + (r.mode === 'exam' ? '考试' : '游戏') + '</span>' +
          '<span class="score">' + r.score + '分</span>' +
          '<span class="correct">' + r.correct + '/' + r.total + '</span>' +
        '</div>' +
        '<div class="history-time">' + new Date(r.created_at).toLocaleString() + '</div>' +
      '</div>';
    }).join('');

    return '<div class="page history">' +
      '<h1>历史记录</h1>' +
      (history.length === 0 ? '<p class="empty">暂无记录</p>' : '<div class="history-list">' + listHtml + '</div>') +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回</a>' +
    '</div>';
  },

  async renderErrors() {
    const errors = await QuizStorage.getErrors();

    let listHtml = (errors || []).map((q, i) => {
      // 构建选项显示（与答卷总结格式一致）
      const optionsText = (q.options || []).map(opt => {
        const isAnswer = (q.correctAnswerIds || []).includes(opt.id);
        const userAnswered = q.userAnswer ? q.userAnswer.split(',').includes(String(opt.id)) : false;
        const mark = userAnswered ? '●' : '○';
        return mark + ' ' + (opt.code || '') + '. ' + escapeHtml(opt.text) + (isAnswer ? ' ✓' : '');
      }).join('\n');

      // 正确答案文本
      const correctAnswerText = (q.correctAnswerIds || []).map(id => {
        const opt = (q.options || []).find(o => o.id === id);
        return opt ? (opt.code || opt.text) : '';
      }).filter(Boolean).join('、');

      // 用户答案文本
      const userAnswerText = q.userAnswer ? q.userAnswer.split(',').map(id => {
        const opt = (q.options || []).find(o => o.id === parseInt(id));
        return opt ? (opt.code || opt.text) : id;
      }).join('、') : '';

      return '<div class="analysis-item wrong">' +
        '<div class="analysis-header">' +
          '<span class="q-number">' + (i + 1) + '</span>' +
          '<span class="q-status">✗</span>' +
          '<span class="q-type">' + (q.type === 'multiple' ? '（多选）' : q.type === 'true_false' ? '（判断）' : '（单选）') + '</span>' +
        '</div>' +
        '<div class="q-content">' + escapeHtml(q.content) + '</div>' +
        '<div class="q-options">' + optionsText + '</div>' +
        '<div class="q-answer">' +
          (userAnswerText ? '你的答案: ' + userAnswerText + ' | ' : '') + '正确答案: ' + correctAnswerText +
        '</div>' +
        (q.explanation ? '<div class="q-explanation">解析: ' + escapeHtml(q.explanation).replace(/\n/g, '<br>') + '</div>' : '') +
        '<button class="btn-small" style="margin-top:8px;" onclick="QuizStorage.removeError(\'' + (q.id || q.question_id || '') + '\'); QuizApp.navigate(\'errors\')">移除</button>' +
      '</div>';
    }).join('');

    return '<div class="page errors">' +
      '<h1>错题复习</h1>' +
      (errors.length === 0 ? '<p class="empty">暂无错题</p>' : '<div class="analysis">' + listHtml + '</div>') +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回</a>' +
    '</div>';
  },

  async renderMyQuizzes() {
    const quizzes = await QuizStorage.getCustom();
    const emptyMsg = this.state.isLoggedIn
      ? '暂无云端题库，上传题库即可同步到云端'
      : '暂无本地题库，<a href="#" onclick="QuizApp.navigate(\'home\')">去上传</a>';

    const listHtml = quizzes.length === 0
      ? '<p class="empty">' + emptyMsg + '</p>'
      : quizzes.map((q, i) => {
          const count = q.question_count || q.data?.questions?.length || q.questions || 0;
          const name = q.name || q.title || '未命名题库';
          const startBtn = this.state.isLoggedIn
            ? '<button class="btn-small btn-primary" onclick="QuizApp.startCloudQuiz(\'' + q.id + '\')">开始</button>'
            : '<button class="btn-small btn-primary" onclick="QuizApp.startLocalQuiz(' + i + ')">开始</button>';
          const delBtn = this.state.isLoggedIn
            ? '<button class="btn-small" onclick="QuizApp.deleteCloudQuiz(\'' + q.id + '\')">删除</button>'
            : '<button class="btn-small" onclick="QuizApp.deleteCustomQuiz(' + i + ')">删除</button>';
          return '<div class="custom-quiz-item">' +
            '<span>' + name + ' (' + count + '题)</span>' +
            '<div class="quiz-item-actions">' + startBtn + delBtn + '</div>' +
          '</div>';
        }).join('');

    return '<div class="page my-quizzes">' +
      '<h1>我的题库</h1>' +
      listHtml +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回首页</a>' +
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

  renderLogin() {
    return '<div class="page">' +
      '<h1>登录</h1>' +
      '<div class="auth-form">' +
        '<input type="email" id="loginEmail" placeholder="邮箱" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">' +
        '<input type="password" id="loginPassword" placeholder="密码" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">' +
        '<button class="btn btn-primary" onclick="QuizApp.handleLoginSubmit()" style="width:100%;margin-bottom:10px;">登录</button>' +
        '<p style="text-align:center;">还没有账号？<a href="javascript:void(0)" onclick="QuizApp.navigate(\'register\')">去注册</a></p>' +
      '</div>' +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回首页</a>' +
    '</div>';
  },

  renderRegister() {
    return '<div class="page">' +
      '<h1>注册</h1>' +
      '<div class="auth-form">' +
        '<input type="text" id="regUsername" placeholder="用户名" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">' +
        '<input type="email" id="regEmail" placeholder="邮箱" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">' +
        '<input type="password" id="regPassword" placeholder="密码（至少6位）" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">' +
        '<input type="password" id="regConfirmPassword" placeholder="确认密码" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">' +
        '<button class="btn btn-primary" onclick="QuizApp.handleRegisterSubmit()" style="width:100%;margin-bottom:10px;">注册</button>' +
        '<p style="text-align:center;">已有账号？<a href="#" onclick="QuizApp.navigate(\'login\')">去登录</a></p>' +
      '</div>' +
      '<a href="#" class="back-link" onclick="QuizApp.navigate(\'home\')">返回首页</a>' +
    '</div>';
  },

  async handleLoginSubmit() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('请输入邮箱和密码');
      return;
    }

    this.showLoading('登录中...');

    try {
      const user = await Auth.login(email, password);
      this.state.isLoggedIn = true;
      this.state.userEmail = user.email;
      this.state.username = user.username || '';
      this.hideLoading();

      // 检查本地临时记录
      await this.syncLocalToCloud();

      // 登录成功后回跳到目标页面
      if (this.state.redirectAfterLogin) {
        const target = this.state.redirectAfterLogin;
        this.state.redirectAfterLogin = null;
        this.navigate(target);
      } else {
        this.navigate('home');
      }
    } catch (err) {
      this.hideLoading();
      alert(err.message || '登录失败');
    }
  },

  async syncLocalToCloud() {
    // 检查本地是否有临时记录
    const localCustom = JSON.parse(localStorage.getItem('quiz_custom') || '[]');
    const localErrors = JSON.parse(localStorage.getItem('quiz_errors') || '[]');
    const localHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
    const hasLocal = localCustom.length > 0 || localErrors.length > 0 || localHistory.length > 0;

    if (!hasLocal) return;

    if (confirm('检测到本地临时记录（题库/错题/历史），是否加入云端以便未来访问？')) {
      this.showLoading('同步中...');
      // 同步题库
      for (const item of localCustom) {
        try { await QuizStorage.saveCustom(item.name, item.data); } catch (e) { /* skip */ }
      }
      // 同步错题
      for (const item of localErrors) {
        try { await QuizStorage.addErrors(item, '', false); } catch (e) { /* skip */ }
      }
      // 同步历史
      for (const item of localHistory) {
        try { await QuizStorage.addHistory(item); } catch (e) { /* skip */ }
      }
      this.hideLoading();
    }
    // 清除本地临时记录
    localStorage.removeItem('quiz_custom');
    localStorage.removeItem('quiz_errors');
    localStorage.removeItem('quiz_history');
    localStorage.removeItem('easyQuiz_custom');
  },

  async handleRegisterSubmit() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!username || !email || !password || !confirmPassword) {
      alert('所有字段不能为空');
      return;
    }

    if (password !== confirmPassword) {
      alert('两次密码不一致');
      return;
    }

    this.showLoading('注册中...');

    try {
      const user = await Auth.register(username, email, password, confirmPassword);
      this.state.isLoggedIn = true;
      this.state.userEmail = user.email;
      this.state.username = user.username || '';
      this.hideLoading();
      if (this.state.redirectAfterLogin) {
        const target = this.state.redirectAfterLogin;
        this.state.redirectAfterLogin = null;
        this.navigate(target);
      } else {
        this.navigate('home');
      }
    } catch (err) {
      this.hideLoading();
      alert(err.message || '注册失败');
    }
  },

  async handleLogout() {
    try {
      await Auth.logout();
    } catch (e) {}
    this.state.isLoggedIn = false;
    this.state.userEmail = '';
    this.state.username = '';
    this.state.redirectAfterLogin = null;
    this.state.customQuizzes = [];
    localStorage.removeItem('easyQuiz_custom');
    localStorage.removeItem('quiz_custom');
    localStorage.removeItem('quiz_errors');
    localStorage.removeItem('quiz_history');
    this.navigate('home');
  },

  async checkLoginStatus() {
    try {
      const user = await Auth.check();
      if (user) {
        this.state.isLoggedIn = true;
        this.state.userEmail = user.email;
        this.state.username = user.username || '';
      }
    } catch (e) {
      this.state.isLoggedIn = false;
      this.state.userEmail = '';
      this.state.username = '';
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
        const isCorrect = question.correctAnswerIds && question.correctAnswerIds.includes(opt.id);
        const mark = isCorrect ? '✓' : ' ';
        txt += letter + '. ' + opt.text + ' ' + mark + '\n';
      });

      // 显示正确答案
      if (question.correctAnswerIds && question.correctAnswerIds.length > 0) {
        const answers = question.correctAnswerIds.map(idx => String.fromCharCode(65 + idx)).join('');
        const correctOptions = question.correctAnswerIds.map(id => question.options.find(o => o.id === id)?.text).filter(Boolean).join('、');
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