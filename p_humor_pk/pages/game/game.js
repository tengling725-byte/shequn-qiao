const { getRandomQuestions } = require('../../utils/questions.js');
const { trackEvent } = require('../../utils/dataCollector.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    timeLeft: 10,
    totalTime: 10000,
    score: 0,
    correctCount: 0,
    streakCorrect: 0,
    explos: 1,
    maxStreak: 0,
    explosCount: 0,
    isAnswered: false,
    selectedAnswer: null,
    showCountdown: 3,
    isGameStart: false,
    isGameOver: false,
    showRevive: false,
    lastWrongQuestion: null,
    wrongAnswers: [],
    canRevive: false,
    MIN_CORRECT: 6,
    MIN_SCORE: 100,
    answerHistory: [],
    lastScore: 0,
    reviveCards: 0,
  },

  onLoad(options) {
    this.initGame();
  },

  initGame() {
    const questions = getRandomQuestions(10);
    const totalScore = wx.getStorageSync('totalScore') || 0;
    const gamesPlayed = wx.getStorageSync('gamesPlayed') || 0;
    this.setData({
      questions,
      currentIndex: 0,
      currentQuestion: questions[0],
      score: 0,
      correctCount: 0,
      streakCorrect: 0,
      explos: 1,
      maxStreak: 0,
      explosCount: 0,
      totalScore,
      showCountdown: 3,
      isGameStart: false,
      wrongAnswers: [],
      canRevive: false,
      answerHistory: [],
    });
    trackEvent('gameStart', { 
      gameCount: gamesPlayed + 1,
      questionIds: questions.map(q => q.id)
    });
    this.startCountdown();
  },

  startCountdown() {
    let count = 3;
    const timer = setInterval(() => {
      count--;
      this.setData({ showCountdown: count });
      if (count <= 0) {
        clearInterval(timer);
        this.setData({ isGameStart: true });
        this.startTimer();
      }
    }, 1000);
  },

  startTimer() {
    this.setData({ timeLeft: 10 });
    this.timer = setInterval(() => {
      let timeLeft = this.data.timeLeft - 1;
      this.setData({ timeLeft });
      if (timeLeft <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  },

  handleTimeout() {
    clearInterval(this.timer);
    this.processAnswer(null, 0);
  },

  selectAnswer(e) {
    if (this.data.isAnswered) return;
    
    clearInterval(this.timer);
    
    const selectedId = e.currentTarget.dataset.id;
    const currentQuestion = this.data.currentQuestion;
    const selectedOption = currentQuestion.options.find(o => o.id === selectedId);
    const humorScore = selectedOption ? selectedOption.humorScore : 0;
    
    this.processAnswer(selectedId, humorScore);
  },

  processAnswer(selectedId, humorScore) {
    const currentQuestion = this.data.currentQuestion;
    const isCorrect = currentQuestion.options.find(o => o.id === selectedId && o.correct);
    const timeSpent = (10 - this.data.timeLeft) * 1000;
    
    let { score, streakCorrect, maxStreak, explos, explosCount, correctCount, wrongAnswers, answerHistory } = this.data;
    
    if (humorScore === 5) {
      streakCorrect++;
      maxStreak = Math.max(maxStreak, streakCorrect);
      correctCount++;
      
      if (streakCorrect >= 3) {
        score += 5 * 10;
        explos = 10;
        explosCount++;
        wx.vibrateShort();
        setTimeout(() => wx.vibrateShort(), 100);
      } else {
        score += 5;
        wx.vibrateShort();
      }
    } else {
      streakCorrect = 0;
      explos = 1;
      
      if (humorScore > 0) {
        score += humorScore;
      }
      
      if (selectedId) {
        wrongAnswers.push(currentQuestion);
      }
    }
    
    answerHistory.push({
      question: currentQuestion.question,
      selectedId,
      humorScore,
      isCorrect: isCorrect ? true : false,
      timeSpent,
    });
    
    trackEvent('questionAnswered', {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      selectedId,
      humorScore,
      isCorrect: isCorrect ? true : false,
      timeSpent,
    });
    
    this.setData({
      isAnswered: true,
      selectedAnswer: selectedId,
      score,
      correctCount,
      streakCorrect,
      maxStreak,
      explos,
      explosCount,
      wrongAnswers,
      answerHistory,
      lastScore: humorScore === 5 ? (streakCorrect >= 3 ? 50 : 5) : humorScore,
    });
    
    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  },

  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= 10) {
      this.endGame();
      return;
    }
    
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      isAnswered: false,
      selectedAnswer: null,
      timeLeft: 10,
      lastScore: 0,
    });
    
    this.startTimer();
  },

  endGame() {
    clearInterval(this.timer);
    this.finishGame();
  },

  onShareAppMessage() {
    return {
      title: '幽默大挑战 - 快来帮我复活！',
      path: '/pages/game/game?revive=1&from=' + this.data.currentIndex
    };
  },

  shareToFriend() {
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        const cards = wx.getStorageSync('reviveCards') || 0;
        wx.setStorageSync('reviveCards', cards + 1);
        wx.showToast({ title: '获得复活卡×1', icon: 'success' });
        this.setData({ showRevive: false });
        this.revive();
      }
    });
  },

  savePoster() {
    const cards = wx.getStorageSync('reviveCards') || 0;
    wx.setStorageSync('reviveCards', cards + 1);
    wx.showToast({ title: '获得复活卡×1', icon: 'success' });
    this.setData({ showRevive: false });
    this.revive();
  },

  watchAd() {
    const cards = wx.getStorageSync('reviveCards') || 0;
    wx.setStorageSync('reviveCards', cards + 1);
    wx.showToast({ title: '获得复活卡×1', icon: 'success' });
    this.setData({ showRevive: false });
    this.revive();
  },

  onShareAppMessage() {
    return {
      title: '梗王争霸 - 快来帮我复活！',
      path: '/pages/game/game'
    };
  },

  revive() {
    this.setData({
      showRevive: false,
      isAnswered: false,
      selectedAnswer: null
    });
    this.setData({ currentQuestion: this.data.questions[this.data.currentIndex] });
    this.startTimer();
  },

  skipQuestion() {
    this.setData({ showRevive: false });
    this.finishGame();
  },

  finishGame() {
    const score = this.data.score;
    const correctCount = this.data.correctCount;
    const maxStreak = this.data.maxStreak;
    const explosCount = this.data.explosCount;
    const questions = this.data.questions;
    const answerHistory = this.data.answerHistory;
    
    const totalTimeSpent = answerHistory.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
    const avgTimeSpent = Math.round(totalTimeSpent / answerHistory.length);
    
    const tips = questions.map(q => q.tip).filter(t => t);
    
    let highScore = wx.getStorageSync('highScore') || 0;
    let gamesPlayed = wx.getStorageSync('gamesPlayed') || 0;
    let totalScore = wx.getStorageSync('totalScore') || 0;
    
    if (score > highScore) {
      highScore = score;
      wx.setStorageSync('highScore', highScore);
    }
    
    totalScore += score;
    gamesPlayed++;
    wx.setStorageSync('gamesPlayed', gamesPlayed);
    wx.setStorageSync('recentScore', score);
    wx.setStorageSync('totalScore', totalScore);
    
    trackEvent('gameFinish', {
      score,
      correctCount,
      maxStreak,
      explosCount,
      avgTimeSpent,
      answerDetails: answerHistory.map(a => ({
        questionId: a.question,
        humorScore: a.humorScore,
        isCorrect: a.isCorrect,
        timeSpent: a.timeSpent
      }))
    });
    
    wx.navigateTo({
      url: `/pages/result/result?score=${score}&correct=${correctCount}&total=10&maxStreak=${maxStreak}&explosCount=${explosCount}&totalScore=${totalScore}&questions=${encodeURIComponent(JSON.stringify(questions))}&avgTimeSpent=${avgTimeSpent}&tips=${encodeURIComponent(JSON.stringify(tips))}`
    });
  },

  confirmReport() {
    this.setData({ showReportDialog: false });
    this.generateReport();
  },

  cancelReport() {
    this.setData({ showReportDialog: false });
    this.finishGame();
  },

  generateReport() {
    const answerHistory = this.data.answerHistory;
    const score = this.data.score;
    const correctCount = this.data.correctCount;
    
    let reportText = `🎭 幽默大挑战 - 分析报告\n\n`;
    reportText += `📊 总得分: ${score}分\n`;
    reportText += `✅ 正确答案: ${correctCount}/10题\n\n`;
    reportText += `📝 答题详情:\n\n`;
    
    answerHistory.forEach((item, index) => {
      const scoreLabel = item.humorScore === 5 ? '✅' : (item.humorScore === 0 ? '❌' : '⚠️');
      const scoreText = item.humorScore === 5 ? '正确答案' : (item.humorScore === 0 ? '无笑点' : `${item.humorScore}分`);
      reportText += `${index + 1}. ${item.question}\n`;
      reportText += `   ${scoreLabel} ${item.selectedId}: ${scoreText}\n\n`;
    });
    
    wx.setStorageSync('lastReport', reportText);
    
    wx.navigateTo({
      url: `/pages/report/report?report=${encodeURIComponent(reportText)}`
    });
  },
});