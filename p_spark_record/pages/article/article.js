Page({
  data: {
    article: null,
    articleId: null,
    isEdit: false,
    editContent: '',
    editTitle: ''
  },

  onLoad(options) {
    if (options.id) {
      this.loadArticle(options.id);
    }
  },

  loadArticle(id) {
    const db = require('../../utils/database.js');
    const article = db.getArticleById(id);
    if (article) {
      this.setData({
        article,
        articleId: id,
        editContent: article.content,
        editTitle: article.title
      });
    }
  },

  toggleEdit() {
    this.setData({ isEdit: !this.data.isEdit });
  },

  onTitleChange(e) {
    this.setData({ editTitle: e.detail.value });
  },

  onContentChange(e) {
    this.setData({ editContent: e.detail.value });
  },

  saveArticle() {
    const db = require('../../utils/database.js');
    db.updateArticle(this.data.articleId, {
      title: this.data.editTitle,
      content: this.data.editContent
    });
    wx.showToast({ title: '保存成功', icon: 'success' });
    this.setData({ isEdit: false });
    this.loadArticle(this.data.articleId);
  },

  deleteArticle() {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          const db = require('../../utils/database.js');
          db.deleteArticle(this.data.articleId);
          wx.navigateBack();
        }
      }
    });
  },

  copyContent() {
    wx.setClipboardData({
      data: this.data.article.content,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  shareArticle() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
});