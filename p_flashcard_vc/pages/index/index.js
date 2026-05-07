Page({
  data: {
    isLogin: false,
    userInfo: null,
    notes: [],
    articles: [],
    activeTab: 'notes'
  },

  onShow() {
    this.checkLoginStatus();
    this.loadData();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ isLogin: true, userInfo });
    } else {
      this.setData({ isLogin: false, userInfo: null });
    }
  },

  loadData() {
    const db = require('../../utils/database.js');
    const notes = db.getNotes();
    const articles = db.getArticles();
    this.setData({ notes: notes.slice(0, 10), articles: articles.slice(0, 10) });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ isLogin: true, userInfo });
        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('getUserProfile error:', err);
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    });
  },

  createNote() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/note/note' });
  },

  composeArticle() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/compose/compose' });
  },

  goToNote(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/note/note?id=${id}` });
  },

  goToArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/article/article?id=${id}` });
  },

  deleteNote(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定删除吗？',
      success: (res) => {
        if (res.confirm) {
          const db = require('../../utils/database.js');
          db.deleteNote(id);
          this.loadData();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  deleteArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定删除吗？',
      success: (res) => {
        if (res.confirm) {
          const db = require('../../utils/database.js');
          db.deleteArticle(id);
          this.loadData();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});