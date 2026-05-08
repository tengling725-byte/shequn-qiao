import { test, expect } from '@playwright/test';

// test-quiz.json 在项目根目录，测试运行在项目根目录
const TEST_QUIZ_PATH = 'test-quiz.json';

test.describe('答题流程', () => {
  test.beforeEach(async ({ page }) => {
    // 拦截所有 alert，自动关闭
    page.on('dialog', async dialog => await dialog.accept());

    await page.goto('/');

    // 确保从干净状态开始（清除 localStorage）
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  // ===== 上传题库 =====

  test('上传 JSON 题库文件并添加到列表', async ({ page }) => {
    // 上传文件
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles(TEST_QUIZ_PATH);

    // 等待题库名称出现在自定义题库列表（标题被重写为 "题库_test-quiz_日期" 格式）
    await expect(page.getByText(/题库_test-quiz/).last()).toBeVisible({ timeout: 5000 });

    // 验证下拉框中出现自定义题库
    const select = page.locator('[data-testid="quiz-select"]');
    await expect(select).toContainText('题库_test-quiz');
  });

  // ===== 粘贴题库 =====

  test('粘贴题库内容并添加', async ({ page }) => {
    const pasteContent = JSON.stringify({
      title: '粘贴测试题库',
      questions: [
        { id: 'q-1', type: 'single', content: '题目1', options: [{ id: 0, text: 'A', isCorrect: true }, { id: 1, text: 'B', isCorrect: false }], explanation: '' },
        { id: 'q-2', type: 'single', content: '题目2', options: [{ id: 0, text: 'A', isCorrect: false }, { id: 1, text: 'B', isCorrect: true }], explanation: '' },
        { id: 'q-3', type: 'single', content: '题目3', options: [{ id: 0, text: 'A', isCorrect: true }, { id: 1, text: 'B', isCorrect: false }], explanation: '' },
        { id: 'q-4', type: 'single', content: '题目4', options: [{ id: 0, text: 'A', isCorrect: false }, { id: 1, text: 'B', isCorrect: true }], explanation: '' },
        { id: 'q-5', type: 'true_false', content: '题目5', options: [], correctIndex: [0], explanation: '' }
      ]
    });

    await page.click('[data-testid="paste-btn"]');
    await page.waitForSelector('#pasteModal[style*="flex"]', { timeout: 3000 }).catch(() => {});
    await page.fill('[data-testid="paste-textarea"]', pasteContent);
    await page.click('[data-testid="paste-submit"]');

    await expect(page.getByText(/题库_粘贴/).last()).toBeVisible({ timeout: 5000 });
  });

  // ===== 完整答题流程 =====

  test('完整流程：上传 → 选择 → 考试模式 → 答题 → 查看结果', async ({ page }) => {
    // 1. 上传题库
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles(TEST_QUIZ_PATH);
    await expect(page.getByText(/题库_test-quiz/).last()).toBeVisible({ timeout: 5000 });

    // 2. 从下拉框选择刚上传的题库
    const select = page.locator('[data-testid="quiz-select"]');
    await select.selectOption({ value: 'custom:0' });

    // 3. 点击开始答题
    await page.click('[data-testid="start-quiz"]');

    // 4. 等待 setup 页面出现
    await expect(page.locator('h1')).toContainText('题库_test-quiz', { timeout: 5000 });

    // 5. 设置考试模式
    await page.click('[data-testid="mode-exam"]');

    // 6. 选择"全部"题目（第4个按钮）
    const countButtons = page.locator('.btn-group .btn');
    const allBtn = countButtons.last();
    await allBtn.click();

    // 7. 开始答题
    await page.click('[data-testid="start-btn"]');

    // 8. 遍历答题（题目顺序可能随机，根据题型选择不同的选项）
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[data-testid="option-0"]', { timeout: 5000 });
      const typeText = await page.locator('.question-type').textContent();
      if (typeText.includes('多选')) {
        await page.click('[data-testid="option-1"]');
        await page.click('[data-testid="option-2"]');
      } else {
        await page.click('[data-testid="option-0"]');
      }
      if (i < 4) {
        await page.click('[data-testid="next-btn"]');
      }
    }

    // 最后一题，按钮变成"提交"
    await page.click('[data-testid="next-btn"]');

    // 13. 验证结果页面
    await expect(page.locator('h1')).toContainText('答题完成', { timeout: 5000 });
    await expect(page.locator('.score-card')).toBeVisible();

    // 验证逐题解析出现
    const analysisItems = page.locator('.analysis-item');
    const count = await analysisItems.count();
    expect(count).toBe(5);
  });

  // ===== 游戏模式得分 =====

  test('游戏模式：显示得分元素', async ({ page }) => {
    // 上传题库并选择
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles(TEST_QUIZ_PATH);
    await expect(page.getByText(/题库_test-quiz/).last()).toBeVisible({ timeout: 5000 });

    await page.locator('[data-testid="quiz-select"]').selectOption({ value: 'custom:0' });
    await page.click('[data-testid="start-quiz"]');
    await expect(page.locator('h1')).toContainText('题库_test-quiz', { timeout: 5000 });

    // 选择游戏模式
    await page.click('[data-testid="mode-game"]');

    // 选"全部"
    await page.locator('.btn-group .btn').last().click();

    await page.click('[data-testid="start-btn"]');

    // 答第一题（选项可能被随机打乱，所以分数不确定）
    await page.waitForSelector('[data-testid="option-0"]', { timeout: 5000 });
    await page.click('[data-testid="option-0"]');

    // 验证得分元素显示
    await expect(page.locator('.score')).toBeVisible();
    const scoreText = await page.locator('.score').textContent();
    expect(scoreText).toMatch(/得分: \d+/);
  });

  // ===== 题型类型显示 =====

  test('各题型显示正确的标签：单选、多选、判断', async ({ page }) => {
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles(TEST_QUIZ_PATH);
    await expect(page.getByText(/题库_test-quiz/).last()).toBeVisible({ timeout: 5000 });

    await page.locator('[data-testid="quiz-select"]').selectOption({ value: 'custom:0' });
    await page.click('[data-testid="start-quiz"]');
    await expect(page.locator('h1')).toContainText('题库_test-quiz', { timeout: 5000 });
    await page.locator('.btn-group .btn').last().click();
    await page.click('[data-testid="start-btn"]');

    // 遍历所有题目，收集出现的题型标签（题目顺序可能被随机打乱）
    const typesSeen = new Set();
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[data-testid="option-0"]', { timeout: 5000 });
      const typeText = await page.locator('.question-type').textContent();
      typesSeen.add(typeText.trim());
      if (i < 4) await page.click('[data-testid="next-btn"]');
    }

    expect(typesSeen.has('（单选）')).toBeTruthy();
    expect(typesSeen.has('（多选）')).toBeTruthy();
    expect(typesSeen.has('（判断）')).toBeTruthy();
  });
});
