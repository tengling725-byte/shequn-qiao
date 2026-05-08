const API = {
  baseUrl: 'https://easyquiz.tengling-725.workers.dev/api',

  async request(path, options = {}) {
    try {
      const response = await fetch(this.baseUrl + path, {
        credentials: 'include',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      // 401 全局拦截：登录接口的 401 是凭证错误，不触发未授权事件
      if (response.status === 401) {
        const data = await response.json();
        if (path === '/auth/login') {
          throw new Error(data.error || '邮箱或密码错误');
        }
        Auth._user = null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('unauthorized'));
        }
        throw new Error(data.error || '登录已过期，请重新登录');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  async register(username, email, password, confirmPassword) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, confirmPassword })
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

  async saveQuiz(name, data, contentHash) {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ name, data: JSON.stringify(data), content_hash: contentHash })
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
  _user: null,

  // 同步检查登录状态（供 storage.js 等模块使用）
  isLoggedIn() {
    return !!this._user;
  },

  async check() {
    try {
      const data = await API.me();
      this._user = data.user;
      return data.user;
    } catch {
      this._user = null;
      return null;
    }
  },

  async register(username, email, password, confirmPassword) {
    const data = await API.register(username, email, password, confirmPassword);
    this._user = data.user;
    return data.user;
  },

  async login(email, password) {
    const data = await API.login(email, password);
    this._user = data.user;
    return data.user;
  },

  async logout() {
    await API.logout();
    this._user = null;
  }
};
