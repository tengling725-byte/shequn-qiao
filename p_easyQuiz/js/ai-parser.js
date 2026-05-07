const AIAnalyzer = {
  async parseQuizWithAI(content, filename) {
    try {
      const data = await API.parseWithAI(content, filename);
      return data;
    } catch (error) {
      throw new Error(error.message || 'AI解析失败');
    }
  }
};