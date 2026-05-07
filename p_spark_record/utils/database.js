const DB_NAME = 'spark_record_db';
const NOTES_TABLE = 'notes';
const ARTICLES_TABLE = 'articles';

const DEFAULT_CATEGORIES = ['生活记事', '工作记事', '点子', '待办'];

const DEFAULT_AI_STYLES = [
  { id: 'simple', name: '简明', prompt: '请把下面内容简洁润色，精简口语，保留原意，不要多余解释', isDefault: true },
  { id: 'spoken', name: '口语', prompt: '请把下面内容转换为自然口语表达，保持原意，通俗易懂', isDefault: true },
  { id: 'classical', name: '文言', prompt: '请把下面内容润色成文言文风格，古朴典雅，有文化底蕴', isDefault: true },
  { id: 'literary', name: '文艺', prompt: '请把下面内容润色得文艺优美，有文采，保持原意', isDefault: true },
  { id: 'formal', name: '正式', prompt: '请把下面内容润色得正式严谨，适合书面使用，得体规范', isDefault: true },
  { id: 'custom', name: '自定义', prompt: '', isDefault: true }
];

class Database {
  constructor() {
    this.db = null;
    this.config = null;
    this.init();
  }

  init() {
    try {
      this.db = wx.getStorageSync('db_data') || { notes: [], articles: [] };
      this.config = wx.getStorageSync('db_config') || {
        categories: [...DEFAULT_CATEGORIES],
        aiStyles: [...DEFAULT_AI_STYLES]
      };
    } catch (e) {
      this.db = { notes: [], articles: [] };
      this.config = {
        categories: [...DEFAULT_CATEGORIES],
        aiStyles: [...DEFAULT_AI_STYLES]
      };
    }
  }

  save() {
    try {
      wx.setStorageSync('db_data', this.db);
      wx.setStorageSync('db_config', this.config);
    } catch (e) {
      console.error('Database save error:', e);
    }
  }

  getCategories() {
    return this.config.categories || DEFAULT_CATEGORIES;
  }

  setCategories(categories) {
    this.config.categories = categories;
    this.save();
  }

  addCategory(name) {
    if (!this.config.categories.includes(name)) {
      this.config.categories.push(name);
      this.save();
    }
  }

  updateCategory(oldName, newName) {
    const index = this.config.categories.indexOf(oldName);
    if (index !== -1 && !DEFAULT_CATEGORIES.includes(oldName)) {
      this.config.categories[index] = newName;
      this.save();
    }
  }

  deleteCategory(name) {
    if (!DEFAULT_CATEGORIES.includes(name)) {
      const index = this.config.categories.indexOf(name);
      if (index !== -1) {
        this.config.categories.splice(index, 1);
        this.save();
      }
    }
  }

  getAiStyles() {
    return this.config.aiStyles || DEFAULT_AI_STYLES;
  }

  setAiStyles(aiStyles) {
    this.config.aiStyles = aiStyles;
    this.save();
  }

  addAiStyle(style) {
    const newStyle = {
      id: 'custom_' + Date.now(),
      name: style.name,
      prompt: style.prompt,
      isDefault: false
    };
    this.config.aiStyles.push(newStyle);
    this.save();
  }

  updateAiStyle(id, style) {
    const index = this.config.aiStyles.findIndex(s => s.id === id);
    if (index !== -1) {
      this.config.aiStyles[index] = { ...this.config.aiStyles[index], ...style };
      this.save();
    }
  }

  deleteAiStyle(id) {
    const index = this.config.aiStyles.findIndex(s => s.id === id);
    if (index !== -1 && !this.config.aiStyles[index].isDefault) {
      this.config.aiStyles.splice(index, 1);
      this.save();
    }
  }

  getNotes() {
    return this.db.notes || [];
  }

  addNote(note) {
    const noteData = {
      id: this.generateId(),
      content: note.content,
      title: note.title || '',
      category: note.category || '生活记事',
      tags: note.tags || [],
      images: note.images || [],
      videos: note.videos || [],
      audioPath: note.audioPath || '',
      audioText: note.audioText || '',
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiPolished: note.isAiPolished || false,
      aiStyle: note.aiStyle || ''
    };
    this.db.notes.unshift(noteData);
    this.save();
    return noteData;
  }

  updateNote(id, data) {
    const index = this.db.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.db.notes[index] = { ...this.db.notes[index], ...data, updatedAt: new Date().toISOString() };
      this.save();
      return this.db.notes[index];
    }
    return null;
  }

  deleteNote(id) {
    const index = this.db.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.db.notes.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  getNoteById(id) {
    return this.db.notes.find(n => n.id === id);
  }

  getArticles() {
    return this.db.articles || [];
  }

  addArticle(article) {
    const articleData = {
      id: this.generateId(),
      title: article.title || '',
      content: article.content || '',
      noteIds: article.noteIds || [],
      images: article.images || [],
      videos: article.videos || [],
      date: article.date || '',
      weather: article.weather || '',
      createdAt: article.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.db.articles.unshift(articleData);
    this.save();
    return articleData;
  }

  updateArticle(id, data) {
    const index = this.db.articles.findIndex(a => a.id === id);
    if (index !== -1) {
      this.db.articles[index] = { ...this.db.articles[index], ...data, updatedAt: new Date().toISOString() };
      this.save();
      return this.db.articles[index];
    }
    return null;
  }

  deleteArticle(id) {
    const index = this.db.articles.findIndex(a => a.id === id);
    if (index !== -1) {
      this.db.articles.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  getArticleById(id) {
    return this.db.articles.find(a => a.id === id);
  }

  getNotesByDate(date) {
    const targetDate = date.split('T')[0];
    return this.db.notes.filter(n => n.createdAt.split('T')[0] === targetDate);
  }

  getNotesByCategory(category) {
    return this.db.notes.filter(n => n.category === category);
  }

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  clearAllData() {
    this.db = { notes: [], articles: [] };
    this.config = {
      categories: [...DEFAULT_CATEGORIES],
      aiStyles: [...DEFAULT_AI_STYLES]
    };
    this.save();
  }

  resetConfig() {
    this.config = {
      categories: [...DEFAULT_CATEGORIES],
      aiStyles: [...DEFAULT_AI_STYLES]
    };
    this.save();
  }
}

module.exports = new Database();