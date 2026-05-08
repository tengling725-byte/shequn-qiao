import { describe, it, expect } from 'vitest';

// parser.js 导出 { TagBasedParser, QuizParser }
const { QuizParser, TagBasedParser } = require('../js/parser.js');

describe('QuizParser', () => {
  describe('单选题', () => {
    it('应该解析标准格式的单选题', () => {
      const content = [
        '1. Git中暂存区的概念是什么？',
        'A. 修改后直接提交的区域',
        'B. 临时存放修改的区域',
        'C. 只读区域',
        'D. 已删除区域',
        '',
        '答案：B'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe('single');
      expect(result.questions[0].correctAnswerIds).toEqual([1]);
      const correctOpt = result.questions[0].options.find(o => o.id === result.questions[0].correctAnswerIds[0]);
      expect(correctOpt.text).toContain('临时存放修改的区域');
    });

    it('应该解析 A/B/C/D 格式的选项', () => {
      const content = [
        '1. JavaScript 中 typeof null 的结果是？',
        'A. null',
        'B. undefined',
        'C. object',
        'D. number',
        '',
        '答案：C'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('single');
      expect(result.questions[0].correctAnswerIds).toEqual([2]);
    });
  });

  describe('多选题', () => {
    it('应该解析 BC 格式的多选题', () => {
      const content = [
        '1. 以下哪些是Git操作？',
        'A. commit',
        'B. push',
        'C. pull',
        'D. delete',
        '',
        '答案：BC'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('multiple');
      expect(result.questions[0].correctAnswerIds).toEqual([1, 2]);
    });

    it('应该解析多字母答案 ABC', () => {
      const content = [
        '1. 以下哪些是原始数据类型？',
        'A. String',
        'B. Number',
        'C. Boolean',
        'D. Object',
        '',
        '答案：ABC'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('multiple');
      expect(result.questions[0].correctAnswerIds).toEqual([0, 1, 2]);
    });
  });

  describe('判断题', () => {
    it('应该解析"正确"为正确', () => {
      const content = [
        '1. Git是分布式版本控制系统。',
        '',
        '答案：正确'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('true_false');
      expect(result.questions[0].correctAnswerIds).toEqual([0]);
      expect(result.questions[0].options[0].text).toBe('正确');
    });

    it('应该解析"错误"为错误', () => {
      const content = [
        '1. Git只能用于代码管理。',
        '',
        '答案：错误'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('true_false');
      expect(result.questions[0].correctAnswerIds).toEqual([1]);
      expect(result.questions[0].options[1].text).toBe('错误');
    });

    it('应该解析"不正确"为错误', () => {
      const content = [
        '1. JavaScript 是强类型语言。',
        '',
        '答案：不正确'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('true_false');
      // "不正确" 映射到 "错误"
      expect(result.questions[0].correctAnswerIds).toEqual([1]);
    });

    it('应该解析"对"为正确', () => {
      const content = [
        '1. HTML 是标记语言。',
        '',
        '对'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('true_false');
      expect(result.questions[0].correctAnswerIds).toEqual([0]);
    });

    it('应该解析"错"为错误', () => {
      const content = [
        '1. CSS 是编程语言。',
        '',
        '答案：错'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions[0].type).toBe('true_false');
      expect(result.questions[0].correctAnswerIds).toEqual([1]);
    });
  });

  describe('Markdown 格式', () => {
    it('应该解析 Markdown 粗体答案 **答案：A**', () => {
      const content = [
        '## 题目 1',
        'Git中 git log 的作用是？',
        '',
        'A. 查看历史提交',
        'B. 查看当前状态',
        'C. 查看分支',
        'D. 查看配置',
        '',
        '**答案：A**'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.md');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe('single');
      expect(result.questions[0].correctAnswerIds).toEqual([0]);
    });

    it('应该解析 ## 题目 标记的 MD 文件', () => {
      const content = [
        '## 题目 1',
        'CSS 中盒模型包含哪些部分？',
        '',
        '- A. content',
        '- B. padding',
        '- C. border',
        '- D. margin',
        '',
        '**答案：D**'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.md');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].options).toHaveLength(4);
    });
  });

  describe('JSON 格式', () => {
    it('应该解析 JSON 格式的题库文件', () => {
      const quiz = {
        title: '测试题库',
        questions: [
          { type: 'single', content: '1+1=?', options: [
            { id: 0, text: '1', isCorrect: false },
            { id: 1, text: '2', isCorrect: true },
            { id: 2, text: '3', isCorrect: false },
            { id: 3, text: '4', isCorrect: false }
          ]},
          { type: 'multiple', content: '哪些是数字？', options: [
            { id: 0, text: '1', isCorrect: true },
            { id: 1, text: 'A', isCorrect: false },
            { id: 2, text: '3', isCorrect: true }
          ]},
          { type: 'true_false', content: '地球是圆的', answer: '正确' }
        ]
      };
      const content = JSON.stringify(quiz);

      const result = QuizParser.parse(content, 'test.json');
      expect(result.questions).toHaveLength(3);
      expect(result.questions[0].type).toBe('single');
      expect(result.questions[1].type).toBe('multiple');
      expect(result.questions[2].type).toBe('true_false');
    });

    it('应该自动检测粘贴的 JSON 内容（无 .json 扩展名）', () => {
      const quiz = {
        title: '粘贴题库',
        questions: [
          { type: 'single', content: '题目1', options: [
            { id: 0, text: 'A', isCorrect: true },
            { id: 1, text: 'B', isCorrect: false }
          ]}
        ]
      };
      const content = JSON.stringify(quiz);

      const result = QuizParser.parse(content, 'input.txt');
      expect(result.questions).toHaveLength(1);
    });
  });

  describe('边界情况', () => {
    it('空内容应返回 needsAI', () => {
      const result = QuizParser.parse('', 'test.txt');
      expect(result.needsAI).toBe(true);
    });

    it('无答案标记的题目应返回 needsAI', () => {
      const content = [
        '1. 这是一个问题？',
        'A. 选项1',
        'B. 选项2',
        'C. 选项3',
        'D. 选项4'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.needsAI).toBe(true);
    });

    it('题目不足5题时 checkQuizData 返回 needsAI', () => {
      const content = [
        '1. 只有一道题',
        'A. 选项1',
        'B. 选项2',
        '',
        '答案：A'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions).toHaveLength(1);
      const checkResult = QuizParser.checkQuizData(result, content, 'test.txt');
      expect(checkResult.needsAI).toBe(true);
    });
  });

  describe('多题解析', () => {
    it('应该正确解析多道题目', () => {
      const content = [
        '1. 第一题？',
        'A. 选项A',
        'B. 选项B',
        'C. 选项C',
        'D. 选项D',
        '答案：A',
        '',
        '2. 第二题？',
        'A. 选项A',
        'B. 选项B',
        'C. 选项C',
        'D. 选项D',
        '答案：C',
        '',
        '3. 第三题？',
        '正确'
      ].join('\n');

      const result = QuizParser.parse(content, 'test.txt');
      expect(result.questions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
