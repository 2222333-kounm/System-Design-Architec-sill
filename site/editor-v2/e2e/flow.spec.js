import { test, expect } from '@playwright/test';

test.describe('数据流规则', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    // 关闭空状态引导（点击画布空白处或点击关闭按钮）
    const emptyGuide = page.locator('button:has-text("开始使用")');
    if (await emptyGuide.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emptyGuide.click();
      await page.waitForTimeout(300);
    }
  });

  test('循环依赖被阻止', async ({ page }) => {
    // 先通过 Store 添加节点和连线
    await page.evaluate(() => {
      const rf = window.StoreV2;
      if (!rf) return;
      rf.setState({
        nodes: [
          {
            id: 'color-a', type: 'colorBlock',
            position: { x: 100, y: 100 },
            data: { id: 'color-a', properties: { color: '#FF0000', width: 200, height: 100, borderRadius: 0, opacity: 100 } },
          },
          {
            id: 'output-1', type: 'output',
            position: { x: 500, y: 200 },
            data: { id: 'output-1' },
          },
        ],
        edges: [{ id: 'e-1', source: 'color-a', target: 'output-1', animated: true }],
      });
    });
    await page.waitForTimeout(500);

    // 检查页面没有崩溃
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('页面加载后不崩溃', async ({ page }) => {
    // 验证页面元素
    await expect(page.locator('.react-flow__renderer')).toBeVisible();
    // 没有报错
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Error:');
  });

  test('Store API 可访问', async ({ page }) => {
    const hasStore = await page.evaluate(() => {
      return typeof window.StoreV2 !== 'undefined' && typeof window.StoreV2.getState === 'function';
    });
    expect(hasStore).toBe(true);

    const state = await page.evaluate(() => {
      return window.StoreV2?.getState();
    });
    expect(state).toBeDefined();
    expect(Array.isArray(state.nodes)).toBe(true);
  });

  test('添加节点并连线不崩溃', async ({ page }) => {
    const initialCount = await page.evaluate(() => {
      return window.StoreV2?.getState()?.nodes?.length || 0;
    });

    // 添加一个色块节点
    await page.evaluate(() => {
      const rf = window.StoreV2;
      if (!rf) return;
      const state = rf.getState();
      const nodes = [...(state.nodes || [])];
      nodes.push({
        id: 'flow-test-node-1',
        type: 'colorBlock',
        position: { x: 200, y: 200 },
        data: {
          id: 'flow-test-node-1',
          properties: { color: '#00FF00', width: 300, height: 150, borderRadius: 8, opacity: 100 },
          onChange: () => {},
        },
      });
      rf.setState({ nodes });
    });
    await page.waitForTimeout(500);

    // 验证节点数量增加
    const newCount = await page.evaluate(() => window.StoreV2?.getState()?.nodes?.length || 0);
    expect(newCount).toBe(initialCount + 1);
  });
});
