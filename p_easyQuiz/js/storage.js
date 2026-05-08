const QuizStorage = {
  KEYS: {
    HISTORY: 'quiz_history',
    ERRORS: 'quiz_errors',
    CUSTOM: 'quiz_custom'
  },

  // 判断是否已登录（由 api.js 的 Auth 模块提供）
  _isLoggedIn() {
    return !!(typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn());
  },

  // --- 历史记录 ---

  async getHistory() {
    if (this._isLoggedIn()) {
      const data = await API.getHistory();
      return data.history || [];
    }
    // 未登录：不记录本地历史
    return [];
  },

  async addHistory(record) {
    if (this._isLoggedIn()) {
      await API.saveHistory(record);
    }
    // 未登录：不写入任何存储
  },

  // --- 错题本 ---

  async getErrors() {
    if (this._isLoggedIn()) {
      const data = await API.getErrors();
      return data.errors || [];
    }
    // 未登录：不记录错题
    return [];
  },

  async addErrors(question, userAnswer, isCorrect) {
    if (isCorrect) return;
    if (this._isLoggedIn()) {
      await API.saveError(question);
    }
    // 未登录：不写入
  },

  async removeError(id) {
    if (this._isLoggedIn()) {
      await API.removeError(id);
    }
    // 未登录：错题本为空，直接返回
  },

  // --- 自定义题库 ---

  async getCustom() {
    if (this._isLoggedIn()) {
      const data = await API.getQuizzes();
      return data.quizzes || [];
    }
    // 未登录：从 localStorage 读
    const local = localStorage.getItem(this.KEYS.CUSTOM);
    return local ? JSON.parse(local) : [];
  },

  // 获取本地题库（已登录时用于"导入本地题库"功能）
  getCustomLocal() {
    const local = localStorage.getItem(this.KEYS.CUSTOM);
    return local ? JSON.parse(local) : [];
  },

  async saveCustom(name, data) {
    if (this._isLoggedIn()) {
      await API.saveQuiz(name, data);
    } else {
      const custom = await this.getCustom();
      const existing = custom.findIndex(c => c.name === name);
      if (existing >= 0) {
        custom[existing] = { name, data, savedAt: new Date().toISOString() };
      } else {
        custom.push({ name, data, savedAt: new Date().toISOString() });
      }
      localStorage.setItem(this.KEYS.CUSTOM, JSON.stringify(custom));
    }
  },

  async deleteCustom(name) {
    if (this._isLoggedIn()) {
      const quizzes = await API.getQuizzes();
      const quiz = quizzes.find(q => q.name === name);
      if (quiz) {
        await API.deleteQuiz(quiz.id);
      }
    } else {
      const custom = (await this.getCustom()).filter(c => c.name !== name);
      localStorage.setItem(this.KEYS.CUSTOM, JSON.stringify(custom));
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizStorage;
}
