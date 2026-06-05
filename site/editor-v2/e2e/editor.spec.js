import { test, expect } from '@playwright/test';

test.describe('编辑器基本操作', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待 React Flow 渲染
    await page.waitForSelector('.react-flow__renderer', { timeout: 15000 });
    // 关闭空状态引导（点击画布空白处或点击关闭按钮）
    // 空状态引导覆盖了整个画布，阻止右键菜单和点击操作
    const emptyGuide = page.locator('button:has-text("开始使用")');
    if (await emptyGuide.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emptyGuide.click();
      await page.waitForTimeout(300);
    }
  });

  test('页面加载后显示输出节点和工具栏', async ({ page }) => {
    // 检查 React Flow 节点已渲染
    await expect(page.locator('.react-flow__node')).toBeVisible();
    // 检查拖拽面板中的输出按钮
    await expect(page.locator('text=📤 输出').first()).toBeVisible();
    // 检查顶栏文字（用 first 避免匹配到空状态引导中的文字）
    await expect(page.locator('text=Node Editor').first()).toBeVisible();
    // 检查节点数显示
    await expect(page.locator('text=个节点')).toBeVisible();
  });

  test('拖拽区域有色块和文字节点按钮', async ({ page }) => {
    await expect(page.locator('text=🎨 色块').first()).toBeVisible();
    await expect(page.locator('text=📝 文字').first()).toBeVisible();
    await expect(page.locator('text=🔘 按钮').first()).toBeVisible();
    await expect(page.locator('text=📤 输出').first()).toBeVisible();
  });

  test('右键菜单弹出', async ({ page }) => {
    // 在画布空白区域右键
    const canvas = page.locator('.react-flow');
    await canvas.click({ button: 'right', position: { x: 200, y: 200 } });
    // 等待右键菜单出现
    await page.waitForTimeout(300);
    await expect(page.locator('text=基础组件').first()).toBeVisible();
    await expect(page.locator('text=布局 & 结构').first()).toBeVisible();
    await expect(page.locator('text=变换 & 特效').first()).toBeVisible();
    await expect(page.locator('text=工具 & 全局').first()).toBeVisible();
  });

  test('通过 Store 添加节点后画布节点数增加', async ({ page }) => {
    const initialCount = await page.evaluate(() => {
      return window.StoreV2?.getState()?.nodes?.length || 0;
    });

    // 通过 Store API 添加一个色块节点
    await page.evaluate(() => {
      const rf = window.StoreV2;
      if (!rf) return;
      const state = rf.getState();
      const nodes = [...(state.nodes || [])];
      nodes.push({
        id: 'e2e-test-node',
        type: 'colorBlock',
        position: { x: 150, y: 200 },
        data: {
          id: 'e2e-test-node',
          properties: { color: '#FF6600', width: 320, height: 120, borderRadius: 12, opacity: 100 },
          onChange: () => {},
        },
      });
      rf.setState({ nodes });
    });

    await page.waitForTimeout(500);
    const newCount = await page.evaluate(() => window.StoreV2?.getState()?.nodes?.length || 0);
    expect(newCount).toBe(initialCount + 1);
  });

  test('页面不崩溃 — 验证 React Flow 渲染正常', async ({ page }) => {
    // 验证 React Flow 的核心元素
    await expect(page.locator('.react-flow__renderer')).toBeVisible();
    // 验证 MiniMap 存在
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
    // 验证 Controls 存在
    await expect(page.locator('.react-flow__controls')).toBeVisible();
    // 没有报错信息
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Error:');
    expect(bodyText).not.toContain('error');
  });
});
