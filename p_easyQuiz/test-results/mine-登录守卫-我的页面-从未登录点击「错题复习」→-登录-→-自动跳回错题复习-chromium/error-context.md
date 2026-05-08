# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mine.spec.js >> 登录守卫 + 我的页面 >> 从未登录点击「错题复习」→ 登录 → 自动跳回错题复习
- Location: tests\mine.spec.js:130:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('.page.errors') to be visible

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "EasyQuiz" [level=1] [ref=e5]
  - paragraph [ref=e6]: 选择题库开始答题
  - generic [ref=e7]:
    - combobox [ref=e8] [cursor=pointer]:
      - option "-- 请选择题库 --" [selected]
      - option "JS基础(kimi)(30题)"
      - option "JS基础(元宝)(10题)"
      - option "JS基础(deepseek)(20题)"
      - option "JS核心语法(豆包)(15题)"
    - button "开始答题" [ref=e9] [cursor=pointer]
    - button "上传题库" [ref=e10] [cursor=pointer]
    - button "粘贴题库" [ref=e11] [cursor=pointer]
  - generic [ref=e12]:
    - link "我的题库" [ref=e13] [cursor=pointer]:
      - /url: "#/my-quizzes"
    - link "历史记录" [ref=e14] [cursor=pointer]:
      - /url: "#/history"
    - link "错题复习" [ref=e15] [cursor=pointer]:
      - /url: "#/errors"
  - generic [ref=e16]:
    - text: MineTest (pw_mine_1778203089262@test.com)
    - button "登出" [ref=e17] [cursor=pointer]
```

# Test source

```ts
  38  |     await page.click('button:has-text("注册")');
  39  |     await page.waitForSelector('.user-info', { timeout: 10000 });
  40  |     await page.click('button:has-text("登出")');
  41  |     await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
  42  |     await page.close();
  43  |   });
  44  | 
  45  |   test.beforeEach(async ({ page }) => {
  46  |     page.on('dialog', async d => await d.accept());
  47  |     await page.goto('/');
  48  |     if (await page.isVisible('.user-info')) {
  49  |       await page.click('button:has-text("登出")');
  50  |       await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
  51  |     }
  52  |   });
  53  | 
  54  |   // ===== E2E-02/E2E-03: 未登录点击入口 → alert + 跳转登录页 =====
  55  | 
  56  |   test('未登录点击「我的题库」弹出提示并跳转登录页', async ({ page }) => {
  57  |     await page.click('a:has-text("我的题库")');
  58  | 
  59  |     // 登录守卫会弹出 alert
  60  |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  61  |     await expect(page.locator('h1')).toContainText('登录');
  62  |   });
  63  | 
  64  |   test('未登录点击「历史记录」弹出提示并跳转登录页', async ({ page }) => {
  65  |     await page.click('a:has-text("历史记录")');
  66  | 
  67  |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  68  |     await expect(page.locator('h1')).toContainText('登录');
  69  |   });
  70  | 
  71  |   test('未登录点击「错题复习」弹出提示并跳转登录页', async ({ page }) => {
  72  |     await page.click('a:has-text("错题复习")');
  73  | 
  74  |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  75  |     await expect(page.locator('h1')).toContainText('登录');
  76  |   });
  77  | 
  78  |   // ===== E2E-05: 直接 URL 访问 — 未登录直接访问 hash 路由 =====
  79  | 
  80  |   test('未登录直接访问 #/my-quizzes 重定向到登录页', async ({ page }) => {
  81  |     await page.goto('/#/my-quizzes');
  82  |     await page.waitForTimeout(2000);
  83  | 
  84  |     await expect(page.locator('h1')).toContainText('登录');
  85  |   });
  86  | 
  87  |   test('未登录直接访问 #/history 重定向到登录页', async ({ page }) => {
  88  |     await page.goto('/#/history');
  89  |     await page.waitForTimeout(2000);
  90  | 
  91  |     await expect(page.locator('h1')).toContainText('登录');
  92  |   });
  93  | 
  94  |   test('未登录直接访问 #/errors 重定向到登录页', async ({ page }) => {
  95  |     await page.goto('/#/errors');
  96  |     await page.waitForTimeout(2000);
  97  | 
  98  |     await expect(page.locator('h1')).toContainText('登录');
  99  |   });
  100 | 
  101 |   // ===== E2E-06: 登录成功后回跳到目标页面 =====
  102 | 
  103 |   test('从未登录点击「我的题库」→ 登录 → 自动跳回我的题库', async ({ page }) => {
  104 |     // 点击我的题库触发守卫
  105 |     await page.click('a:has-text("我的题库")');
  106 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  107 | 
  108 |     // 登录
  109 |     await page.fill('#loginEmail', TEST_EMAIL);
  110 |     await page.fill('#loginPassword', TEST_PASSWORD);
  111 |     await page.click('button:has-text("登录")');
  112 | 
  113 |     // 验证自动跳回我的题库
  114 |     await page.waitForSelector('.page.my-quizzes', { timeout: 10000 });
  115 |     await expect(page.locator('h1')).toContainText('我的题库');
  116 |   });
  117 | 
  118 |   test('从未登录点击「历史记录」→ 登录 → 自动跳回历史记录', async ({ page }) => {
  119 |     await page.click('a:has-text("历史记录")');
  120 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  121 | 
  122 |     await page.fill('#loginEmail', TEST_EMAIL);
  123 |     await page.fill('#loginPassword', TEST_PASSWORD);
  124 |     await page.click('button:has-text("登录")');
  125 | 
  126 |     await page.waitForSelector('.page.history', { timeout: 10000 });
  127 |     await expect(page.locator('h1')).toContainText('历史记录');
  128 |   });
  129 | 
  130 |   test('从未登录点击「错题复习」→ 登录 → 自动跳回错题复习', async ({ page }) => {
  131 |     await page.click('a:has-text("错题复习")');
  132 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  133 | 
  134 |     await page.fill('#loginEmail', TEST_EMAIL);
  135 |     await page.fill('#loginPassword', TEST_PASSWORD);
  136 |     await page.click('button:has-text("登录")');
  137 | 
> 138 |     await page.waitForSelector('.page.errors', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  139 |     await expect(page.locator('h1')).toContainText('错题复习');
  140 |   });
  141 | 
  142 |   // ===== E2E-04: 登出后守卫恢复 =====
  143 | 
  144 |   test('登录 → 我的题库 → 登出 → 点击历史记录再次触发守卫', async ({ page }) => {
  145 |     // 登录
  146 |     await page.click('a:has-text("登录")');
  147 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  148 |     await page.fill('#loginEmail', TEST_EMAIL);
  149 |     await page.fill('#loginPassword', TEST_PASSWORD);
  150 |     await page.click('button:has-text("登录")');
  151 |     await page.waitForSelector('.user-info', { timeout: 10000 });
  152 | 
  153 |     // 进入我的题库（应该能直接访问）
  154 |     await page.click('a:has-text("我的题库")');
  155 |     await page.waitForSelector('.page.my-quizzes', { timeout: 5000 });
  156 |     await expect(page.locator('h1')).toContainText('我的题库');
  157 | 
  158 |     // 返回首页（登出按钮在首页导航栏）
  159 |     await page.click('a:has-text("返回首页")');
  160 |     await page.waitForSelector('.user-info', { timeout: 5000 });
  161 | 
  162 |     // 登出
  163 |     await page.click('button:has-text("登出")');
  164 |     await page.waitForSelector('a:has-text("登录")', { timeout: 5000 });
  165 | 
  166 |     // 再次点击历史记录 → 触发守卫
  167 |     await page.click('a:has-text("历史记录")');
  168 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  169 |     await expect(page.locator('h1')).toContainText('登录');
  170 |   });
  171 | 
  172 |   // ===== E2E-08: 空状态 UI =====
  173 | 
  174 |   test('新用户我的题库显示空状态引导', async ({ page }) => {
  175 |     // 登录
  176 |     await page.click('a:has-text("登录")');
  177 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  178 |     await page.fill('#loginEmail', TEST_EMAIL);
  179 |     await page.fill('#loginPassword', TEST_PASSWORD);
  180 |     await page.click('button:has-text("登录")');
  181 |     await page.waitForSelector('.user-info', { timeout: 10000 });
  182 | 
  183 |     // 进入我的题库
  184 |     await page.click('a:has-text("我的题库")');
  185 |     await page.waitForSelector('.page.my-quizzes', { timeout: 5000 });
  186 | 
  187 |     // 验证空状态（新注册用户没有题库）
  188 |     const emptyText = await page.locator('.empty').textContent();
  189 |     expect(emptyText).toContain('暂无');
  190 |   });
  191 | 
  192 |   test('新用户历史记录显示空状态', async ({ page }) => {
  193 |     await page.click('a:has-text("登录")');
  194 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  195 |     await page.fill('#loginEmail', TEST_EMAIL);
  196 |     await page.fill('#loginPassword', TEST_PASSWORD);
  197 |     await page.click('button:has-text("登录")');
  198 |     await page.waitForSelector('.user-info', { timeout: 10000 });
  199 | 
  200 |     await page.click('a:has-text("历史记录")');
  201 |     await page.waitForSelector('.page.history', { timeout: 5000 });
  202 | 
  203 |     const emptyText = await page.locator('.empty').textContent();
  204 |     expect(emptyText).toContain('暂无记录');
  205 |   });
  206 | 
  207 |   test('新用户错题本显示空状态', async ({ page }) => {
  208 |     await page.click('a:has-text("登录")');
  209 |     await page.waitForSelector('#loginEmail', { timeout: 5000 });
  210 |     await page.fill('#loginEmail', TEST_EMAIL);
  211 |     await page.fill('#loginPassword', TEST_PASSWORD);
  212 |     await page.click('button:has-text("登录")');
  213 |     await page.waitForSelector('.user-info', { timeout: 10000 });
  214 | 
  215 |     await page.click('a:has-text("错题复习")');
  216 |     await page.waitForSelector('.page.errors', { timeout: 5000 });
  217 | 
  218 |     const emptyText = await page.locator('.empty').textContent();
  219 |     expect(emptyText).toContain('暂无错题');
  220 |   });
  221 | });
  222 | 
```