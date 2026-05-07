Page({
  data: {
    mode: 'daily', // daily or custom
    date: '',
    categories: ['全部', '生活记事', '工作记事', '点子', '待办'],
    selectedCategory: '全部',
    notes: [],
    selectedNotes: [],
    isComposing: false,
    isPolishing: false,
    composedContent: '',
    composedTitle: '',
    showResult: false
  },

  onLoad() {
    const now = new Date();
    const dateStr = this.formatDate(now);
    this.setData({ date: dateStr });
    this.loadNotes();
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode, selectedNotes: [] });
    this.loadNotes();
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value, selectedNotes: [] });
    this.loadNotes();
  },

  onCategoryChange(e) {
    this.setData({
      selectedCategory: this.data.categories[e.detail.value],
      selectedNotes: []
    });
    this.loadNotes();
  },

  loadNotes() {
    const db = require('../../utils/database.js');
    let notes = [];

    if (this.data.mode === 'daily') {
      notes = db.getNotesByDate(this.data.date);
    } else {
      notes = db.getNotes();
      if (this.data.selectedCategory !== '全部') {
        notes = notes.filter(n => n.category === this.data.selectedCategory);
      }
    }

    this.setData({ notes: notes.map(n => ({ ...n, checked: false })) });
  },

  toggleNote(e) {
    const idx = e.currentTarget.dataset.index;
    const notes = this.data.notes;
    notes[idx].checked = !notes[idx].checked;

    const selectedNotes = notes.filter(n => n.checked).map(n => n.id);
    this.setData({ notes, selectedNotes });
  },

  selectAllNotes() {
    const notes = this.data.notes.map(n => ({ ...n, checked: true }));
    const selectedNotes = notes.filter(n => n.checked).map(n => n.id);
    this.setData({ notes, selectedNotes });
  },

  deselectAllNotes() {
    const notes = this.data.notes.map(n => ({ ...n, checked: false }));
    this.setData({ notes, selectedNotes: [] });
  },

  async composeArticle() {
    if (this.data.selectedNotes.length === 0) {
      wx.showToast({ title: '请选择小条', icon: 'none' });
      return;
    }

    this.setData({ isComposing: true });
    wx.showLoading({ title: 'AI合成中...' });

    try {
      const weather = await this.getWeather();
      const db = require('../../utils/database.js');
      const selectedNotes = this.data.notes.filter(n => n.checked);
      const content = selectedNotes.map(n => n.content).join('\n');

      const polishedContent = await this.composeWithAI(content, selectedNotes);
      const title = this.generateTitle(polishedContent);

      const articleData = {
        title,
        content: polishedContent,
        noteIds: this.data.selectedNotes,
        date: this.data.date,
        weather,
        images: selectedNotes.flatMap(n => n.images || []),
        videos: selectedNotes.flatMap(n => n.videos || [])
      };

      db.addArticle(articleData);
      this.setData({
        isComposing: false,
        showResult: true,
        composedTitle: title,
        composedContent: polishedContent
      });
      wx.hideLoading();
    } catch (err) {
      this.setData({ isComposing: false });
      wx.hideLoading();
      wx.showToast({ title: '合成失败', icon: 'none' });
      console.error(err);
    }
  },

  async getWeather() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('晴 20°C');
      }, 300);
    });
  },

  async composeWithAI(content, notes) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dateStr = this.data.date.replace(/-/g, '年').replace(/(\d{2})/, '$1月').replace(/(\d{2})$/, '$1日');
        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekDay = weekDays[new Date(this.data.date).getDay()];
        
        let result = `${dateStr} ${weekDay} 晴\n\n`;
        result += content;
        resolve(result);
      }, 1500);
    });
  },

  generateTitle(content) {
    const firstLine = content.split('\n')[0];
    return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine;
  },

  goToArticle() {
    const db = require('../../utils/database.js');
    const articles = db.getArticles();
    const latestArticle = articles[0];
    if (latestArticle) {
      wx.navigateTo({
        url: `/pages/article/article?id=${latestArticle.id}`
      });
    }
  },

  resetCompose() {
    this.setData({
      selectedNotes: [],
      showResult: false,
      composedContent: '',
      composedTitle: ''
    });
    this.loadNotes();
  }
});