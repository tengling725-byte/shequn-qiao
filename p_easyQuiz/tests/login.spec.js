import { test, expect } from '@playwright/test';

const TEST_EMAIL = `pw_test_${Date.now()}@test.com`;
const TEST_PASSWORD = 'test123456';
const TEST_USERNAME = 'Playwright测试';

test.describe('登录功能', () => {
  test.beforeAll(async ({ browser }) => {
    // 注册测试账号（首次运行，后续如果已存在则忽略）
    const page = await browser.newPage();
    page.on('dialog', async d => await d.dismiss());

    await page.goto('/');

    // 先尝试登录，如果成功说明账号已存在，直接登出即可
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });
    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');

    // 等待响应
    await page.waitForTimeout(2000);

    // 检查是否登录成功（有 .user-info 说明账号已存在）
    const loggedIn = await page.isVisible('.user-info');
    if (loggedIn) {
      await page.click('button:has-text("登出")');
      await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
      await page.close();
      return;
    }

    // 登录失败，需要注册新账号
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
    // 每个测试前确保处于首页已登出状态
    await page.goto('/');
    // 如果已登录则登出
    if (await page.isVisible('.user-info')) {
      await page.click('button:has-text("登出")');
      await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
    }
  });

  // ===== 正常流程 =====

  test('正常登录 — 正确邮箱和密码跳转首页并显示用户名', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', TEST_PASSWORD);
    await page.click('button:has-text("登录")');

    await page.waitForSelector('.user-info', { timeout: 10000 });
    const userInfo = await page.textContent('.user-info');
    expect(userInfo).toContain(TEST_USERNAME);
    expect(userInfo).toContain('登出');
  });

  // ===== 异常流程 =====

  test('密码错误 — 提示"邮箱或密码错误"', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.fill('#loginEmail', TEST_EMAIL);
    await page.fill('#loginPassword', 'wrongpassword');

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.dismiss();
    });

    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);

    expect(alertMsg).toBe('邮箱或密码错误');
    // 验证仍在登录页
    await expect(page.locator('button:has-text("登录")').first()).toBeVisible();
  });

  test('空邮箱和密码提交 — 提示"请输入邮箱和密码"', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.dismiss();
    });

    await page.click('button:has-text("登录")');
    await page.waitForTimeout(1000);

    expect(alertMsg).toBe('请输入邮箱和密码');
  });

  test('只输入邮箱不输入密码 — 提示"请输入邮箱和密码"', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.fill('#loginEmail', TEST_EMAIL);

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.dismiss();
    });

    await page.click('button:has-text("登录")');
    await page.waitForTimeout(1000);

    expect(alertMsg).toBe('请输入邮箱和密码');
  });

  test('不存在的邮箱登录 — 提示"邮箱或密码错误"', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.fill('#loginEmail', 'noexist_' + Date.now() + '@test.com');
    await page.fill('#loginPassword', TEST_PASSWORD);

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.dismiss();
    });

    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);

    expect(alertMsg).toBe('邮箱或密码错误');
  });

  test('登录页可以切换到注册页', async ({ page }) => {
    await page.click('a:has-text("登录")');
    await page.waitForSelector('#loginEmail', { timeout: 5000 });

    await page.click('a:has-text("去注册")');

    await page.waitForSelector('#regUsername', { timeout: 5000 });
    const regBtn = await page.textContent('button:has-text("注册")');
    expect(regBtn).toBe('注册');
  });
});
