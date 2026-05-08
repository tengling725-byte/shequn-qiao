import { test, expect } from '@playwright/test';

const TEST_EMAIL = `pw_mine_${Date.now()}@test.com`;
const TEST_PASSWORD = 'test123456';
const TEST_USERNAME = 'MineTest';

test.describe('登录守卫 + 我的页面', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    page.on('dialog', async d => await d.accept());

    await page.goto('/');

    // 尝试登录看账号是否已存在
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);

    const loggedIn = await page.isVisible('.user-info');
    if (loggedIn) {
      await page.click('button:has-text("登出")');
      await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
      await page.close();
      return;
    }

    // 注册新账号
    await page.goto('/');
    await page.click('a:has-text("注册")');
    await page.waitForSelector('#regUsername', { timeout: 5000 });
    await page.fill('#regUsername', TEST_USERNAME);
    await page.fill('#regEmail', TEST_EMAIL);
    await page.fill('#regPassword', TEST_PASSWORD);
    await page.fill('#regConfirmPassword', TEST_PASSWORD);
    await page.click('button:has-text("注册")');
    await page.waitForSelector('.user-info', { timeout: 10000 });
    await page.click('button:has-text("登出")');
    await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    page.on('dialog', async d => await d.accept());
    await page.goto('/');
    if (await page.isVisible('.user-info')) {
      await page.click('button:has-text("登出")');
      await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
    }
  });

  // ===== E2E-02/E2E-03: 未登录点击入口 → alert + 跳转登录页 =====

  test('未登录点击「我的题库」弹出提示并跳转登录页', async ({ page }) => {
    await page.click('a:has-text("我的题库")');

    // 登录守卫会弹出 alert
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('登录');
  });

  test('未登录点击「历史记录」弹出提示并跳转登录页', async ({ page }) => {
    await page.click('a:has-text("历史记录")');

    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('登录');
  });

  test('未登录点击「错题复习」弹出提示并跳转登录页', async ({ page }) => {
    await page.click('a:has-text("错题复习")');

    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('登录');
  });

  // ===== E2E-05: 直接 URL 访问 — 未登录直接访问 hash 路由 =====

  test('未登录直接访问 #/my-quizzes 重定向到登录页', async ({ page }) => {
    await page.goto('/#/my-quizzes');
    await page.waitForTimeout(2000);

    await expect(page.locator('h1')).toContainText('登录');
  });

  test('未登录直接访问 #/history 重定向到登录页', async ({ page }) => {
    await page.goto('/#/history');
    await page.waitForTimeout(2000);

    await expect(page.locator('h1')).toContainText('登录');
  });

  test('未登录直接访问 #/errors 重定向到登录页', async ({ page }) => {
    await page.goto('/#/errors');
    await page.waitForTimeout(2000);

    await expect(page.locator('h1')).toContainText('登录');
  });

  // ===== E2E-06: 登录成功后回跳到目标页面 =====

  test('从未登录点击「我的题库」→ 登录 → 自动跳回我的题库', async ({ page }) => {
    // 点击我的题库触发守卫
    await page.click('a:has-text("我的题库")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    // 登录
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');

    // 验证自动跳回我的题库
    await page.waitForSelector('.page.my-quizzes', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('我的题库');
  });

  test('从未登录点击「历史记录」→ 登录 → 自动跳回历史记录', async ({ page }) => {
    await page.click('a:has-text("历史记录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');

    await page.waitForSelector('.page.history', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('历史记录');
  });

  test('从未登录点击「错题复习」→ 登录 → 自动跳回错题复习', async ({ page }) => {
    await page.click('a:has-text("错题复习")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');

    await page.waitForSelector('.page.errors', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('错题复习');
  });

  // ===== E2E-04: 登出后守卫恢复 =====

  test('登录 → 我的题库 → 登出 → 点击历史记录再次触发守卫', async ({ page }) => {
    // 登录
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');
    await page.waitForSelector('.user-info', { timeout: 10000 });

    // 进入我的题库（应该能直接访问）
    await page.click('a:has-text("我的题库")');
    await page.waitForSelector('.page.my-quizzes', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('我的题库');

    // 返回首页（登出按钮在首页导航栏）
    await page.click('a:has-text("返回首页")');
    await page.waitForSelector('.user-info', { timeout: 5000 });

    // 登出
    await page.click('button:has-text("登出")');
    await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });

    // 再次点击历史记录 → 触发守卫
    await page.click('a:has-text("历史记录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('登录');
  });

  // ===== E2E-08: 空状态 UI =====

  test('新用户我的题库显示空状态引导', async ({ page }) => {
    // 登录
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');
    await page.waitForSelector('.user-info', { timeout: 10000 });

    // 进入我的题库
    await page.click('a:has-text("我的题库")');
    await page.waitForSelector('.page.my-quizzes', { timeout: 5000 });

    // 验证空状态（新注册用户没有题库）
    const emptyText = await page.locator('.empty').textContent();
    expect(emptyText).toContain('暂无');
  });

  test('新用户历史记录显示空状态', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');
    await page.waitForSelector('.user-info', { timeout: 10000 });

    await page.click('a:has-text("历史记录")');
    await page.waitForSelector('.page.history', { timeout: 5000 });

    const emptyText = await page.locator('.empty').textContent();
    expect(emptyText).toContain('暂无记录');
  });

  test('新用户错题本显示空状态', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');
    await page.waitForSelector('.user-info', { timeout: 10000 });

    await page.click('a:has-text("错题复习")');
    await page.waitForSelector('.page.errors', { timeout: 5000 });

    const emptyText = await page.locator('.empty').textContent();
    expect(emptyText).toContain('暂无错题');
  });
});
