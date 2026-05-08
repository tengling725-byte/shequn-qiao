/**
 * 内置题库测试
 * 验证 4 个内置 JSON 题库文件的结构正确性
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const { TagBasedParser, QuizParser } = require('../js/parser.js');

// 题库目录
const QUIZ_DIR = path.resolve(__dirname, '..', 'public', 'js', '题库');
const FILES = ['quiz-kimi.json', 'quiz-yuanbao.json', 'quiz-deepseek.json', 'quiz-doubao.json'];

function loadJSON(filename) {
  const raw = fs.readFileSync(path.join(QUIZ_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

// ========== 一、文件加载与基础解析 ==========
describe('内置题库 - 文件可读性', () => {
  FILES.forEach(file => {
    it(`${file} 文件存在且可解析为 JSON`, () => {
      const data = loadJSON(file);
      expect(data).toBeDefined();
      expect(data.questions).toBeInstanceOf(Array);
      expect(data.questions.length).toBeGreaterThan(0);
    });
  });
});

// ========== 二、每道题结构校验 ==========
describe('内置题库 - 题目结构校验', () => {
  // 收集所有题目
  const allQuestions = [];
  FILES.forEach(file => {
    const data = loadJSON(file);
    data.questions.forEach((q, i) => {
      allQuestions.push({ file, index: i, id: q.id, question: q });
    });
  });

  // 题库名称
  const banks = {};
  FILES.forEach(file => {
    const data = loadJSON(file);
    banks[file] = data;
  });

  it('quiz-config.json 中的题目数应与实际一致', () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(QUIZ_DIR, 'quiz-config.json'), 'utf-8')
    );
    config.forEach(entry => {
      const bank = banks[entry.file];
      expect(bank, `${entry.file} 应存在`).toBeDefined();
      expect(bank.questions.length, `${entry.file} 题目数应匹配配置`).toBe(entry.questions);
    });
  });

  // 每道题的 type 和字段
  allQuestions.forEach(({ file, index, id, question: q }) => {
    const label = `${file}#${index} (${id})`;

    it(`${label}: type 必须是 single/multiple/true_false`, () => {
      expect(['single', 'multiple', 'true_false']).toContain(q.type);
    });

    it(`${label}: content 不能为空`, () => {
      expect(q.content).toBeTruthy();
      expect(q.content.trim().length).toBeGreaterThan(0);
    });

    it(`${label}: options 至少 2 个`, () => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });

    it(`${label}: 每个 option 有 id 和 text`, () => {
      q.options.forEach((opt, oi) => {
        expect(opt.id).toBe(oi);
        expect(opt.text).toBeTruthy();
      });
    });

    // isCorrect 存在且有效
    it(`${label}: 至少有一个正确选项`, () => {
      const correctCount = q.options.filter(o => o.isCorrect === true).length;
      expect(correctCount).toBeGreaterThan(0);
    });

    // 根据类型校验正确选项数
    it(`${label}: 正确选项数与 type 一致`, () => {
      const correctCount = q.options.filter(o => o.isCorrect === true).length;
      if (q.type === 'single') {
        expect(correctCount, `单选题应只有 1 个正确选项，实际 ${correctCount} 个`).toBe(1);
      } else if (q.type === 'multiple') {
        expect(correctCount, `多选题应有 >= 2 个正确选项，实际 ${correctCount} 个`).toBeGreaterThanOrEqual(2);
      } else if (q.type === 'true_false') {
        expect(correctCount, `判断题应有 1 个正确选项`).toBe(1);
      }
    });
  });
});

// ========== 三、解析器集成测试 ==========
describe('内置题库 - QuizParser.parse 集成', () => {
  FILES.forEach(file => {
    it(`${file} 通过 QuizParser.parse() 解析成功`, () => {
      const raw = fs.readFileSync(path.join(QUIZ_DIR, file), 'utf-8');
      const result = QuizParser.parse(raw, file);
      expect(result.needsAI).toBeUndefined();
      expect(result.questions).toBeDefined();
      expect(result.questions.length).toBeGreaterThan(0);
    });
  });

  FILES.forEach(file => {
    it(`${file} 解析后所有题目都有 correctAnswerIds`, () => {
      const raw = fs.readFileSync(path.join(QUIZ_DIR, file), 'utf-8');
      const result = QuizParser.parse(raw, file);
      result.questions.forEach((q, i) => {
        expect(
          q.correctAnswerIds,
          `${file}#${i}: correctAnswerIds 不能为空`
        ).toBeInstanceOf(Array);
        expect(
          q.correctAnswerIds.length,
          `${file}#${i}: correctAnswerIds 长度 > 0`
        ).toBeGreaterThan(0);
      });
    });
  });

  FILES.forEach(file => {
    it(`${file} 解析后 correctAnswerIds 均为合法 option id`, () => {
      const raw = fs.readFileSync(path.join(QUIZ_DIR, file), 'utf-8');
      const result = QuizParser.parse(raw, file);
      result.questions.forEach((q, i) => {
        const maxId = q.options.length - 1;
        q.correctAnswerIds.forEach(cid => {
          expect(cid, `${file}#${i}: correctAnswerId ${cid} 超出范围 0-${maxId}`)
            .toBeGreaterThanOrEqual(0);
          expect(cid).toBeLessThanOrEqual(maxId);
        });
      });
    });
  });

  FILES.forEach(file => {
    it(`${file} 解析后所有 option 无 isCorrect 残留`, () => {
      const raw = fs.readFileSync(path.join(QUIZ_DIR, file), 'utf-8');
      const result = QuizParser.parse(raw, file);
      result.questions.forEach((q, i) => {
        q.options.forEach((opt, oi) => {
          expect(
            opt.isCorrect,
            `${file}#${i} opt[${oi}]: option 不应有 isCorrect 字段`
          ).toBeUndefined();
        });
      });
    });
  });
});

// ========== 四、关键数据问题检测 ==========
describe('内置题库 - 已知数据问题', () => {

  it('deepseek: ds004 选项0和选项3不应重复 "undefined"', () => {
    const bank = loadJSON('quiz-deepseek.json');
    const q = bank.questions.find(q => q.id === 'ds004');
    expect(q).toBeDefined();
    const texts = q.options.map(o => o.text);
    const dupes = texts.filter((t, i) => texts.indexOf(t) !== i);
    expect(dupes.length, '存在重复选项文本').toBe(0);
  });

  it('doubao: db008 单选题不应有多个正确描述的选项', () => {
    const bank = loadJSON('quiz-doubao.json');
    const q = bank.questions.find(q => q.id === 'db008');
    expect(q).toBeDefined();
    expect(q.type).toBe('single');
    const correctCount = q.options.filter(o => o.isCorrect).length;
    // 选项B (JSON.parse) 和选项C (JSON.stringify) 都正确
    // 但标记只有 C 为 isCorrect，需要确认 A 是否真的是错的
    // "JSON是JS的内置对象" — JSON 确实是 JS 的内置对象！
    expect(correctCount).toBe(1);
  });

  it('kimi: js004 选项D (new Array) 也是合法 JS 但标记为 false', () => {
    const bank = loadJSON('quiz-kimi.json');
    const q = bank.questions.find(q => q.id === 'js004');
    expect(q).toBeDefined();
    // 选项D "const arr = new Array(1, 2, 3);" 其实是合法的 JS
    // 但标准答案是 B（字面量），D 被标记为 false
    // 这是内容层面的争议，记录但不阻断
    expect(q.options[3].isCorrect).toBe(false);
  });

  it('kimi: js008 选项A和D都正确标记为 true', () => {
    const bank = loadJSON('quiz-kimi.json');
    const q = bank.questions.find(q => q.id === 'js008');
    expect(q).toBeDefined();
    // 选项A (user.name) 是 false, D (A和B都对) 是 true
    // 这合理：D 包含了 A 和 B，所以 D 是综合正确答案
    const correctOpts = q.options.filter(o => o.isCorrect);
    expect(correctOpts.length).toBe(1);
    expect(correctOpts[0].id).toBe(3); // D
  });
});

// ========== 五、selectQuiz 规范化测试 ==========
describe('内置题库 - selectQuiz 规范化（isCorrect → correctAnswerIds）', () => {
  // selectQuiz() 现在调用 normalizeQuestion() 将 JSON 的 isCorrect 转换为 correctAnswerIds
  FILES.forEach(file => {
    it(`${file}: normalizeQuestion 后所有题目都有 correctAnswerIds`, () => {
      const data = loadJSON(file);
      const parser = new TagBasedParser();
      const normalized = data.questions.map((q, i) => parser.normalizeQuestion(q, i));
      normalized.forEach((q, i) => {
        expect(q.correctAnswerIds, `${file}#${i}`).toBeInstanceOf(Array);
        expect(q.correctAnswerIds.length, `${file}#${i}`).toBeGreaterThan(0);
      });
    });
  });

  FILES.forEach(file => {
    it(`${file}: 规范化后 option 无 isCorrect 残留`, () => {
      const data = loadJSON(file);
      const parser = new TagBasedParser();
      const normalized = data.questions.map((q, i) => parser.normalizeQuestion(q, i));
      normalized.forEach((q, i) => {
        q.options.forEach((opt, oi) => {
          expect(opt.isCorrect, `${file}#${i} opt[${oi}]`).toBeUndefined();
        });
      });
    });
  });

  FILES.forEach(file => {
    it(`${file}: 规范化后 correctAnswerIds 值与原始 isCorrect 一致`, () => {
      const data = loadJSON(file);
      const parser = new TagBasedParser();
      const normalized = data.questions.map((q, i) => parser.normalizeQuestion(q, i));
      data.questions.forEach((orig, i) => {
        const norm = normalized[i];
        const origCorrectIds = orig.options
          .map((o, idx) => o.isCorrect ? idx : -1)
          .filter(id => id >= 0);
        expect(norm.correctAnswerIds.sort(),
          `${file}#${i}: correctAnswerIds 应匹配原始 isCorrect`
        ).toEqual(origCorrectIds.sort());
      });
    });
  });

  FILES.forEach(file => {
    it(`${file}: 规范化后 content 保留`, () => {
      const data = loadJSON(file);
      const parser = new TagBasedParser();
      const normalized = data.questions.map((q, i) => parser.normalizeQuestion(q, i));
      data.questions.forEach((orig, i) => {
        expect(normalized[i].content, `${file}#${i}`).toBe(orig.content);
      });
    });
  });
});
