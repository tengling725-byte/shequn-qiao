import { describe, it, expect, vi, beforeEach } from 'vitest';

// 在 require storage.js 之前设置全局 mock
beforeEach(() => {
  vi.resetAllMocks();
});

// 辅助函数：模拟已登录
function mockLoggedIn() {
  global.Auth = { isLoggedIn: vi.fn(() => true) };
}

// 辅助函数：模拟未登录
function mockLoggedOut() {
  global.Auth = { isLoggedIn: vi.fn(() => false) };
}

describe('QuizStorage 用户隔离规则', () => {
  describe('getHistory', () => {
    it('[H-UT1] 已登录时只走云端，忽略 localStorage', async () => {
      mockLoggedIn();
      global.API = {
        getHistory: vi.fn().mockResolvedValue({ history: [{ id: 1 }] }),
        saveHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      const result = await QuizStorage.getHistory();
      expect(result).toEqual([{ id: 1 }]);
      expect(global.API.getHistory).toHaveBeenCalled();
    });

    it('[H-UT2] 未登录时返回空数组，不读 localStorage', async () => {
      mockLoggedOut();
      global.API = {
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      const result = await QuizStorage.getHistory();
      expect(result).toEqual([]);
      expect(global.API.getHistory).not.toHaveBeenCalled();
    });
  });

  describe('addHistory', () => {
    it('[H-UT3] 已登录时写入云端', async () => {
      mockLoggedIn();
      global.API = {
        saveHistory: vi.fn().mockResolvedValue({}),
        getHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.addHistory({ score: 100 });
      expect(global.API.saveHistory).toHaveBeenCalledWith({ score: 100 });
    });

    it('[H-UT4] 未登录时不写入任何存储', async () => {
      mockLoggedOut();
      global.API = {
        saveHistory: vi.fn(),
        getHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.addHistory({ score: 100 });
      expect(global.API.saveHistory).not.toHaveBeenCalled();
    });
  });

  describe('getErrors', () => {
    it('已登录时返回云端错题', async () => {
      mockLoggedIn();
      global.API = {
        getErrors: vi.fn().mockResolvedValue({ errors: [{ id: 'e1' }] }),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      const result = await QuizStorage.getErrors();
      expect(result).toEqual([{ id: 'e1' }]);
    });

    it('未登录时返回空数组', async () => {
      mockLoggedOut();
      global.API = {
        getErrors: vi.fn(),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      const result = await QuizStorage.getErrors();
      expect(result).toEqual([]);
    });
  });

  describe('addErrors', () => {
    it('已登录时答错存入云端', async () => {
      mockLoggedIn();
      global.API = {
        saveError: vi.fn().mockResolvedValue({}),
        getErrors: vi.fn(),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.addErrors({ id: 'q1' }, 'wrong', false);
      expect(global.API.saveError).toHaveBeenCalledWith({ id: 'q1' });
    });

    it('已登录时答对不存储', async () => {
      mockLoggedIn();
      global.API = {
        saveError: vi.fn(),
        getErrors: vi.fn(),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.addErrors({ id: 'q2' }, 'right', true);
      expect(global.API.saveError).not.toHaveBeenCalled();
    });

    it('未登录时答错也不写入', async () => {
      mockLoggedOut();
      global.API = {
        saveError: vi.fn(),
        getErrors: vi.fn(),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        removeError: vi.fn(),
        getQuizzes: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.addErrors({ id: 'q3' }, 'wrong', false);
      expect(global.API.saveError).not.toHaveBeenCalled();
    });
  });

  describe('getCustom / 题库', () => {
    it('[M-UT1] 已登录时只从云端取题库，忽略 localStorage', async () => {
      mockLoggedIn();
      global.API = {
        getQuizzes: vi.fn().mockResolvedValue({ quizzes: [{ name: '云端题库' }] }),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      const result = await QuizStorage.getCustom();
      expect(result[0].name).toBe('云端题库');
      expect(global.API.getQuizzes).toHaveBeenCalled();
    });

    it('[M-UT2] 未登录时从 localStorage 取题库', async () => {
      mockLoggedOut();
      global.localStorage = {
        getItem: vi.fn(() => JSON.stringify([{ name: '本地题库' }])),
      };
      global.API = {
        getQuizzes: vi.fn(),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        saveQuiz: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      const result = await QuizStorage.getCustom();
      expect(result[0].name).toBe('本地题库');
      expect(global.API.getQuizzes).not.toHaveBeenCalled();
    });

    it('已登录时 saveCustom 写入云端', async () => {
      mockLoggedIn();
      global.API = {
        saveQuiz: vi.fn().mockResolvedValue({}),
        getQuizzes: vi.fn().mockResolvedValue({ quizzes: [] }),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.saveCustom('新题库', { questions: [] });
      expect(global.API.saveQuiz).toHaveBeenCalled();
    });

    it('未登录时 saveCustom 写入 localStorage', async () => {
      mockLoggedOut();
      const setItemSpy = vi.fn();
      global.localStorage = {
        getItem: vi.fn(() => null),
        setItem: setItemSpy,
      };
      global.API = {
        saveQuiz: vi.fn(),
        getQuizzes: vi.fn(),
        getHistory: vi.fn(),
        saveHistory: vi.fn(),
        getErrors: vi.fn(),
        saveError: vi.fn(),
        removeError: vi.fn(),
        deleteQuiz: vi.fn(),
      };

      const QuizStorage = require('../public/js/storage.js');

      await QuizStorage.saveCustom('本地题库', { questions: [] });
      expect(global.API.saveQuiz).not.toHaveBeenCalled();
      expect(setItemSpy).toHaveBeenCalled();
    });
  });
});
