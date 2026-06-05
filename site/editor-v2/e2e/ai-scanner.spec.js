import { test, expect } from '@playwright/test';

test.describe('AI 扫描面板', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
  });

  test('打开 AI 扫描面板显示输入界面', async ({ page }) => {
    // 点击 AI 按钮打开扫描面板
    const aiBtn = page.locator('button:has-text("🤖")');
    await aiBtn.click();
    await page.waitForTimeout(500);

    // 验证面板出现
    await expect(page.locator('h2:has-text("AI 扫描")')).toBeVisible();

    // 验证 URL 输入框存在
    await expect(page.locator('input[placeholder*="URL"]')).toBeVisible();

    // 验证「扫描」按钮存在
    await expect(page.locator('button:has-text("扫描")')).toBeVisible();

    // 验证关闭操作
    await page.locator('button:has-text("✕")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('h2:has-text("AI 扫描")')).not.toBeVisible();
  });

  test('扫描完成后显示结果列表和添加按钮', async ({ page }) => {
    const aiBtn = page.locator('button:has-text("🤖")');
    await aiBtn.click();
    await page.waitForTimeout(500);

    // 输入 URL 并点击扫描
    await page.fill('input[placeholder*="URL"]', 'https://example.com');
    await page.click('button:has-text("扫描")');

    // 等待扫描完成（模拟 1.5s 延迟）
    await page.waitForTimeout(2000);

    // 验证状态变成"扫描完成"
    await expect(page.locator('text=扫描完成')).toBeVisible();

    // 验证"全部添加到画布"按钮可用
    const addAllBtn = page.locator('button:has-text("全部添加到画布")');
    await expect(addAllBtn).toBeEnabled();
  });

  test('关闭按钮关闭面板', async ({ page }) => {
    const aiBtn = page.locator('button:has-text("🤖")');
    await aiBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("AI 扫描")')).toBeVisible();

    // 点取消按钮
    await page.locator('button:has-text("取消")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('h2:has-text("AI 扫描")')).not.toBeVisible();
  });
});
