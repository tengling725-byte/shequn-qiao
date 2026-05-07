const API = {
  baseUrl: '/api',
  
  async request(path, options = {}) {
    try {
      const response = await fetch(this.baseUrl + path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async register(email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },
  
  async me() {
    return this.request('/auth/me');
  },
  
  async getQuizzes() {
    return this.request('/quizzes');
  },
  
  async getQuiz(id) {
    return this.request(`/quizzes/?id=${id}`);
  },
  
  async saveQuiz(name, data) {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ name, data: JSON.stringify(data) })
    });
  },
  
  async deleteQuiz(id) {
    return this.request(`/quizzes/${id}`, { method: 'DELETE' });
  },
  
  async getHistory() {
    return this.request('/history');
  },
  
  async saveHistory(record) {
    return this.request('/history', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  },
  
  async getErrors() {
    return this.request('/errors');
  },
  
  async saveError(question) {
    return this.request('/errors', {
      method: 'POST',
      body: JSON.stringify(question)
    });
  },
  
  async removeError(questionId) {
    return this.request('/errors', {
      method: 'DELETE',
      body: JSON.stringify({ questionId })
    });
  },
  
  async parseWithAI(content, filename) {
    return this.request('/ai/parse', {
      method: 'POST',
      body: JSON.stringify({ content, filename })
    });
  }
};

const Auth = {
  async check() {
    try {
      const data = await API.me();
      return data.user;
    } catch {
      return null;
    }
  },
  
  async register(email, password) {
    const data = await API.register(email, password);
    return data.user;
  },
  
  async login(email, password) {
    const data = await API.login(email, password);
    return data.user;
  },
  
  async logout() {
    await API.logout();
  }
};