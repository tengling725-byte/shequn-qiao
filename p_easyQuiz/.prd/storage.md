好的，帮你提炼成**清晰、可执行的需求描述**，方便你后续自己实现或让AI帮你改代码。

---

## 需求名称：用户数据隔离 + 登录后云端优先

### 一、核心原则（一句话）

> **登录用户的数据只看云端，未登录用户的数据只看本地（不跨用户，不自动合并）。**

---

### 二、规则拆解

| 用户状态 | 数据来源 | 写入位置 | 说明 |
|---------|---------|---------|------|
| **已登录** | 只读云端 API | 仅写入云端 | 不读 localStorage，不降级到本地 |
| **未登录** | 只读 localStorage | 仅写入 localStorage | 不读云端，所有数据本地临时保存 |
| **登录后** | 不主动合并未登录时的本地数据 | — | **不做自动合并**（可选：用户手动导入） |
| **退出登录** | 清空前端 UI 数据 | — | 不清除本地 localStorage，下次未登录时可继续用 |

---

### 三、功能维度的具体行为

#### 我的题库

| 状态 | 行为 |
|------|------|
| 未登录 | 可查看/增删本地题库（存在 localStorage），提示“登录后可永久保存” |
| 已登录 | 查看/增删云端题库，不读本地 |
| 登录后 | 不自动导入本地题库（提供“导入本地题库”按钮让用户主动操作） |

#### 历史记录

| 状态 | 行为 |
|------|------|
| 未登录 | 不记录历史（或仅内存临时记录，不落盘），UI 提示“登录后开始记录” |
| 已登录 | 记录到云端，正常展示 |

#### 错题本

| 状态 | 行为 |
|------|------|
| 未登录 | 不记录错题，提示“登录后自动记录” |
| 已登录 | 记录到云端，正常展示 |

---

### 四、边界情况处理

| 场景 | 处理方式 |
|------|---------|
| 已登录 + 网络请求失败 | 显示“网络错误，请稍后重试”，**不清空 UI 数据**，**不写入 localStorage** |
| 未登录 + 调用 API | 前端直接拦截（不发送请求），提示“请先登录” |
| 登录过程中 Token 过期 | API 返回 401 → 跳到登录页，清空前端登录状态 |
| 已登录设备切换 | 数据完全从云端加载，不受另一设备影响 |

---

### 五、storage.js 需要改的地方（直接可执行）

```javascript
const QuizStorage = {
  // 新增：判断是否已登录
  _isLoggedIn() {
    return !!(Auth && Auth.isLoggedIn && Auth.isLoggedIn());
  },

  async getHistory() {
    if (this._isLoggedIn()) {
      // 已登录：只走云端
      const data = await API.getHistory();
      return data.history || [];
    }
    // 未登录：返回空数组（不记录本地历史）
    return [];
  },

  async addHistory(record) {
    if (this._isLoggedIn()) {
      await API.saveHistory(record);
    }
    // 未登录：什么都不做
  },

  async getErrors() {
    if (this._isLoggedIn()) {
      const data = await API.getErrors();
      return data.errors || [];
    }
    return [];
  },

  async addErrors(question, userAnswer, isCorrect) {
    if (isCorrect) return;
    if (this._isLoggedIn()) {
      await API.saveError(question);
    }
  },

  async getCustom() {
    if (this._isLoggedIn()) {
      const data = await API.getQuizzes();
      return data.quizzes || [];
    }
    // 未登录：从 localStorage 读（可选，如果你允许未登录试用）
    const local = localStorage.getItem('easyQuiz_custom');
    return local ? JSON.parse(local) : [];
  },

  async saveCustom(name, data) {
    if (this._isLoggedIn()) {
      await API.saveQuiz(name, data);
    } else {
      // 未登录：存本地
      const custom = await this.getCustom();
      custom.push({ name, data });
      localStorage.setItem('easyQuiz_custom', JSON.stringify(custom));
    }
  }
};
```

---

### 六、一句话总结需求

> **登录用户 = 云端专属读写；未登录用户 = 本地临时试用（不混淆、不自动合并）。**

这个需求提炼出来之后，你可以：
- 拿去和 Claude Code 对齐实现
- 作为测试用例的验收标准
- 以后扩展到多端同步时也不会乱