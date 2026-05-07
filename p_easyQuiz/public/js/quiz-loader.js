const QuizLoader = {
  cache: {},

  async loadConfig() {
    try {
      const res = await fetch('js/题库/quiz-config.json');
      return await res.json();
    } catch (e) {
      console.error('Failed to load quiz config:', e);
      return null;
    }
  },

  async loadQuiz(file) {
    if (this.cache[file]) {
      return this.cache[file];
    }
    try {
      const res = await fetch('js/题库/' + file);
      const data = await res.json();
      this.cache[file] = data;
      return data;
    } catch (e) {
      console.error('Failed to load quiz:', file, e);
      return null;
    }
  },

  async loadAll() {
    const config = await this.loadConfig();
    if (!config) return [];

    const quizzes = [];
    for (const item of config) {
      const data = await this.loadQuiz(item.file);
      if (data) {
        data.title = data.title || data.name || item.name;
        quizzes.push({
          name: item.name,
          data: data,
          questions: item.questions
        });
      }
    }
    return quizzes;
  }
};