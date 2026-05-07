const QuizStorage = {
  KEYS: {
    HISTORY: 'quiz_history',
    ERRORS: 'quiz_errors',
    CUSTOM: 'quiz_custom'
  },

  async getHistory() {
    try {
      const data = await API.getHistory();
      return data.history || [];
    } catch {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    }
  },

  async addHistory(record) {
    try {
      await API.saveHistory(record);
    } catch {
      const history = await this.getHistory();
      history.unshift({
        ...record,
        id: Date.now(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
    }
  },

  async getErrors() {
    try {
      const data = await API.getErrors();
      return data.errors || [];
    } catch {
      const data = localStorage.getItem(this.KEYS.ERRORS);
      return data ? JSON.parse(data) : [];
    }
  },

  async addErrors(question, userAnswer, isCorrect) {
    if (isCorrect) return;

    try {
      await API.saveError(question);
    } catch {
      let errors = await this.getErrors();
      const exists = errors.find(e => e.id === question.id);
      if (exists) {
        exists.wrongCount = (exists.wrongCount || 0) + 1;
        exists.lastWrong = new Date().toISOString();
      } else {
        errors.unshift({
          ...question,
          wrongCount: 1,
          lastWrong: new Date().toISOString()
        });
      }
      localStorage.setItem(this.KEYS.ERRORS, JSON.stringify(errors.slice(0, 200)));
    }
  },

  async removeError(id) {
    try {
      await API.removeError(id);
    } catch {
      let errors = await this.getErrors().filter(e => e.id !== id);
      localStorage.setItem(this.KEYS.ERRORS, JSON.stringify(errors));
    }
  },

  async getCustom() {
    try {
      const data = await API.getQuizzes();
      return data.quizzes || [];
    } catch {
      const data = localStorage.getItem(this.KEYS.CUSTOM);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveCustom(name, data) {
    try {
      await API.saveQuiz(name, data);
    } catch {
      let custom = await this.getCustom();
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
    try {
      const quizzes = await API.getQuizzes();
      const quiz = quizzes.find(q => q.name === name);
      if (quiz) {
        await API.deleteQuiz(quiz.id);
      }
    } catch {
      let custom = await this.getCustom().filter(c => c.name !== name);
      localStorage.setItem(this.KEYS.CUSTOM, JSON.stringify(custom));
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizStorage;
}