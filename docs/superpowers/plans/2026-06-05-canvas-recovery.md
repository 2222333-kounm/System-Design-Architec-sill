# 无限画布恢复 & Token 修复 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重新生成 `infinite-canvas-demo.html` 缺失的 7 个文件（6 JS + 1 CSS），并修复 `tokens.css` 中 4 个无效值和 2 个缺失变量。

**架构：**
- 7 个文件保持独立职责，按加载顺序形成依赖链
- Token 渲染通过 TokenStore（已有）读取 CSS 变量
- 编辑模式通过 URL 参数 `?mode=edit` 控制，不渲染用不到的 UI

**技术栈：** 纯前端 HTML + CSS + JS，无构建工具，无 npm 包

---

### Task 1: 修复 tokens.css 无效值 + 补 nav 变量

**Files:**
- Modify: `site/css/tokens.css`
- Modify: `site/css/tokens.json`（同步更新）

- [ ] **Step 1: 修复 tokens.css 中的 4 个无效值和 2 个缺失变量**

在 `:root {}` 区块中：

```css
  /* 修复前 */
  --spacing-lg: 39-44px;  /* 产品卡片上内边距 */
  --spacing-xl: 53-61px;  /* 大区块间距 */
  --spacing-2xl: 80-110px;  /* 页面顶级分区间距 */
  --breakpoint-xl: --;

  /* 修复后 */
  --spacing-lg: 44px;  /* 产品卡片上内边距 */
  --spacing-xl: 61px;  /* 大区块间距 */
  --spacing-2xl: 110px;  /* 页面顶级分区间距 */
  --breakpoint-xl: 1440px;
```

在 `:root {}` 区块末尾（圆角系统之后）添加 nav 变量：

```css
  /* ========================================
     13. 导航栏
     ======================================== */

  --nav-height: 44px;  /* 桌面导航栏高度 */
  --nav-height-mobile: 48px;  /* 移动端导航栏高度 */
```

- [ ] **Step 2: 同步更新 tokens.json**

读取 `site/css/tokens.json`，找到对应的 token 值条目并更新：
- `raw["--spacing-lg"].value`: `"39-44px"` → `"44px"`
- `raw["--spacing-xl"].value`: `"53-61px"` → `"61px"`
- `raw["--spacing-2xl"].value`: `"80-110px"` → `"110px"`
- `raw["--breakpoint-xl"].value`: `"--"` → `"1440px"`
- 新增 `raw["--nav-height"]` 和 `raw["--nav-height-mobile"]`（参考其他 token 的格式）
- 同样更新 `categorized` 下的对应条目

- [ ] **Step 3: 验证修复**

运行：`cd /c/Users/shanmu/Desktop/sill/site && node scripts/extract-tokens.js verify`

Expected: 输出"DESIGN.md 与 tokens.css 完全一致！"（允许 spacing 和 breakpoint 的"范围值"差异警告，但不应有缺失错误）

---

### Task 2: 创建 css/canvas-demo.css

**Files:**
- Create: `site/css/canvas-demo.css`

- [ ] **Step 1: 编写画布基础布局样式**

```css
/* ========================================
   无限画布浏览器 — 专有样式
   ======================================== */

/* ---- 画布全局 ---- */
html.canvas-demo, .canvas-demo body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  overflow: hidden;
  background: #1A1C23;
  font-family: var(--font-family-text), var(--font-family-cn), sans-serif;
}

.canvas-demo {
  --nav-height: 0px;
}

/* ---- 固定控制栏 ---- */
.canvas-controls {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 44px;
  z-index: 1000;
  background: rgba(22, 24, 30, 0.92);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ctrl-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #9CA3AF;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.ctrl-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #E2E8F0;
}

.ctrl-scale {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  color: #6B7280;
  min-width: 50px;
  text-align: center;
  font-family: monospace;
}

.ctrl-divider {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.08);
  margin: 0 4px;
}

.ctrl-link {
  color: #6B7280;
  text-decoration: none;
  font-size: 12px;
  margin-left: auto;
}
.ctrl-link:hover {
  color: #60A5FA;
}

/* ---- 编辑模式指示器 ---- */
.edit-mode-indicator {
  position: fixed;
  top: 48px; left: 8px;
  z-index: 1000;
  background: rgba(59,130,246,0.15);
  border: 1px solid rgba(59,130,246,0.2);
  color: #60A5FA;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
}

.edit-banner {
  position: fixed;
  top: 48px; left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  background: rgba(59,130,246,0.12);
  border: 1px solid rgba(59,130,246,0.2);
  color: #93C5FD;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 11px;
  backdrop-filter: blur(8px);
}

/* ---- 画布视口 ---- */
#canvas-viewport {
  position: fixed;
  top: 44px; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  cursor: grab;
}
#canvas-viewport:active {
  cursor: grabbing;
}

/* ---- 画布舞台 ---- */
#canvas-stage {
  position: absolute;
  top: 0; left: 0;
  transform-origin: 0 0;
  user-select: none;
  -webkit-user-select: none;
}

/* ---- 无限网格 ---- */
.canvas-grid {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ---- 画布内容 ---- */
.canvas-content {
  position: absolute;
  top: 0; left: 0;
}

.canvas-section {
  position: absolute;
  background: rgba(30, 33, 40, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 20px;
  color: #E2E8F0;
  min-width: 320px;
}

.canvas-section h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #F1F5F9;
}

.canvas-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #E2E8F0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.canvas-subtitle {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
  margin-bottom: 8px;
}

.note-text {
  font-size: 11px;
  color: #4B5563;
  margin-top: 10px;
}

/* ---- 色板 ---- */
.palette-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-family h4 {
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 6px;
}

.color-steps {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  position: relative;
  transition: transform 0.15s;
}
.color-swatch:hover {
  transform: scale(1.15);
  z-index: 2;
}
.color-swatch .swatch-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.9);
  color: #E2E8F0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
  white-space: nowrap;
  z-index: 10;
}
.color-swatch:hover .swatch-tooltip {
  display: block;
}

.semantic-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.semantic-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.semantic-swatch .swatch-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: transform 0.15s;
}
.semantic-swatch .swatch-box:hover {
  transform: scale(1.1);
  z-index: 2;
}
.semantic-swatch .swatch-label {
  font-size: 9px;
  color: #6B7280;
  text-align: center;
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- 排版系统 ---- */
.type-scale {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.type-sample {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.type-sample .type-name {
  font-size: 10px;
  color: #6B7280;
  min-width: 60px;
  text-align: right;
}
.type-sample .type-value {
  font-size: 10px;
  color: #4B5563;
  min-width: 70px;
  font-family: monospace;
}
.type-sample .type-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- 组件预览 ---- */
.component-showcase {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-label {
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 4px;
}

.canvas-demo-btn {
  padding: 8px 16px;
  border-radius: 980px;
  border: 1px solid transparent;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.canvas-demo-btn-primary {
  background: var(--color-button-primary, #0071E3);
  color: white;
}
.canvas-demo-btn-primary:hover {
  background: var(--color-button-primary-hover, #0076DF);
}
.canvas-demo-btn-secondary {
  background: var(--color-button-dark, #1D1D1F);
  color: white;
}
.canvas-demo-btn-secondary:hover {
  background: var(--color-button-dark-hover, #272729);
}
.canvas-demo-btn-outline {
  background: transparent;
  color: var(--color-link, #0066CC);
  border-color: var(--color-link, #0066CC);
}
.canvas-demo-btn-outline:hover {
  background: var(--color-button-primary, #0071E3);
  color: white;
  border-color: var(--color-button-primary, #0071E3);
}

.nav-demo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 14px;
  background: rgba(0,0,0,0.85);
  border-radius: 10px;
  backdrop-filter: blur(8px);
}
.nav-demo-item {
  color: rgba(255,255,255,0.7);
  font-size: 11px;
  cursor: default;
}

.editable-image-area {
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}
.editable-image-area:hover {
  border-color: rgba(59,130,246,0.3);
}

/* ---- 结构布局图 ---- */
.wireframe {
  background: rgba(15,17,22,0.6);
  border-radius: 10px;
  padding: 12px;
}
.wf-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wf-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  background: rgba(51,65,85,0.3);
  border-radius: 6px;
}
.wf-hero {
  padding: 20px 10px;
  background: rgba(51,65,85,0.2);
  border-radius: 6px;
  text-align: center;
  font-size: 11px;
  color: #64748B;
}
.wf-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.wf-tile {
  padding: 16px 10px;
  background: rgba(51,65,85,0.15);
  border-radius: 6px;
}
.wf-footer {
  padding: 12px 10px;
  background: rgba(51,65,85,0.2);
  border-radius: 6px;
}

/* ---- 间距可视化 ---- */
.spacing-demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.spacing-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.spacing-bar-row .sp-name {
  font-size: 10px;
  color: #6B7280;
  min-width: 80px;
}
.spacing-bar-row .sp-value {
  font-size: 9px;
  color: #4B5563;
  font-family: monospace;
  min-width: 60px;
}
.spacing-bar-row .sp-bar-wrap {
  flex: 1;
  height: 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.spacing-bar-row .sp-bar {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
  opacity: 0.7;
}

/* ---- 浮动装饰标签 ---- */
.floating-tag {
  position: absolute;
  color: #4B5563;
  font-size: 12px;
  pointer-events: none;
  opacity: 0.5;
}

/* ---- 视口渐暗 ---- */
.canvas-vignette {
  position: fixed;
  top: 44px; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 60px rgba(0,0,0,0.3);
  z-index: 1;
}

/* ---- 编辑模式：选中高亮 ---- */
.edit-mode .color-swatch.selected {
  outline: 2px solid #60A5FA;
  outline-offset: 2px;
}

.edit-mode .editable-image-area.selected {
  border-color: #60A5FA;
  border-style: solid;
}
```

---

### Task 3: 创建 js/canvas-engine.js

**Files:**
- Create: `site/js/canvas-engine.js`

- [ ] **Step 1: 编写画布引擎（平移/缩放/复位/网格）**

```javascript
/* ========================================
   无限画布引擎 — 平移/缩放/惯性/网格
   ======================================== */

;(function() {
  'use strict';

  var stage = document.getElementById('canvas-stage');
  var viewport = document.getElementById('canvas-viewport');
  var scaleDisplay = document.getElementById('scaleDisplay');
  if (!stage || !viewport) return;

  var state = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    minScale: 0.1,
    maxScale: 5
  };

  var isPanning = false;
  var panStartX, panStartY;
  var startOffsetX, startOffsetY;

  // ---- 更新舞台变换 ----
  function updateTransform() {
    stage.style.transform = 'translate(' + state.offsetX + 'px, ' + state.offsetY + 'px) scale(' + state.scale + ')';
    // 更新网格背景尺寸以匹配缩放
    var grid = stage.querySelector('.canvas-grid');
    if (grid) {
      grid.style.width = (1 / state.scale) * 5000 + 'px';
      grid.style.height = (1 / state.scale) * 5000 + 'px';
      grid.style.left = '-' + (1 / state.scale) * 2500 + 'px';
      grid.style.top = '-' + (1 / state.scale) * 2500 + 'px';
      grid.style.backgroundSize = (40 / state.scale) + 'px ' + (40 / state.scale) + 'px';
    }
    if (scaleDisplay) {
      scaleDisplay.textContent = Math.round(state.scale * 100) + '%';
    }
  }

  // ---- 鼠标拖拽平移 ----
  viewport.addEventListener('mousedown', function(e) {
    // 只响应左键 + Space 或左键 + 空白区域
    if (e.button !== 0) return;
    // 如果点在 canvas-section 等可交互元素上，不启动拖拽
    if (e.target.closest('.canvas-section') || e.target.closest('.ctrl-btn') || e.target.closest('.ctrl-link')) return;
    if (e.target.closest('button, input, select, textarea, a')) return;

    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    startOffsetX = state.offsetX;
    startOffsetY = state.offsetY;
    viewport.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', function(e) {
    if (!isPanning) return;
    var dx = e.clientX - panStartX;
    var dy = e.clientY - panStartY;
    state.offsetX = startOffsetX + dx;
    state.offsetY = startOffsetY + dy;
    updateTransform();
  });

  window.addEventListener('mouseup', function() {
    if (isPanning) {
      isPanning = false;
      viewport.style.cursor = 'grab';
    }
  });

  // ---- 滚轮缩放 ----
  viewport.addEventListener('wheel', function(e) {
    e.preventDefault();
    var rect = viewport.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var factor = e.ctrlKey || e.metaKey ? 0.05 : 0.1;
    var direction = e.deltaY < 0 ? 1 : -1;
    var newScale = state.scale * (1 + direction * factor);
    newScale = Math.max(state.minScale, Math.min(state.maxScale, newScale));

    // 保持鼠标位置不变
    var ratio = newScale / state.scale;
    state.offsetX = mx - ratio * (mx - state.offsetX);
    state.offsetY = my - ratio * (my - state.offsetY);
    state.scale = newScale;

    updateTransform();
  }, { passive: false });

  // ---- 重置视图 ----
  window.resetCanvasView = function() {
    state.scale = 1;
    state.offsetX = 0;
    state.offsetY = 0;
    updateTransform();
  };

  // 挂载到控制栏的重置按钮
  var resetBtn = document.querySelector('[data-action="reset"]');
  if (resetBtn) resetBtn.addEventListener('click', resetCanvasView);

  // zoom in/out 按钮
  var zoomInBtn = document.querySelector('[data-action="zoom-in"]');
  var zoomOutBtn = document.querySelector('[data-action="zoom-out"]');
  if (zoomInBtn) zoomInBtn.addEventListener('click', function() {
    var rect = viewport.getBoundingClientRect();
    var cx = rect.width / 2, cy = rect.height / 2;
    var newScale = Math.min(state.maxScale, state.scale * 1.3);
    var ratio = newScale / state.scale;
    state.offsetX = cx - ratio * (cx - state.offsetX);
    state.offsetY = cy - ratio * (cy - state.offsetY);
    state.scale = newScale;
    updateTransform();
  });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() {
    var rect = viewport.getBoundingClientRect();
    var cx = rect.width / 2, cy = rect.height / 2;
    var newScale = Math.max(state.minScale, state.scale / 1.3);
    var ratio = newScale / state.scale;
    state.offsetX = cx - ratio * (cx - state.offsetX);
    state.offsetY = cy - ratio * (cy - state.offsetY);
    state.scale = newScale;
    updateTransform();
  });

  // ---- Space 键拖拽 ----
  var spaceDown = false;
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !e.repeat) {
      spaceDown = true;
      viewport.style.cursor = 'grab';
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', function(e) {
    if (e.code === 'Space') {
      spaceDown = false;
      viewport.style.cursor = '';
      e.preventDefault();
    }
  });

  // ---- 暴露 API ----
  window.CanvasEngine = {
    state: state,
    updateTransform: updateTransform,
    reset: resetCanvasView
  };

  // ---- 初始化 ----
  // 给网格一个超大尺寸用于"无限"视觉效果
  var grid = stage.querySelector('.canvas-grid');
  if (grid) {
    grid.style.width = '5000px';
    grid.style.height = '5000px';
    grid.style.left = '-2500px';
    grid.style.top = '-2500px';
  }
  updateTransform();

  console.log('[CanvasEngine] 画布引擎已初始化');
})();
```

---

### Task 4: 创建 js/canvas-content.js

**Files:**
- Create: `site/js/canvas-content.js`

- [ ] **Step 1: 编写 Token 渲染逻辑**

```javascript
/* ========================================
   画布内容渲染 — Design Token 动态渲染
   依赖: TokenStore (node-token.js)
   ======================================== */

;(function() {
  'use strict';

  if (!window.TokenStore) {
    console.warn('[CanvasContent] TokenStore 未加载，延期执行');
    return;
  }

  function renderContent() {
    TokenStore.refresh();

    // ① 品牌主色板
    var brandEl = document.getElementById('brand-palette');
    if (brandEl) {
      var brandTokens = ['--color-primary-50','--color-primary-100','--color-primary-500','--color-primary-700','--color-primary-900'];
      brandEl.innerHTML = brandTokens.map(function(name) {
        var val = TokenStore.get(name);
        return '<div class="color-swatch" style="background:' + val + '" title="' + name + ': ' + val + '"><span class="swatch-tooltip">' + name.replace('--','') + '<br>' + val + '</span></div>';
      }).join('');
    }

    // ② 中性色板
    var neutralEl = document.getElementById('neutral-palette');
    if (neutralEl) {
      var neutralTokens = ['--color-neutral-50','--color-neutral-100','--color-neutral-150','--color-neutral-200','--color-neutral-300','--color-neutral-500','--color-neutral-600','--color-neutral-700','--color-neutral-900'];
      neutralEl.innerHTML = neutralTokens.map(function(name) {
        var val = TokenStore.get(name);
        return '<div class="color-swatch" style="background:' + val + '" title="' + name + ': ' + val + '"><span class="swatch-tooltip">' + name.replace('--','') + '<br>' + val + '</span></div>';
      }).join('');
    }

    // ③ 辅助色板
    var accentEl = document.getElementById('accent-palette');
    if (accentEl) {
      var accentTokens = ['--color-secondary-500','--color-accent-500','--color-success-500','--color-warning-500','--color-error-500','--color-info-500'];
      accentEl.innerHTML = accentTokens.map(function(name) {
        var val = TokenStore.get(name);
        return '<div class="color-swatch" style="background:' + val + '" title="' + name + ': ' + val + '"><span class="swatch-tooltip">' + name.replace('--','') + '<br>' + val + '</span></div>';
      }).join('');
    }

    // ④ 语义色
    var semanticEl = document.getElementById('semantic-palette');
    if (semanticEl) {
      var semanticTokens = ['--color-bg-primary','--color-bg-card','--color-bg-dark','--color-text-primary','--color-text-secondary','--color-text-tertiary','--color-text-inverse','--color-link','--color-border','--color-button-primary'];
      semanticEl.innerHTML = semanticTokens.map(function(name) {
        var val = TokenStore.get(name);
        return '<div class="semantic-swatch"><div class="swatch-box" style="background:' + val + '" title="' + name + ': ' + val + '"></div><span class="swatch-label">' + name.replace('--','') + '</span></div>';
      }).join('');
    }

    // ⑤ 排版系统
    var typeEl = document.getElementById('type-scale');
    if (typeEl) {
      var typeTokens = [
        { name: '--font-size-hero', label: 'Hero 标题', sample: 'iPhone 16 Pro' },
        { name: '--font-size-display', label: '产品标题', sample: '薄得出奇。' },
        { name: '--font-size-headline', label: '副标题', sample: 'Apple 智能。强悍升级。' },
        { name: '--font-size-subhead', label: '小副标题', sample: '自适应音频。' },
        { name: '--font-size-body', label: '正文', sample: '进一步了解 iPhone 16 Pro 的强大功能。' },
        { name: '--font-size-callout', label: '标注', sample: '更多选购方式：查找零售店。' },
        { name: '--font-size-caption', label: '脚注', sample: 'Copyright © 2026 Apple Inc.' }
      ];
      typeEl.innerHTML = typeTokens.map(function(t) {
        var val = TokenStore.get(t.name) || '16px';
        return '<div class="type-sample"><span class="type-name">' + t.label + '</span><span class="type-value">' + val + '</span><span class="type-text" style="font-size:' + val + '">' + t.sample + '</span></div>';
      }).join('');
    }

    // ⑥ 间距系统
    var spacingEl = document.getElementById('spacing-list');
    if (spacingEl) {
      var spacingTokens = [
        { name: '--spacing-xs', label: 'xs 按钮垂直内边距' },
        { name: '--spacing-sm', label: 'sm 按钮水平间距' },
        { name: '--spacing-md', label: 'md 栅格间距' },
        { name: '--spacing-lg', label: 'lg 卡片上内边距' },
        { name: '--spacing-xl', label: 'xl 大区块间距' },
        { name: '--spacing-2xl', label: '2xl 页面顶级间距' }
      ];
      spacingEl.innerHTML = spacingTokens.map(function(t) {
        var val = TokenStore.get(t.name) || '0';
        var numVal = parseInt(val) || 0;
        var maxBar = 110;
        var widthPercent = Math.min((numVal / maxBar) * 100, 100);
        return '<div class="spacing-bar-row"><span class="sp-name">' + t.label + '</span><span class="sp-value">' + val + '</span><div class="sp-bar-wrap"><div class="sp-bar" style="width:' + widthPercent + '%"></div></div></div>';
      }).join('');
    }

    // ⑦ 字体家族显示
    var fontDisplay = document.getElementById('fontFamilyDisplay');
    if (fontDisplay) {
      var ff = TokenStore.get('--font-family-display') || 'SF Pro Display';
      fontDisplay.textContent = '字体: ' + ff.replace(/["']/g, '').split(',')[0];
    }

    // ⑧ 排版说明
    var typeNote = document.getElementById('type-note');
    if (typeNote) {
      var ffText = TokenStore.get('--font-family-text') || 'SF Pro Text';
      typeNote.textContent = '📐 字体: ' + ffText.replace(/["']/g, '').split(',')[0] + ' · 7 级字号 · 响应式缩减';
    }

    console.log('[CanvasContent] Token 渲染完成');
  }

  // DOM 就绪后渲染
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderContent);
  } else {
    renderContent();
  }

  // 暴露刷新方法，供编辑模式调用
  window.renderCanvasContent = renderContent;
})();
```

---

### Task 5: 创建 js/color-utils.js

**Files:**
- Create: `site/js/color-utils.js`

- [ ] **Step 1: 编写颜色工具函数**

```javascript
/* ========================================
   颜色工具库 — hex/rgb/亮度/对比度
   ======================================== */

;(function() {
  'use strict';

  var ColorUtils = window.ColorUtils = {};

  /**
   * hex → RGB 对象
   * @param {string} hex - "#RRGGBB" 或 "#RGB"
   * @returns {{r: number, g: number, b: number}} | null
   */
  ColorUtils.hexToRgb = function(hex) {
    if (typeof hex !== 'string') return null;
    var h = hex.replace('#', '');
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (h.length !== 6) return null;
    var num = parseInt(h, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  /**
   * RGB → hex 字符串
   * @param {number} r 0-255
   * @param {number} g 0-255
   * @param {number} b 0-255
   * @returns {string} "#RRGGBB"
   */
  ColorUtils.rgbToHex = function(r, g, b) {
    var toHex = function(v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return (v < 16 ? '0' : '') + v.toString(16);
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  };

  /**
   * 计算相对亮度 (WCAG)
   * @param {string} hex
   * @returns {number} 0-1
   */
  ColorUtils.getLuminance = function(hex) {
    var rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return 0;
    var vals = [rgb.r, rgb.g, rgb.b].map(function(c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
  };

  /**
   * 对比度 (WCAG)
   * @param {string} hex1
   * @param {string} hex2
   * @returns {number}
   */
  ColorUtils.getContrastRatio = function(hex1, hex2) {
    var l1 = ColorUtils.getLuminance(hex1);
    var l2 = ColorUtils.getLuminance(hex2);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  /**
   * 判断颜色是否为亮色
   * @param {string} hex
   * @returns {boolean}
   */
  ColorUtils.isLight = function(hex) {
    return ColorUtils.getLuminance(hex) > 0.5;
  };

  /**
   * 从 CSS 变量引用中提取实际颜色值
   * 支持 "var(--color-primary-500)" → 解析并读取
   * @param {string} str
   * @returns {string} 实际色值
   */
  ColorUtils.resolveCssVar = function(str) {
    if (typeof str !== 'string') return str;
    var match = str.match(/var\((--[\w-]+)\)/);
    if (match && window.TokenStore) {
      return window.TokenStore.get(match[1]) || str;
    }
    return str;
  };
})();
```

---

### Task 6: 创建 js/color-wheel.js

**Files:**
- Create: `site/js/color-wheel.js`

- [ ] **Step 1: 编写颜色轮盘 UI**

```javascript
/* ========================================
   颜色选择轮盘 — 编辑模式用
   依赖: ColorUtils (color-utils.js)
   ======================================== */

;(function() {
  'use strict';

  if (!window.ColorUtils) {
    console.warn('[ColorWheel] ColorUtils 未加载');
    return;
  }

  var ColorWheel = window.ColorWheel = {};
  var _container = null;
  var _onColorSelect = null;

  // 预设色板（从 DESIGN.md 精选）
  var PRESETS = {
    '品牌蓝': ['#0071E3','#0066CC','#004080','#B8DAFF','#E8F4FD'],
    '中性色': ['#1D1D1F','#424245','#6E6E73','#86868B','#D2D2D7','#E8E8ED','#F5F5F7','#FAFAFC','#FFFFFF'],
    '强调色': ['#B64400','#03A10E','#FFE045','#E30000','#2997FF'],
    '纯色': ['#000000','#FFFFFF','#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF']
  };

  /**
   * 打开颜色轮盘
   * @param {HTMLElement} anchor - 锚点元素
   * @param {string} currentColor - 当前颜色值
   * @param {function} onSelect - 选择回调 (colorHex)
   */
  ColorWheel.open = function(anchor, currentColor, onSelect) {
    ColorWheel.close();
    _onColorSelect = onSelect;

    var overlay = document.createElement('div');
    overlay.className = 'color-wheel-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9998;' +
      'background:rgba(0,0,0,0.3);';

    var panel = document.createElement('div');
    panel.className = 'color-wheel-panel';
    panel.style.cssText =
      'position:fixed;z-index:9999;background:rgba(22,24,30,0.98);' +
      'backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);' +
      'border-radius:14px;padding:16px;width:280px;' +
      'box-shadow:0 20px 60px rgba(0,0,0,0.5);';

    // 定位在锚点附近
    if (anchor) {
      var rect = anchor.getBoundingClientRect();
      var left = Math.min(rect.left, window.innerWidth - 300);
      var top = rect.bottom + 8;
      if (top + 400 > window.innerHeight) {
        top = rect.top - 420;
      }
      panel.style.left = Math.max(8, left) + 'px';
      panel.style.top = Math.max(8, top) + 'px';
    } else {
      panel.style.left = '50%';
      panel.style.top = '50%';
      panel.style.transform = 'translate(-50%, -50%)';
    }

    // 标题 + 当前色显示
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';

    var currentPreview = document.createElement('div');
    currentPreview.style.cssText =
      'width:32px;height:32px;border-radius:8px;border:2px solid rgba(255,255,255,0.1);' +
      'background:' + (currentColor || '#FFFFFF') + ';flex-shrink:0;';
    currentPreview.id = 'color-wheel-preview';

    var currentLabel = document.createElement('span');
    currentLabel.style.cssText = 'color:#9CA3AF;font-size:12px;font-family:monospace;';
    currentLabel.id = 'color-wheel-label';
    currentLabel.textContent = currentColor || '未选择';

    header.appendChild(currentPreview);
    header.appendChild(currentLabel);
    panel.appendChild(header);

    // Hex 输入
    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;gap:6px;margin-bottom:12px;';

    var hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.value = currentColor || '#000000';
    hexInput.style.cssText =
      'flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);' +
      'border-radius:6px;padding:6px 10px;color:white;font-size:12px;' +
      'font-family:monospace;outline:none;';
    hexInput.addEventListener('input', function() {
      var val = this.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(val) || /^#[0-9a-f]{3}$/i.test(val)) {
        currentPreview.style.background = val;
        currentLabel.textContent = val;
        if (_onColorSelect) _onColorSelect(val);
      }
    });
    inputRow.appendChild(hexInput);
    panel.appendChild(inputRow);

    // 预设色板
    Object.keys(PRESETS).forEach(function(groupName) {
      var label = document.createElement('div');
      label.style.cssText = 'color:#6B7280;font-size:10px;margin:6px 0 3px;';
      label.textContent = groupName;
      panel.appendChild(label);

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;';

      PRESETS[groupName].forEach(function(color) {
        var swatch = document.createElement('div');
        swatch.style.cssText =
          'width:28px;height:28px;border-radius:6px;cursor:pointer;' +
          'border:1px solid rgba(255,255,255,0.06);background:' + color + ';' +
          'transition:transform 0.1s;';
        swatch.title = color;
        swatch.addEventListener('click', function() {
          hexInput.value = color;
          currentPreview.style.background = color;
          currentLabel.textContent = color;
          if (_onColorSelect) _onColorSelect(color);
        });
        swatch.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.2)'; });
        swatch.addEventListener('mouseleave', function() { this.style.transform = ''; });
        row.appendChild(swatch);
      });

      panel.appendChild(row);
    });

    // 关闭按钮
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ 关闭';
    closeBtn.style.cssText =
      'margin-top:12px;width:100%;background:rgba(255,255,255,0.06);' +
      'border:1px solid rgba(255,255,255,0.06);color:#6B7280;padding:6px;' +
      'border-radius:6px;cursor:pointer;font-size:11px;';
    closeBtn.addEventListener('click', ColorWheel.close);
    panel.appendChild(closeBtn);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    _container = overlay;

    // 点击背景关闭
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) ColorWheel.close();
    });
  };

  /**
   * 关闭颜色轮盘
   */
  ColorWheel.close = function() {
    if (_container) {
      _container.remove();
      _container = null;
    }
    _onColorSelect = null;
  };
})();
```

---

### Task 7: 创建 js/property-panel.js

**Files:**
- Create: `site/js/property-panel.js`

- [ ] **Step 1: 编写属性面板**

```javascript
/* ========================================
   属性面板 — 编辑模式选中元素后显示可调属性
   依赖: ColorWheel (color-wheel.js), ColorUtils (color-utils.js)
   ======================================== */

;(function() {
  'use strict';

  if (!window.ColorWheel) {
    console.warn('[PropertyPanel] ColorWheel 未加载');
    return;
  }

  var PropertyPanel = window.PropertyPanel = {};
  var _panel = null;
  var _target = null;

  /**
   * 显示属性面板
   * @param {HTMLElement} target - 被选中的元素
   * @param {Object} options - 属性选项
   */
  PropertyPanel.show = function(target, options) {
    _target = target;
    PropertyPanel.close();

    options = options || {};

    _panel = document.createElement('div');
    _panel.className = 'property-panel';
    _panel.style.cssText =
      'position:fixed;right:16px;top:60px;z-index:9997;' +
      'background:rgba(22,24,30,0.98);backdrop-filter:blur(20px);' +
      'border:1px solid rgba(255,255,255,0.1);border-radius:14px;' +
      'padding:16px;width:260px;box-shadow:0 20px 60px rgba(0,0,0,0.5);' +
      'max-height:calc(100vh - 80px);overflow-y:auto;';

    // 标题
    var title = document.createElement('div');
    title.style.cssText = 'color:#E2E8F0;font-size:13px;font-weight:600;margin-bottom:12px;';
    title.textContent = '✎ 属性面板';
    _panel.appendChild(title);

    // 如果有颜色属性
    if (options.color !== undefined) {
      var colorGroup = createPropGroup('颜色');
      var colorRow = createColorRow(target, options.color);
      colorGroup.appendChild(colorRow);
      _panel.appendChild(colorGroup);
    }

    // 如果有图片属性
    if (options.image !== undefined) {
      var imgGroup = createPropGroup('图片');
      var imgRow = createImageRow(target, options.image);
      imgGroup.appendChild(imgRow);
      _panel.appendChild(imgGroup);
    }

    // 通用 CSS 属性
    if (options.fontSize !== undefined || options.opacity !== undefined || options.borderRadius !== undefined) {
      var styleGroup = createPropGroup('样式');

      if (options.fontSize !== undefined) {
        var fsRow = createSliderRow('字号', options.fontSize, 8, 120, function(val) {
          target.style.fontSize = val + 'px';
          if (options.onChange) options.onChange('fontSize', val);
        });
        styleGroup.appendChild(fsRow);
      }

      if (options.opacity !== undefined) {
        var opRow = createSliderRow('不透明度', options.opacity, 0, 1, 0.01, function(val) {
          target.style.opacity = val;
          if (options.onChange) options.onChange('opacity', val);
        });
        styleGroup.appendChild(opRow);
      }

      if (options.borderRadius !== undefined) {
        var brRow = createSliderRow('圆角', options.borderRadius, 0, 50, function(val) {
          target.style.borderRadius = val + 'px';
          if (options.onChange) options.onChange('borderRadius', val);
        });
        styleGroup.appendChild(brRow);
      }

      _panel.appendChild(styleGroup);
    }

    // 关闭按钮
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ 关闭面板';
    closeBtn.style.cssText =
      'margin-top:12px;width:100%;background:rgba(255,255,255,0.06);' +
      'border:1px solid rgba(255,255,255,0.06);color:#6B7280;padding:6px;' +
      'border-radius:6px;cursor:pointer;font-size:11px;';
    closeBtn.addEventListener('click', PropertyPanel.close);
    _panel.appendChild(closeBtn);

    document.body.appendChild(_panel);
  };

  function createPropGroup(label) {
    var group = document.createElement('div');
    group.style.cssText = 'margin-bottom:10px;';
    var header = document.createElement('div');
    header.style.cssText = 'color:#6B7280;font-size:10px;margin-bottom:4px;font-weight:600;';
    header.textContent = label;
    group.appendChild(header);
    return group;
  }

  function createColorRow(target, currentColor) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;';

    var preview = document.createElement('div');
    preview.style.cssText =
      'width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);' +
      'cursor:pointer;background:' + (currentColor || '#FFFFFF') + ';flex-shrink:0;';
    preview.title = '点击选择颜色';

    var label = document.createElement('span');
    label.style.cssText = 'color:#9CA3AF;font-size:11px;font-family:monospace;flex:1;';
    label.textContent = currentColor || '未设置';

    preview.addEventListener('click', function() {
      ColorWheel.open(preview, currentColor, function(newColor) {
        target.style.background = newColor;
        preview.style.background = newColor;
        label.textContent = newColor;
        if (target.dataset) {
          if (target.classList.contains('color-swatch')) {
            target.style.background = newColor;
          }
        }
      });
    });

    row.appendChild(preview);
    row.appendChild(label);
    return row;
  }

  function createImageRow(target, currentSrc) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

    var input = document.createElement('input');
    input.type = 'text';
    input.value = currentSrc || '';
    input.placeholder = '输入图片 URL…';
    input.style.cssText =
      'width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);' +
      'border-radius:6px;padding:6px 8px;color:white;font-size:11px;outline:none;' +
      'box-sizing:border-box;';

    var applyBtn = document.createElement('button');
    applyBtn.textContent = '应用';
    applyBtn.style.cssText =
      'background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.2);' +
      'color:#60A5FA;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;' +
      'align-self:flex-start;';
    applyBtn.addEventListener('click', function() {
      var url = input.value.trim();
      if (url) {
        var img = target.querySelector('img');
        if (img) {
          img.src = url;
        } else {
          target.style.backgroundImage = 'url(' + url + ')';
        }
      }
    });

    row.appendChild(input);
    row.appendChild(applyBtn);
    return row;
  }

  function createSliderRow(label, value, min, max, stepOrCallback, callback) {
    var step = typeof stepOrCallback === 'number' ? stepOrCallback : 1;
    var onChange = typeof stepOrCallback === 'function' ? stepOrCallback : callback;

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';

    var nameLabel = document.createElement('span');
    nameLabel.style.cssText = 'color:#6B7280;font-size:10px;min-width:50px;';
    nameLabel.textContent = label;

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.style.cssText = 'flex:1;accent-color:#3B82F6;height:4px;';

    var valLabel = document.createElement('span');
    valLabel.style.cssText = 'color:#9CA3AF;font-size:10px;font-family:monospace;min-width:30px;text-align:right;';
    valLabel.textContent = value;

    slider.addEventListener('input', function() {
      var v = parseFloat(this.value);
      valLabel.textContent = v;
      if (onChange) onChange(v);
    });

    row.appendChild(nameLabel);
    row.appendChild(slider);
    row.appendChild(valLabel);
    return row;
  }

  /**
   * 关闭属性面板
   */
  PropertyPanel.close = function() {
    if (_panel) {
      _panel.remove();
      _panel = null;
    }
    _target = null;
    if (window.ColorWheel) ColorWheel.close();
  };
})();
```

---

### Task 8: 创建 js/canvas-components.js

**Files:**
- Create: `site/js/canvas-components.js`

- [ ] **Step 1: 编写组件拖拽系统**

```javascript
/* ========================================
   画布组件系统 — 双击添加组件到画布
   依赖: CanvasEngine (canvas-engine.js)
   编辑模式组件系统
   ======================================== */

;(function() {
  'use strict';

  if (!window.CanvasEngine) {
    console.warn('[CanvasComponents] CanvasEngine 未加载');
    return;
  }

  var CanvasComponents = window.CanvasComponents = {};

  // 18 个组件定义
  var COMPONENTS = [
    { id: 'color-block',   label: '🎨 色块',        desc: '纯色色块，可调色值' },
    { id: 'text-block',    label: '📝 文字块',      desc: '多行演示文字' },
    { id: 'image-block',   label: '🖼️ 图片块',     desc: '占位图片容器' },
    { id: 'button-blue',   label: '🔵 蓝色按钮',   desc: 'Apple 主按钮样式' },
    { id: 'button-dark',   label: '⚫ 暗色按钮',   desc: 'Apple 暗色按钮样式' },
    { id: 'button-outline',label: '🔘 轮廓按钮',   desc: '链接轮廓按钮' },
    { id: 'nav-bar',       label: '📋 导航栏',     desc: '毛玻璃导航栏模拟' },
    { id: 'hero-dark',     label: '🌙 暗色 Hero',  desc: '暗色 Hero 区域' },
    { id: 'hero-light',    label: '☀️ 亮色 Hero',  desc: '亮色 Hero 区域' },
    { id: 'tile-card',     label: '📦 产品卡片',   desc: '产品区块卡片' },
    { id: 'type-hero',     label: '🔤 Hero 标题',  desc: '56px 大标题' },
    { id: 'type-display',  label: '🔤 产品标题',   desc: '40px 展示标题' },
    { id: 'type-body',     label: '🔤 正文',       desc: '17px 正文段落' },
    { id: 'badge',         label: '🏷️ 促销徽章',   desc: '促销/新品类标签' },
    { id: 'price-tag',     label: '💰 价格标签',   desc: '¥ 价格展示' },
    { id: 'divider',       label: '〰️ 分割线',    desc: '水平分隔' },
    { id: 'icon-row',      label: '🔣 图标行',     desc: '服务图标栏' },
    { id: 'footer-text',   label: '📄 页脚文本',   desc: '页脚法律信息样式' }
  ];

  // ---- 将组件渲染到画布上 ----
  function renderComponent(compId) {
    var stage = document.getElementById('canvas-stage');
    if (!stage) return;

    var comp = COMPONENTS.find(function(c) { return c.id === compId; });
    if (!comp) return;

    var el = document.createElement('div');
    el.className = 'canvas-placed-component';
    el.style.cssText =
      'position:absolute;cursor:move;border-radius:8px;' +
      'border:1px solid rgba(255,255,255,0.06);' +
      'background:rgba(30,33,40,0.85);backdrop-filter:blur(8px);' +
      'padding:14px;min-width:120px;user-select:none;' +
      'transition:box-shadow 0.15s;';

    // 随机位置
    var engine = window.CanvasEngine;
    var scale = engine ? engine.state.scale : 1;
    var baseX = 80 + Math.random() * 300;
    var baseY = 200 + Math.random() * 400;

    el.style.left = (baseX / scale) + 'px';
    el.style.top = (baseY / scale) + 'px';

    // 根据组件类型生成内容
    el.innerHTML = generateComponentContent(compId);

    // 拖拽移动
    makeDraggable(el);

    // 双击编辑（编辑模式）
    el.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      var body = document.body;
      if (body && body.classList.contains('edit-mode')) {
        // 选中高亮
        document.querySelectorAll('.canvas-placed-component.selected').forEach(function(s) { s.classList.remove('selected'); });
        el.classList.add('selected');
        el.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.5)';

        // 打开属性面板
        if (window.PropertyPanel) {
          var colorEl = el.querySelector('[data-editable="color"]');
          var imgEl = el.querySelector('[data-editable="image"]');
          var options = {};
          if (colorEl) options.color = colorEl.style.background || colorEl.textContent;
          if (imgEl) options.image = imgEl.src || '';
          window.PropertyPanel.show(el, options);
        }
      }
    });

    // 点击取消选中
    el.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    stage.appendChild(el);

    // 更新引擎内容区域
    if (engine) engine.updateTransform();
  }

  function generateComponentContent(compId) {
    var ts = window.TokenStore;
    var primary = ts ? ts.get('--color-primary-500') : '#0071E3';
    var dark = ts ? ts.get('--color-button-dark') : '#1D1D1F';
    var link = ts ? ts.get('--color-link') : '#0066CC';
    var bgDark = ts ? ts.get('--color-bg-dark') : '#000000';
    var bgCard = ts ? ts.get('--color-bg-card') : '#F5F5F7';
    var textPrimary = ts ? ts.get('--color-text-primary') : '#1D1D1F';

    var map = {
      'color-block': '<div style="width:200px;height:80px;background:' + primary + ';border-radius:8px;" data-editable="color"></div><div style="color:#6B7280;font-size:10px;margin-top:6px;">' + primary + '</div>',
      'text-block': '<div style="color:#E2E8F0;font-size:14px;line-height:1.6;">这是一段演示文本，用于展示画布上的文字排版效果。</div>',
      'image-block': '<div style="width:200px;height:120px;background:linear-gradient(135deg,#374151,#4B5563);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#6B7280;font-size:12px;" data-editable="image">🖼️ 点击替换图片</div>',
      'button-blue': '<div style="display:inline-block;padding:9px 16px;background:' + primary + ';color:white;border-radius:980px;font-size:12px;cursor:pointer;">进一步了解</div>',
      'button-dark': '<div style="display:inline-block;padding:9px 16px;background:' + dark + ';color:white;border-radius:980px;font-size:12px;cursor:pointer;">购买</div>',
      'button-outline': '<div style="display:inline-block;padding:9px 16px;background:transparent;color:' + link + ';border:1px solid ' + link + ';border-radius:980px;font-size:12px;cursor:pointer;">进一步了解</div>',
      'nav-bar': '<div style="display:flex;align-items:center;gap:16px;padding:6px 14px;background:rgba(0,0,0,0.85);border-radius:8px;backdrop-filter:blur(8px);min-width:300px;"><span style="color:rgba(255,255,255,0.9);font-weight:600;">🍎</span><span style="color:rgba(255,255,255,0.6);font-size:11px;">Mac</span><span style="color:rgba(255,255,255,0.6);font-size:11px;">iPad</span><span style="color:rgba(255,255,255,0.6);font-size:11px;">iPhone</span><span style="color:rgba(255,255,255,0.6);font-size:11px;">Watch</span></div>',
      'hero-dark': '<div style="width:280px;height:120px;background:' + bgDark + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;"><div style="color:white;font-size:16px;font-weight:600;">iPhone 16 Pro</div><div style="color:rgba(255,255,255,0.7);font-size:11px;">Apple 智能。强悍升级。</div></div>',
      'hero-light': '<div style="width:280px;height:120px;background:' + bgCard + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;"><div style="color:' + textPrimary + ';font-size:16px;font-weight:600;">iPhone 16</div><div style="color:#6E6E73;font-size:11px;">Apple 智能。强势来袭。</div></div>',
      'tile-card': '<div style="width:200px;height:140px;background:' + bgCard + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;padding-top:20px;"><div style="font-size:11px;color:#86868B;">iPad Pro</div><div style="color:' + textPrimary + ';font-size:14px;font-weight:600;">薄得出奇。</div></div>',
      'type-hero': '<div style="color:#E2E8F0;font-size:28px;font-weight:600;letter-spacing:-0.022em;">iPhone 16 Pro</div>',
      'type-display': '<div style="color:#E2E8F0;font-size:20px;font-weight:600;letter-spacing:-0.016em;">薄得出奇。</div>',
      'type-body': '<div style="color:#9CA3AF;font-size:14px;line-height:1.5;max-width:280px;">iPhone 16 Pro 采用全新 A18 Pro 芯片，带来强大的 Apple 智能体验。</div>',
      'badge': '<div style="display:inline-block;padding:3px 8px;background:rgba(245,99,0,0.2);color:rgb(255,121,27);border-radius:4px;font-size:11px;">新品</div>',
      'price-tag': '<div style="color:#E2E8F0;font-size:18px;font-weight:600;">¥7,999 <span style="font-size:12px;color:#6B7280;font-weight:400;">起</span></div>',
      'divider': '<div style="height:1px;background:rgba(255,255,255,0.08);width:200px;"></div>',
      'icon-row': '<div style="display:flex;gap:12px;padding:8px 0;"><span style="color:#6B7280;font-size:16px;">🔍</span><span style="color:#6B7280;font-size:16px;">🔔</span><span style="color:#6B7280;font-size:16px;">⚙️</span><span style="color:#6B7280;font-size:16px;">📁</span></div>',
      'footer-text': '<div style="color:#6B7280;font-size:10px;line-height:1.4;max-width:280px;">Copyright © 2026 Apple Inc. 保留所有权利。隐私政策 | 使用条款 | 销售政策</div>'
    };

    return map[compId] || '<div style="color:#6B7280;font-size:12px;">未知组件</div>';
  }

  function makeDraggable(el) {
    var isDragging = false;
    var startX, startY, startLeft, startTop;

    el.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(el.style.left) || 0;
      startTop = parseInt(el.style.top) || 0;
      el.style.zIndex = 1000;
      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var engine = window.CanvasEngine;
      var scale = engine ? engine.state.scale : 1;
      var dx = (e.clientX - startX) / scale;
      var dy = (e.clientY - startY) / scale;
      el.style.left = (startLeft + dx) + 'px';
      el.style.top = (startTop + dy) + 'px';
    });

    window.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        el.style.zIndex = '';
      }
    });
  }

  // ---- 显示组件选择面板（双击画布触发） ----
  CanvasComponents.showPalette = function() {
    var existing = document.getElementById('components-palette');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'components-palette-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9997;' +
      'background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;';

    var palette = document.createElement('div');
    palette.id = 'components-palette';
    palette.style.cssText =
      'background:rgba(22,24,30,0.98);backdrop-filter:blur(20px);' +
      'border:1px solid rgba(255,255,255,0.1);border-radius:14px;' +
      'padding:16px;width:420px;max-height:70vh;overflow-y:auto;' +
      'box-shadow:0 20px 60px rgba(0,0,0,0.5);';

    // 搜索框
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '搜索组件…';
    searchInput.style.cssText =
      'width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);' +
      'border-radius:8px;padding:8px 12px;color:white;font-size:13px;outline:none;' +
      'box-sizing:border-box;margin-bottom:12px;';
    palette.appendChild(searchInput);

    var list = document.createElement('div');
    list.id = 'component-list';

    function renderList(keyword) {
      list.innerHTML = '';
      var kw = keyword ? keyword.toLowerCase() : '';
      COMPONENTS.forEach(function(comp) {
        if (kw && comp.label.toLowerCase().indexOf(kw) < 0 && comp.id.indexOf(kw) < 0) return;
        var item = document.createElement('div');
        item.style.cssText =
          'display:flex;align-items:center;justify-content:space-between;' +
          'padding:6px 8px;border-radius:6px;cursor:pointer;color:#D1D5DB;' +
          'font-size:12px;transition:background 0.1s;';
        item.innerHTML = '<span>' + comp.label + '</span><span style="color:#4B5563;font-size:10px;">' + comp.desc + '</span>';
        item.addEventListener('mouseenter', function() { this.style.background = 'rgba(255,255,255,0.06)'; });
        item.addEventListener('mouseleave', function() { this.style.background = ''; });
        item.addEventListener('click', function() {
          overlay.remove();
          renderComponent(comp.id);
        });
        list.appendChild(item);
      });
    }

    searchInput.addEventListener('input', function() { renderList(this.value); });
    palette.appendChild(list);
    overlay.appendChild(palette);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });

    setTimeout(function() { searchInput.focus(); }, 50);
    renderList('');
  };

  // ---- 双击画布空白打开组件面板 ----
  var viewport = document.getElementById('canvas-viewport');
  if (viewport) {
    viewport.addEventListener('dblclick', function(e) {
      // 只在空白区域触发
      if (!e.target.closest('.canvas-section') && !e.target.closest('.canvas-placed-component') && !e.target.closest('.ctrl-btn')) {
        CanvasComponents.showPalette();
      }
    });
  }

  console.log('[CanvasComponents] 组件系统已初始化');
})();
```

---

### Task 9: 修复 site/index.html 中的 Live Preview 代码

**Note:** 之前分析时发现 `site/index.html` 没有 Live Preview 的 WebSocket 代码（已被回退）。因为用户说"不引入新东西"，这个暂时不加。但如果需要，这里预留观察。

**不执行此 Task** — 超出范围。

---

### Task 10: 验证完整性

**Files:**
- Run: `site/infinite-canvas-demo.html` 在浏览器中

- [ ] **Step 1: 验证 HTML 中所有 JS/CSS 引用已存在**

运行：
```bash
cd /c/Users/shanmu/Desktop/sill/site && ls -la js/canvas-*.js js/color-*.js css/canvas-demo.css
```

Expected: 所有文件都存在

- [ ] **Step 2: 打开页面测试**

运行：
```bash
start "" "C:\Users\shanmu\Desktop\sill\site\infinite-canvas-demo.html"
```

检查：
- 画布网格背景可见
- 拖拽平移正常工作
- 滚轮缩放正常工作
- 色板、排版、组件、间距 4 个区块渲染正确
- 控制栏按钮功能正常

- [ ] **Step 3: 检查浏览器控制台无错误**

打开 DevTools Console，确认无 404 错误和 JS 异常。

- [ ] **Step 4: 验证 Token 修复**

在 `index.html` 中打开，确认暗色模式切换后导航栏样式正确（`--nav-height` 补全后）。

- [ ] **Step 5: Commit**

```bash
cd /c/Users/shanmu/Desktop/sill
git add site/css/tokens.css site/css/tokens.json site/css/canvas-demo.css site/js/canvas-engine.js site/js/canvas-content.js site/js/color-utils.js site/js/color-wheel.js site/js/property-panel.js site/js/canvas-components.js
git commit -m "fix: restore 7 canvas files and fix invalid token values

- Restore 6 JS files for infinite-canvas-demo (engine, content, utils, wheel, panel, components)
- Restore canvas-demo.css
- Fix invalid spacing token values (39-44px → 44px, etc.)
- Fix invalid breakpoint token (-- → 1440px)
- Add missing --nav-height and --nav-height-mobile variables
- Sync tokens.json with fixes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
