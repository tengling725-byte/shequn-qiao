Page({
  data: {
    highScore: 0,
    recentScore: 0,
    gamesPlayed: 0,
    totalScore: 0,
    gameAge: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const highScore = wx.getStorageSync('highScore') || 0;
    const recentScore = wx.getStorageSync('recentScore') || 0;
    const gamesPlayed = wx.getStorageSync('gamesPlayed') || 0;
    const totalScore = wx.getStorageSync('totalScore') || 0;
    let gameAge = 1;
    
    this.setData({ highScore, recentScore, gamesPlayed, totalScore, gameAge });
  },

  resetData() {
    wx.vibrateShort();
    wx.removeStorageSync('highScore');
    wx.removeStorageSync('totalScore');
    wx.removeStorageSync('recentScore');
    wx.removeStorageSync('gamesPlayed');
    wx.removeStorageSync('firstPlayDate');
    this.setData({
      highScore: 0,
      recentScore: 0,
      gamesPlayed: 0,
      totalScore: 0,
      gameAge: 1
    });
    wx.showToast({ title: '已重置', icon: 'none' });
  },

  startGame() {
    wx.navigateTo({
      url: '/pages/game/game'
    });
  },

  goShop() {
    wx.navigateTo({
      url: '/pages/shop/shop'
    });
  }
})