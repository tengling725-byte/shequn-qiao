import { describe, it, expect } from 'vitest';

const { TagBasedParser, QuizParser } = require('../js/parser.js');

function parse(text) {
  return new TagBasedParser().parse(text, 'test.txt');
}

// ========== 一、繁简转换测试 (TC-01 ~ TC-07) ==========
describe('TagBasedParser - 繁简转换', () => {
  it('TC-01: 繁体「題目：」应正确解析', () => {
    const result = parse('題目：什麼是 Git？\nA. 版本控制\nB. 文件管理\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('什麼是 Git？');
  });

  it('TC-02: 繁体「第2題」应正确解析', () => {
    const result = parse('第2題 什麼是分支？\nA. 主分支\nB. 特性分支\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('什麼是分支？');
  });

  it('TC-03: 繁体「正確答案：」应正确解析', () => {
    const result = parse('題目：測試題\nA. 選項A\nB. 選項B\n正確答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].type).toBe('single');
    expect(result.questions[0].correctAnswerIds).toEqual([0]);
  });

  it('TC-04: 繁体「錯誤」独立行应识别为判断题答案', () => {
    const result = parse('題目：這是一個錯誤的陳述？\n錯誤');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].type).toBe('true_false');
    expect(result.questions[0].correctAnswerIds).toEqual([1]);
    expect(result.questions[0].options[1].text).toBe('错误');
  });

  it('TC-05: 繁体「解析：」应正确识别', () => {
    const result = parse('題目：測試題\nA. 選項\n正確答案：A\n解析：這是一個測試');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].explanation).toBe('這是一個測試');
  });

  it('TC-06: 繁简混合 — 标签简体、内容繁体', () => {
    const result = parse('题目：什麼是 merge？\nA. 合并\nB. 拆分\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('什麼是 merge？');
  });

  it('TC-07: 繁简混合 — 标签繁体、内容简体', () => {
    const result = parse('題目：什么是 rebase？\nA. 变基\nB. 合并\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('什么是 rebase？');
  });
});

// ========== 二、软标签测试 (TC-08 ~ TC-14) ==========
describe('TagBasedParser - 软标签', () => {
  it('TC-08: 「题1」格式', () => {
    const result = parse('题1 Git 是什么？\nA. 工具\nB. 语言\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('Git 是什么？');
  });

  it('TC-09: 「題2」繁体软标签', () => {
    const result = parse('題2 Git 的作用？\nA. 版本控制\nB. 文件同步\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('Git 的作用？');
  });

  it('TC-10: 「第3题」格式', () => {
    const result = parse('第3题 什么是暂存区？\nA. 工作区\nB. 暂存区\n正确答案：B');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('什么是暂存区？');
  });

  it('TC-11: 「第4題」繁体软标签', () => {
    const result = parse('第4題 什么是提交？\nA. commit\nB. push\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('什么是提交？');
  });

  it('TC-12: 「题目5」格式（显式标签优先，body 含编号）', () => {
    // 「题目」是显式 QUESTION 标签，在软标签之前匹配
    // extractBody 返回 "5 分支的作用？"
    const result = parse('题目5 分支的作用？\nA. 分支A\nB. 分支B\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toContain('分支的作用？');
  });

  it('TC-13: 「No.6」英文序号', () => {
    const result = parse('No.6 如何回滚？\nA. git reset\nB. git push\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('如何回滚？');
  });

  it('TC-14: 「1题」数字前缀格式', () => {
    const result = parse('1题 题干内容\nA. 选项A\nB. 选项B\n正确答案：A');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toBe('题干内容');
  });
});

// ========== 三、选项格式测试 (TC-15 ~ TC-21) ==========
describe('TagBasedParser - 选项格式', () => {
  const optionCases = [
    ['TC-15: A. 点号', 'A. 选项一', 'A', '选项一'],
    ['TC-16: A、顿号', 'A、选项一', 'A', '选项一'],
    ['TC-17: A) 括号', 'A) 选项一', 'A', '选项一'],
    ['TC-18: （A）中文括号', '（A）选项一', 'A', '选项一'],
    ['TC-19: (A) 英文括号', '(A) 选项一', 'A', '选项一'],
    ['TC-20: 【A】方头括号', '【A】选项一', 'A', '选项一'],
    ['TC-21: A 空格分隔', 'A 选项一', 'A', '选项一'],
  ];

  optionCases.forEach(([name, line, expectedCode, expectedText]) => {
    it(name, () => {
      const result = parse(`题目：测试题\n${line}\n正确答案：A`);
      expect(result.questions).toHaveLength(1);
      const opt = result.questions[0].options[0];
      expect(opt.code).toBe(expectedCode);
      expect(opt.text).toBe(expectedText);
    });
  });
});

// ========== 四、多行内容测试 (TC-22 ~ TC-24) ==========
describe('TagBasedParser - 多行内容', () => {
  it('TC-22: 题干跨多行', () => {
    const result = parse([
      '题1 这是第一行题干',
      '还有第二行内容',
      '继续第三行说明',
      'A. 选项A',
      'B. 选项B',
      '正确答案：A'
    ].join('\n'));
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].content).toContain('第一行题干');
    expect(result.questions[0].content).toContain('第二行内容');
    expect(result.questions[0].content).toContain('第三行说明');
  });

  it('TC-23: 解析跨多行', () => {
    const result = parse([
      '题1 测试题',
      'A. 选项A',
      '正确答案：A',
      '解析：这是第一行解析',
      '继续解析第二行'
    ].join('\n'));
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].explanation).toContain('第一行解析');
    expect(result.questions[0].explanation).toContain('第二行');
  });

  it('TC-24: 选项跨多行（逐行解析）', () => {
    const result = parse([
      '题1 测试题',
      'A. 选项A',
      'B. 选项B',
      'C. 选项C',
      'D. 选项D',
      '正确答案：C'
    ].join('\n'));
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options).toHaveLength(4);
    expect(result.questions[0].options[0].code).toBe('A');
    expect(result.questions[0].options[3].code).toBe('D');
  });
});

// ========== 五、乱序后答案同步测试 (TC-25 ~ TC-27) ==========
describe('TagBasedParser - 乱序后答案同步', () => {
  it('TC-25: 单选题乱序后正确答案文本不变', () => {
    const parser = new TagBasedParser();
    const result = parser.parse([
      '题目：测试题',
      'A. 选项A',
      'B. 选项B',
      'C. 选项C',
      '正确答案：B'
    ].join('\n'), 'test.txt');
    const shuffled = parser.shuffleOptions(result.questions[0]);
    const correctOpt = shuffled.options.find(o => shuffled.correctAnswerIds.includes(o.id));
    expect(correctOpt).toBeDefined();
    expect(correctOpt.text).toBe('选项B');
  });

  it('TC-26: 多选题乱序后所有正确答案文本不变', () => {
    const parser = new TagBasedParser();
    const result = parser.parse([
      '题目：多选题',
      'A. 选项A',
      'B. 选项B',
      'C. 选项C',
      'D. 选项D',
      '正确答案：ABD'
    ].join('\n'), 'test.txt');
    const shuffled = parser.shuffleOptions(result.questions[0]);
    const correctTexts = shuffled.options
      .filter(o => shuffled.correctAnswerIds.includes(o.id))
      .map(o => o.text)
      .sort();
    expect(correctTexts).toEqual(['选项A', '选项B', '选项D']);
  });

  it('TC-27: 判断题乱序后正确/错误标识不变', () => {
    const parser = new TagBasedParser();
    const result = parser.parse([
      '题目：判断题',
      '错误'
    ].join('\n'), 'test.txt');
    // 判断题选项是固定的「正确」「错误」
    const shuffled = parser.shuffleOptions(result.questions[0]);
    const correctOpt = shuffled.options.find(o => shuffled.correctAnswerIds.includes(o.id));
    expect(correctOpt.text).toBe('错误');
    const wrongOpt = shuffled.options.find(o => !shuffled.correctAnswerIds.includes(o.id));
    expect(wrongOpt.text).toBe('正确');
  });
});

// ========== 六、边界条件测试 (TC-28 ~ TC-32) ==========
describe('TagBasedParser - 边界条件', () => {
  it('TC-28: 空内容应返回 needsAI', () => {
    const result = QuizParser.parse('', 'test.txt');
    expect(result.needsAI).toBe(true);
  });

  it('TC-29: 只有题干、无选项和答案 → QuizParser 返回 needsAI', () => {
    const result = QuizParser.parse('1. 这是一个没有选项和答案的问题', 'test.txt');
    expect(result.needsAI).toBe(true);
  });

  it('TC-30: 只有选项、无题干 → QuizParser 返回 needsAI', () => {
    const result = QuizParser.parse('A. 选项A\nB. 选项B\nC. 选项C\n正确答案：A', 'test.txt');
    expect(result.needsAI).toBe(true);
  });

  it('TC-31: 重复标签取最后一个', () => {
    const result = parse([
      '题目：测试题',
      'A. 选项A',
      'B. 选项B',
      '正确答案：A',
      '正确答案：B'
    ].join('\n'));
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].correctAnswerIds).toEqual([1]);
    const correctOpt = result.questions[0].options[1];
    expect(correctOpt.code).toBe('B');
  });

  it('TC-32: 未知标签行不影响解析', () => {
    const result = parse([
      '题目：测试题',
      'A. 选项A',
      'B. 选项B',
      '这是一行无关内容',
      '难度：简单',
      '正确答案：A'
    ].join('\n'));
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options).toHaveLength(2);
    expect(result.questions[0].correctAnswerIds).toEqual([0]);
    const correctOpt = result.questions[0].options[0];
    expect(correctOpt.code).toBe('A');
  });
});

// ========== 七、综合测试 (TC-33) ==========
describe('TagBasedParser - 综合测试', () => {
  it('TC-33: 混合格式题库（单选+多选+判断+繁简混合）', () => {
    const result = parse([
      '题库：Git 综合测试',
      '',
      '题1 Git 是什么类型的系统？',
      'A. 分布式版本控制系统',
      'B. 集中式版本控制系统',
      'C. 文件同步工具',
      '正确答案：A',
      '',
      '2、以下哪些是 Git 命令？（多选）',
      'A. commit',
      'B. push',
      'C. delete',
      'D. clone',
      '正确答案：ABD',
      '',
      '題3 Git 只能用于代码管理。',
      'A. 正确',
      'B. 錯誤',
      '正确答案：错误'
    ].join('\n'));

    expect(result.questions).toHaveLength(3);

    // 第1题：单选题，答案 A
    const q1 = result.questions[0];
    expect(q1.type).toBe('single');
    expect(q1.content).toBe('Git 是什么类型的系统？');
    expect(q1.correctAnswerIds).toEqual([0]);
    expect(q1.options[0].code).toBe('A');

    // 第2题：多选题，答案 A、B、D
    const q2 = result.questions[1];
    expect(q2.type).toBe('multiple');
    const correctCodes2 = q2.options.filter(o => q2.correctAnswerIds.includes(o.id)).map(o => o.code).sort();
    expect(correctCodes2).toEqual(['A', 'B', 'D']);

    // 第3题：判断题，答案「错误」
    const q3 = result.questions[2];
    expect(q3.type).toBe('true_false');
    expect(q3.correctAnswerIds).toEqual([1]);
    expect(q3.options[1].text).toBe('错误');
  });
});
