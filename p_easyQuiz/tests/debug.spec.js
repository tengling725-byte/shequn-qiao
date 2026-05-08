import { test } from '@playwright/test';

test('debug page load', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text());
  });

  await page.goto('https://47f0f4a8.easyquiz.pages.dev', { waitUntil: 'load', timeout: 10000 });
  await page.waitForTimeout(5000);

  console.log('PAGE ERRORS:', JSON.stringify(errors, null, 2));
  const bodyHTML = await page.evaluate(() => document.getElementById('app')?.innerHTML?.substring(0, 300) || 'EMPTY');
  console.log('APP DIV:', bodyHTML);
  console.log('Current URL:', page.url());
});
