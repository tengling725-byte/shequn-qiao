const { getRating } = require('../../utils/questions.js');
const { trackEvent } = require('../../utils/dataCollector.js');

const skins = [
  { id: 'simple', name: '简洁', bg: '#f5f5f5', card: '#fff', primary: '#333', accent: '#2196f3', text: '#666' },
  { id: 'child', name: '童真', bg: '#FFE4E1', card: '#FFF0F5', primary: '#FF6B6B', accent: '#FFD700', text: '#8B4513' },
  { id: 'sketch', name: '素描', bg: '#e8e8e8', card: '#fff', primary: '#333', accent: '#666', text: '#999' },
  { id: 'cartoon', name: '卡通', bg: '#87CEEB', card: '#FFEFD5', primary: '#8B4513', accent: '#FF4500', text: '#D2691E' },
  { id: 'dark', name: '暗黑', bg: '#1a1a2e', card: 'rgba(255,255,255,0.1)', primary: '#fff', accent: '#ff6b6b', text: '#ccc' }
];

Page({
  data: {
    score: 0,
    correctCount: 0,
    totalQuestions: 10,
    maxStreak: 0,
    explosCount: 0,
    totalScore: 0,
    rating: "D",
    highScore: 0,
    isNewRecord: false,
    questions: [],
    showTip: false,
    currentTip: "",
    currentTipIndex: 0,
    currentTips: [],
    showAiAnalysis: false,
    showRevive: false,
    aiAnalysis: "",
    isLoadingAi: false
  },

  onLoad(options) {
    const score = parseInt(options.score) || 0;
    const correctCount = parseInt(options.correct) || 0;
    const totalQuestions = parseInt(options.total) || 10;
    const maxStreak = parseInt(options.maxStreak) || 0;
    const explosCount = parseInt(options.explosCount) || 0;
    const totalScore = parseInt(options.totalScore) || 0;
    const questionsStr = decodeURIComponent(options.questions || '[]');
    const questions = JSON.parse(questionsStr);
    const avgTimeSpent = parseInt(options.avgTimeSpent) || 0;
    
    const tipsStr = decodeURIComponent(options.tips || '[]');
    let currentTips = [];
    try {
      currentTips = JSON.parse(tipsStr);
    } catch (e) {
      currentTips = [];
    }
    
    const rating = getRating(correctCount, totalQuestions, 0);
    const highScore = wx.getStorageSync('highScore') || 0;
    const isNewRecord = score > highScore;
    
    this.setData({
      score,
      correctCount,
      totalQuestions,
      maxStreak,
      explosCount,
      totalScore,
      rating,
      highScore: isNewRecord ? score : highScore,
      isNewRecord,
      questions,
      avgTimeSpent,
      currentTips,
      currentTipIndex: 0,
      currentTip: currentTips[0] || "",
      showTip: false
});
  },
  
  showHumorTip() {
    trackEvent('selectTip', {
      tipIndex: this.data.currentTipIndex,
      tipContent: this.data.currentTips[this.data.currentTipIndex] || ""
    });
    this.setData({
      showTip: true,
      currentTip: this.data.currentTips[this.data.currentTipIndex] || "这道题的幽默技巧需要细细体会～"
    });
  },

  closeTip() {
    this.setData({ showTip: false });
  },

  prevTip() {
    let newIndex = this.data.currentTipIndex - 1;
    if (newIndex < 0) newIndex = Math.max(0, this.data.currentTips.length - 1);
    this.setData({ currentTipIndex: newIndex });
    this.showHumorTip();
  },

  nextTip() {
    let newIndex = (this.data.currentTipIndex + 1) % Math.max(1, this.data.currentTips.length);
    this.setData({ currentTipIndex: newIndex });
    this.showHumorTip();
  },

  restartGame() {
    const { correctCount, score } = this.data;
    const needRevive = correctCount < 6 || score < 100;
    const reviveCards = wx.getStorageSync('reviveCards') || 0;
    
    if (!needRevive || reviveCards > 0) {
      wx.redirectTo({ url: '/pages/game/game' });
    } else {
      this.setData({ showRevive: true });
    }
  },

  getReviveCard(e) {
    const type = e.currentTarget.dataset.type;
    const today = new Date().toDateString();
    const lastShareDate = wx.getStorageSync('lastShareDate') || '';
    let shareCount = parseInt(wx.getStorageSync('shareCount') || '0');
    
    if (today !== lastShareDate) {
      shareCount = 0;
      wx.setStorageSync('shareCount', '0');
    }
    
    if (shareCount >= 3) {
      wx.showToast({ title: '今日次数已用完', icon: 'none' });
      return;
    }
    
    wx.setStorageSync('shareCount', String(shareCount + 1));
    wx.setStorageSync('lastShareDate', today);
    
    const cards = (wx.getStorageSync('reviveCards') || 0) + 1;
    wx.setStorageSync('reviveCards', cards);
    
    wx.showToast({ title: '获得复活卡×1', icon: 'success' });
    this.setData({ showRevive: false });
    wx.redirectTo({ url: '/pages/game/game' });
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  goShop() {
    wx.navigateTo({
      url: '/pages/shop/shop'
    });
  },

  generateAiAnalysis() {
    this.setData({ isLoadingAi: true, showAiAnalysis: true });
    
    const correctCount = this.data.correctCount;
    const score = this.data.score;
    const explosCount = this.data.explosCount;
    const maxStreak = this.data.maxStreak;
    const avgTimeSpent = this.data.avgTimeSpent;
    
    const firstPlayDate = wx.getStorageSync('firstPlayDate');
    let gameAge = 0;
    if (firstPlayDate) {
      const firstDate = new Date(firstPlayDate);
      const now = new Date();
      gameAge = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    let bodyTemp = "", pulse = "", bloodType = "", weakness = "", suggestion = "";
    
    if (correctCount >= 8) {
      bodyTemp = "37.5℃ - 热梗狂魔，全场爆笑！";
      bloodType = "AB型 - 神反转王！你的脑洞比黑洞还大，结局永远猜不到～";
      weakness = "反转和讽刺类对你来说小case，但偶尔也会被自己的智商笑到～";
      suggestion = "你已经是最强梗王了！建议去脱口秀大会踢馆，笑翻全场！";
    } else if (correctCount >= 6) {
      bodyTemp = "37.2℃ - 微热梗王！热梗制造机预备役～";
      bloodType = "B型 - 段子输出机！你脑子里装的不是知识，是源源不断的段子～";
      weakness = "对反转类题目还挺6，但遇到荒谬延伸就容易懵圈～";
      suggestion = "再练习练习反转类题目王者就是你了！建议多刷短视频积累段子素材～";
    } else if (correctCount >= 4) {
      bodyTemp = "36.6℃ - 幽默正常！不冷不热刚刚好～";
      bloodType = "A型 - 温柔搞笑！你很安全，不伤人，就是有时候笑点有点高～";
      weakness = "对讽刺类完全不感冒，get不到阴阳怪气的点～";
      suggestion = "建议多看弹幕吐槽大会，感受一下话里有话的魅力～";
    } else if (correctCount >= 2) {
      bodyTemp = "36.0℃ - 微冷体质！你说的笑话能让人凉快一下～";
      bloodType = "O型 - 百搭气氛组！你负责笑就行不用懂梗～";
      weakness = "简直是幽默小白，答题全靠缘分和蒙～";
      suggestion = "别慌！幽默可以练！建议先从为什么开始，学会质疑一切～";
    } else {
      bodyTemp = "35.5℃ - 冷梗之王！你一张口，温度直接降10度～";
      bloodType = "O型 - 气氛组担当！你负责微笑就好了，梗的事情交给别人～";
      weakness = "笑点是什么？你与幽默之间隔了一整个银河系～";
      suggestion = "建议换个星球生活吧，或者多看看喜剧片，绝对笑不出来那种！";
    }
    
    if (avgTimeSpent < 3000) {
      pulse = "100次/分 - 秒接神梗！你是接梗仙人，反应快到飞起！";
    } else if (avgTimeSpent < 5000) {
      pulse = "72次/分 - 平稳接梗！反应大众水平，没毛病～";
    } else if (avgTimeSpent < 7000) {
      pulse = "60次/分 - 反射弧较长！等你反应回来，黄花菜都凉了～";
    } else {
      pulse = "50次/分 - 反射弧超长！别人讲完段子，你才开始酝酿笑声～";
    }
    
    let analysis = `🌱 梗龄：${gameAge}天\n\n`;
    analysis += `🌡️ 玩梗体温\n${bodyTemp}\n\n`;
    analysis += `💓 接梗脉搏\n${pulse}\n\n`;
    analysis += `🩸 幽默血型\n${bloodType}\n\n`;
    analysis += `📊 幽默长短板分析\n${weakness}\n\n`;
    analysis += `💡 建议\n${suggestion}`;
    
    setTimeout(() => {
      this.setData({
        aiAnalysis: analysis,
        isLoadingAi: false
      });
    }, 800);
  },

  closeAiAnalysis() {
    this.setData({ showAiAnalysis: false });
  },

  closeRevive() {
    this.setData({ showRevive: false });
  }
});