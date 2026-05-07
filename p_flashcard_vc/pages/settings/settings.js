const db = require('../../utils/database.js');

const DEFAULT_CATEGORIES = ['生活记事', '工作记事', '点子', '待办'];

Page({
  data: {
    lockEnabled: false,
    hasPassword: false,
    showSetPassword: false,
    showVerifyPassword: false,
    passwordInput: '',
    confirmPassword: '',
    passwordError: '',
    userInfo: null,
    notesCount: 0,
    articlesCount: 0,
    showCategoryManage: false,
    showStyleManage: false,
    categories: [],
    aiStyles: [],
    editCategoryName: '',
    editCategoryIndex: -1,
    showCategoryModal: false,
    editStyleName: '',
    editStylePrompt: '',
    editStyleIndex: -1,
    showStyleModal: false
  },

  onShow() {
    this.checkLockStatus();
    this.loadStats();
    this.loadConfig();
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });
  },

  loadConfig() {
    this.setData({
      categories: db.getCategories(),
      aiStyles: db.getAiStyles()
    });
  },

  checkLockStatus() {
    const lockPassword = wx.getStorageSync('lockPassword');
    this.setData({
      lockEnabled: !!lockPassword,
      hasPassword: !!lockPassword
    });
  },

  loadStats() {
    const notes = db.getNotes();
    const articles = db.getArticles();
    this.setData({
      notesCount: notes.length,
      articlesCount: articles.length
    });
  },

  toggleLock() {
    if (this.data.lockEnabled) {
      wx.showModal({
        title: '关闭锁屏密码',
        content: '确定要关闭锁屏密码吗？',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorageSync('lockPassword');
            this.setData({ lockEnabled: false, hasPassword: false });
            wx.showToast({ title: '已关闭', icon: 'success' });
          }
        }
      });
    } else {
      this.setData({ showSetPassword: true });
    }
  },

  onPasswordInput(e) {
    this.setData({ passwordInput: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  setPassword() {
    const { passwordInput, confirmPassword } = this.data;
    if (!passwordInput || passwordInput.length < 4) {
      this.setData({ passwordError: '密码至少4位' });
      return;
    }
    if (passwordInput !== confirmPassword) {
      this.setData({ passwordError: '两次密码不一致' });
      return;
    }
    wx.setStorageSync('lockPassword', passwordInput);
    this.setData({
      showSetPassword: false,
      lockEnabled: true,
      hasPassword: true,
      passwordInput: '',
      confirmPassword: '',
      passwordError: ''
    });
    wx.showToast({ title: '密码已设置', icon: 'success' });
  },

  cancelSetPassword() {
    this.setData({
      showSetPassword: false,
      passwordInput: '',
      confirmPassword: '',
      passwordError: ''
    });
  },

  verifyPassword() {
    const storedPassword = wx.getStorageSync('lockPassword');
    if (this.data.passwordInput === storedPassword) {
      this.setData({ showVerifyPassword: false, passwordInput: '' });
      getApp().globalData.isUnlocked = true;
    } else {
      this.setData({ passwordError: '密码错误' });
    }
  },

  cancelVerify() {
    wx.navigateBack();
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          getApp().globalData.userInfo = null;
          getApp().globalData.isLogin = false;
          wx.reLaunch({ url: '/pages/index/index' });
        }
      }
    });
  },

  exportData() {
    const notes = db.getNotes();
    const articles = db.getArticles();
    const exportData = { notes, articles, exportTime: new Date().toISOString() };
    wx.setStorageSync('exportData', exportData);
    wx.showToast({ title: '数据已导出', icon: 'success' });
  },

  importData() {
    wx.showModal({
      title: '导入数据',
      content: '将覆盖现有数据，确定要导入吗？',
      success: (res) => {
        if (res.confirm) {
          const importData = wx.getStorageSync('exportData');
          if (importData) {
            db.db.notes = importData.notes || [];
            db.db.articles = importData.articles || [];
            db.save();
            this.loadStats();
            wx.showToast({ title: '导入成功', icon: 'success' });
          } else {
            wx.showToast({ title: '无导出数据', icon: 'none' });
          }
        }
      }
    });
  },

  clearData() {
    wx.showModal({
      title: '清空数据',
      content: '删除所有小条和文章，不可恢复，确定吗？',
      success: (res) => {
        if (res.confirm) {
          db.clearAllData();
          this.loadStats();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  openCategoryManage() {
    this.setData({ showCategoryManage: true });
  },

  closeCategoryManage() {
    this.setData({ showCategoryManage: false });
  },

  addCategory() {
    this.setData({
      showCategoryModal: true,
      editCategoryName: '',
      editCategoryIndex: -1
    });
  },

  editCategory(e) {
    const index = e.currentTarget.dataset.index;
    const name = this.data.categories[index];
    this.setData({
      showCategoryModal: true,
      editCategoryName: name,
      editCategoryIndex: index
    });
  },

  saveCategory() {
    const name = this.data.editCategoryName.trim();
    if (!name) {
      wx.showToast({ title: '名称不能为空', icon: 'none' });
      return;
    }
    const index = this.data.editCategoryIndex;
    if (index >= 0) {
      db.updateCategory(this.data.categories[index], name);
    } else {
      db.addCategory(name);
    }
    this.setData({
      showCategoryModal: false,
      editCategoryName: '',
      editCategoryIndex: -1
    });
    this.loadConfig();
  },

  cancelCategoryModal() {
    this.setData({
      showCategoryModal: false,
      editCategoryName: '',
      editCategoryIndex: -1
    });
  },

  onCategoryNameInput(e) {
    this.setData({ editCategoryName: e.detail.value });
  },

  deleteCategory(e) {
    const index = e.currentTarget.dataset.index;
    const name = this.data.categories[index];
    if (DEFAULT_CATEGORIES.includes(name)) {
      wx.showToast({ title: '默认分类不可删除', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '删除分类',
      content: `确定删除"${name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          db.deleteCategory(name);
          this.loadConfig();
        }
      }
    });
  },

  openStyleManage() {
    this.setData({ showStyleManage: true });
  },

  closeStyleManage() {
    this.setData({ showStyleManage: false });
  },

  addStyle() {
    this.setData({
      showStyleModal: true,
      editStyleName: '',
      editStylePrompt: '',
      editStyleIndex: -1
    });
  },

  editStyle(e) {
    const index = e.currentTarget.dataset.index;
    const style = this.data.aiStyles[index];
    this.setData({
      showStyleModal: true,
      editStyleName: style.name,
      editStylePrompt: style.prompt,
      editStyleIndex: index
    });
  },

  saveStyle() {
    const { editStyleName, editStylePrompt, editStyleIndex } = this.data;
    if (!editStyleName.trim()) {
      wx.showToast({ title: '名称不能为空', icon: 'none' });
      return;
    }
    if (!editStylePrompt.trim()) {
      wx.showToast({ title: '提示词不能为空', icon: 'none' });
      return;
    }
    const newStyle = {
      name: editStyleName.trim(),
      prompt: editStylePrompt.trim()
    };
    if (editStyleIndex >= 0) {
      const style = this.data.aiStyles[editStyleIndex];
      if (!style.isDefault) {
        db.updateAiStyle(style.id, newStyle);
      } else {
        wx.showToast({ title: '默认风格不可修改', icon: 'none' });
        return;
      }
    } else {
      db.addAiStyle(newStyle);
    }
    this.setData({
      showStyleModal: false,
      editStyleName: '',
      editStylePrompt: '',
      editStyleIndex: -1
    });
    this.loadConfig();
  },

  cancelStyleModal() {
    this.setData({
      showStyleModal: false,
      editStyleName: '',
      editStylePrompt: '',
      editStyleIndex: -1
    });
  },

  onStyleNameInput(e) {
    this.setData({ editStyleName: e.detail.value });
  },

  onStylePromptInput(e) {
    this.setData({ editStylePrompt: e.detail.value });
  },

  deleteStyle(e) {
    const index = e.currentTarget.dataset.index;
    const style = this.data.aiStyles[index];
    if (style.isDefault) {
      wx.showToast({ title: '默认风格不可删除', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '删除风格',
      content: `确定删除"${style.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          db.deleteAiStyle(style.id);
          this.loadConfig();
        }
      }
    });
  }
});