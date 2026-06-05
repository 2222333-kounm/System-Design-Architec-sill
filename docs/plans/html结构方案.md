<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>设计系统 · 无限画布浏览器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none; /* 避免拖拽时选中文本，提升画布拖动体验 */
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif;
      background: #111315;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: fixed;
    }

    /* ========= 控制栏 (固定层) ========= */
    .canvas-controls {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      background: rgba(30, 32, 38, 0.85);
      backdrop-filter: blur(16px);
      padding: 10px 20px;
      border-radius: 60px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      font-weight: 500;
    }

    .ctrl-btn {
      background: rgba(20, 22, 27, 0.9);
      border: none;
      color: #eef2ff;
      font-size: 1.2rem;
      font-weight: 600;
      width: 40px;
      height: 40px;
      border-radius: 32px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      backdrop-filter: blur(4px);
      border: 0.5px solid rgba(255,255,255,0.15);
    }

    .ctrl-btn:active {
      transform: scale(0.94);
      background: #2d3748;
    }

    .ctrl-btn[data-action="reset"] {
      width: auto;
      padding: 0 18px;
      gap: 6px;
      font-size: 0.9rem;
    }

    .ctrl-scale {
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      padding: 0 16px;
      border-radius: 32px;
      font-size: 0.9rem;
      font-weight: 500;
      color: white;
      display: inline-flex;
      align-items: center;
      letter-spacing: 0.5px;
      border: 0.5px solid rgba(255,255,255,0.2);
      font-family: monospace;
    }

    /* ========= 视口 (裁剪区域) ========= */
    #canvas-viewport {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: grab;
      background: #16181c;
    }

    #canvas-viewport.dragging {
      cursor: grabbing;
    }

    /* ========= 舞台 (变换层) ========= */
    #canvas-stage {
      transform-origin: 0 0;
      will-change: transform;
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* 无限网格背景 (随舞台移动缩放) */
    .canvas-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(to right, rgba(70, 80, 100, 0.35) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(70, 80, 100, 0.35) 1px, transparent 1px);
      background-size: 30px 30px;
      pointer-events: none;
      z-index: 0;
    }

    /* 内容容器 (相对定位基准) */
    .canvas-content {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 1200px;
      min-width: 1600px;
      z-index: 2;
    }

    /* 全局区块卡片样式 */
    .canvas-section {
      position: absolute;
      background: rgba(22, 24, 30, 0.75);
      backdrop-filter: blur(12px);
      border-radius: 32px;
      padding: 24px 28px;
      box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06);
      transition: box-shadow 0.2s;
      min-width: 340px;
      max-width: 520px;
      border: 1px solid rgba(255,255,255,0.08);
      color: #f0f3fa;
    }

    .canvas-section:hover {
      box-shadow: 0 25px 40px -14px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(100, 150, 255, 0.3);
    }

    .canvas-section h2 {
      font-size: 1.6rem;
      font-weight: 600;
      margin-bottom: 20px;
      letter-spacing: -0.3px;
      background: linear-gradient(135deg, #ffffff, #b9c7ff);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      border-left: 4px solid #3b82f6;
      padding-left: 16px;
    }

    .canvas-section h1 {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(130deg, #FFFFFF, #90a9ff);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 8px;
    }

    .canvas-subtitle {
      font-size: 0.9rem;
      color: #9ca3af;
      margin-top: 8px;
      letter-spacing: 0.3px;
    }

    /* 品牌色板网格 */
    .palette-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .color-family {
      margin-bottom: 8px;
    }

    .color-family h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9aa4bf;
      margin-bottom: 10px;
    }

    .color-steps {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .color-chip {
      flex: 1;
      min-width: 56px;
      background: #2d2f36;
      border-radius: 16px;
      overflow: hidden;
      text-align: center;
      transition: transform 0.1s ease;
    }

    .color-badge {
      height: 56px;
      width: 100%;
    }

    .color-value {
      padding: 8px 4px;
      font-size: 0.7rem;
      font-weight: 500;
      background: rgba(0, 0, 0, 0.4);
      font-family: monospace;
    }

    /* 语义色行 */
    .semantic-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .semantic-item {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .semantic-dot {
      width: 20px;
      height: 20px;
      border-radius: 20px;
    }

    /* 排版演示 */
    .type-scale {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .type-item {
      border-bottom: 1px dashed rgba(255,255,255,0.15);
      padding-bottom: 12px;
    }
    .type-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: #7e8aa2;
      letter-spacing: 1px;
    }
    .type-demo {
      margin-top: 8px;
      font-weight: 500;
    }
    .hero-demo { font-size: 2.8rem; font-weight: 800; line-height: 1.2; }
    .display-demo { font-size: 2rem; font-weight: 700; }
    .headline-demo { font-size: 1.5rem; font-weight: 600; }
    .body-demo { font-size: 1rem; font-weight: 400; }
    .caption-demo { font-size: 0.75rem; color: #b9c2d4; }

    /* 组件预览区 */
    .component-showcase {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .button-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ds-btn {
      padding: 10px 20px;
      border-radius: 60px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.85rem;
    }
    .ds-btn-primary {
      background: #3b82f6;
      color: white;
      box-shadow: 0 2px 6px rgba(59,130,246,0.3);
    }
    .ds-btn-secondary {
      background: rgba(255,255,255,0.12);
      color: #e2e8ff;
      border: 0.5px solid rgba(255,255,255,0.2);
    }
    .ds-btn-outline {
      background: transparent;
      border: 1px solid #3b82f6;
      color: #90b4ff;
    }
    .nav-demo {
      display: flex;
      gap: 24px;
      background: rgba(0,0,0,0.3);
      padding: 12px 20px;
      border-radius: 60px;
    }
    .nav-item {
      font-size: 0.85rem;
      font-weight: 500;
      color: #cbd5e6;
    }

    /* 页面结构示意图 */
    .wireframe {
      background: #0f1117;
      border-radius: 24px;
      padding: 16px;
      margin-top: 12px;
    }
    .wf-header {
      background: #1e293b;
      height: 48px;
      border-radius: 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
    }
    .wf-sidebar {
      background: #111827;
      width: 100px;
      height: 140px;
      border-radius: 16px;
    }
    .wf-content {
      background: #1e293b;
      flex: 1;
      border-radius: 16px;
      height: 140px;
    }
    .wf-row {
      display: flex;
      gap: 16px;
    }
    .wf-meta {
      font-size: 0.7rem;
      color: #6c7a91;
      margin-top: 12px;
      text-align: center;
    }

    /* 工具类 */
    .note-text {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 12px;
    }
  </style>
</head>
<body>

<div class="canvas-controls">
  <button class="ctrl-btn" data-action="zoom-out" title="缩小">−</button>
  <span class="ctrl-scale">100%</span>
  <button class="ctrl-btn" data-action="zoom-in" title="放大">+</button>
  <button class="ctrl-btn" data-action="reset" title="重置视图">⌂ 重置</button>
</div>

<div id="canvas-viewport">
  <div id="canvas-stage">
    <div class="canvas-grid"></div>
    <div class="canvas-content">

      <!-- ① 标题区 -->
      <header class="canvas-section" style="left: 80px; top: 80px;">
        <h1>🎨 Design System · 无限画布</h1>
        <p class="canvas-subtitle">从 DESIGN.md 自动映射的交互式设计规范浏览器 — 自由缩放/拖拽探索</p>
        <div class="note-text">✨ 鼠标拖拽平移 | 滚轮缩放 | 实时响应设计令牌</div>
      </header>

      <!-- ② 品牌色板 + 语义色彩 -->
      <section class="canvas-section palette-section" style="left: 80px; top: 280px; min-width: 380px;">
        <h2>颜色系统</h2>
        <div class="palette-grid">
          <div class="color-family">
            <h4>🔵 品牌主色 · 5级色阶</h4>
            <div class="color-steps">
              <div class="color-chip"><div class="color-badge" style="background:#3b82f6;"></div><div class="color-value">500 #3B82F6</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#2563eb;"></div><div class="color-value">600 #2563EB</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#1d4ed8;"></div><div class="color-value">700 #1D4ED8</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#60a5fa;"></div><div class="color-value">400 #60A5FA</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#93c5fd;"></div><div class="color-value">300 #93C5FD</div></div>
            </div>
          </div>
          <div class="color-family">
            <h4>⚫ 中性色 (灰度)</h4>
            <div class="color-steps">
              <div class="color-chip"><div class="color-badge" style="background:#1e1f24;"></div><div class="color-value">900</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#2d2f36;"></div><div class="color-value">700</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#6b7280;"></div><div class="color-value">500</div></div>
              <div class="color-chip"><div class="color-badge" style="background:#d1d5db;"></div><div class="color-value">300</div></div>
            </div>
          </div>
          <div class="color-family">
            <h4>✨ 语义颜色 (亮色/暗色模式适配)</h4>
            <div class="semantic-row">
              <div class="semantic-item"><div class="semantic-dot" style="background:#22c55e;"></div>Success</div>
              <div class="semantic-item"><div class="semantic-dot" style="background:#ef4444;"></div>Error</div>
              <div class="semantic-item"><div class="semantic-dot" style="background:#eab308;"></div>Warning</div>
              <div class="semantic-item"><div class="semantic-dot" style="background:#3b82f6;"></div>Info</div>
            </div>
            <div class="semantic-row">
              <div class="semantic-item"><div class="semantic-dot" style="background:#f9fafb;"></div>Bg Surface</div>
              <div class="semantic-item"><div class="semantic-dot" style="background:#3b82f6;"></div>Primary Button</div>
              <div class="semantic-item"><div class="semantic-dot" style="background:#4b5563;"></div>Border Default</div>
            </div>
          </div>
        </div>
        <div class="note-text">🎨 基于 DESIGN.md 色阶 + 语义令牌，动态映射至组件</div>
      </section>

      <!-- ③ 排版系统 -->
      <section class="canvas-section typography-section" style="left: 80px; top: 700px;">
        <h2>排版系统</h2>
        <div class="type-scale">
          <div class="type-item"><div class="type-label">Hero / 巨型标题</div><div class="type-demo hero-demo">设计无限</div></div>
          <div class="type-item"><div class="type-label">Display / 展示级</div><div class="type-demo display-demo">Display 2rem</div></div>
          <div class="type-item"><div class="type-label">Headline / 标题</div><div class="type-demo headline-demo">Headline 语义层级</div></div>
          <div class="type-item"><div class="type-label">Body / 正文</div><div class="type-demo body-demo">设计系统核心文本流，清晰可读，行距舒适。</div></div>
          <div class="type-item"><div class="type-label">Caption / 辅助说明</div><div class="type-demo caption-demo">辅助信息、注解和元数据。</div></div>
        </div>
        <div class="note-text">📐 字体家族: Inter, 遵循 8pt 网格系统, 比率 1.25</div>
      </section>

      <!-- ④ 组件展示区 -->
      <section class="canvas-section component-section" style="left: 620px; top: 280px; min-width: 380px;">
        <h2>组件预览</h2>
        <div class="component-showcase">
          <div>
            <div class="type-label" style="margin-bottom: 8px;">Buttons</div>
            <div class="button-group">
              <button class="ds-btn ds-btn-primary">主要按钮</button>
              <button class="ds-btn ds-btn-secondary">次要按钮</button>
              <button class="ds-btn ds-btn-outline">轮廓按钮</button>
            </div>
          </div>
          <div>
            <div class="type-label" style="margin-bottom: 8px;">导航 / 标签页</div>
            <div class="nav-demo">
              <span class="nav-item">设计语言</span>
              <span class="nav-item">组件库</span>
              <span class="nav-item">颜色</span>
              <span class="nav-item">图标集</span>
            </div>
          </div>
          <div>
            <div class="type-label" style="margin-bottom: 8px;">轻量卡片示意</div>
            <div style="background:rgba(255,255,255,0.05); border-radius: 20px; padding: 14px;">
              <div style="font-weight:600">设计令牌映射</div>
              <div style="font-size:0.75rem; margin-top: 6px;">自动关联 DESIGN.md 元数据</div>
            </div>
          </div>
        </div>
        <div class="note-text">⚡ 交互组件实时响应，拖拽画布任意查看细节</div>
      </section>

      <!-- ⑤ 页面结构布局图 -->
      <section class="canvas-section layout-section" style="left: 620px; top: 700px;">
        <h2>页面结构</h2>
        <div class="wireframe">
          <div class="wf-header"><span style="background:#334155; width:30px;height:8px;border-radius:12px;"></span><span style="background:#334155; width:80px;height:8px;border-radius:12px;"></span></div>
          <div class="wf-row">
            <div class="wf-sidebar"></div>
            <div class="wf-content"></div>
          </div>
          <div class="wf-meta">└ 布局规范: 侧边栏 + 内容区 | 响应式断点</div>
        </div>
        <div style="margin-top: 18px;">
          <div class="type-label" style="margin-bottom:6px;">📐 栅格 / 间距</div>
          <div style="display: flex; gap: 6px; flex-wrap:wrap;">
            <span style="background:#2d2f36; padding:4px 12px; border-radius: 18px;">4px</span>
            <span style="background:#2d2f36; padding:4px 12px; border-radius: 18px;">8px</span>
            <span style="background:#2d2f36; padding:4px 12px; border-radius: 18px;">16px</span>
            <span style="background:#2d2f36; padding:4px 12px; border-radius: 18px;">24px</span>
            <span style="background:#2d2f36; padding:4px 12px; border-radius: 18px;">32px</span>
          </div>
        </div>
        <div class="note-text">🏗️ 源自 DESIGN.md 页面架构定义 (Layout blueprint)</div>
      </section>

      <!-- 额外装饰块: 让画布更自由 展示无限感 -->
      <div style="position: absolute; left: 1100px; top: 150px; background: rgba(59,130,246,0.2); backdrop-filter: blur(16px); border-radius: 48px; padding: 16px 24px; border: 1px solid rgba(255,255,255,0.2);">
        <span style="font-size: 0.8rem;">✨ 拖拽探索 · 无限延伸</span>
      </div>
      <div style="position: absolute; left: 1100px; top: 900px; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); border-radius: 28px; padding: 12px 20px;">
        <span style="font-size:0.7rem;">🎯 设计系统 无缝集成</span>
      </div>

    </div>
  </div>
</div>

<script>
  (function(){
    // DOM 元素
    const viewport = document.getElementById('canvas-viewport');
    const stage = document.getElementById('canvas-stage');
    const scaleSpan = document.querySelector('.ctrl-scale');
    
    // 画布状态
    let scale = 1;
    let panX = 0;
    let panY = 0;
    
    // 拖拽状态
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragStartPan = { x: 0, y: 0 };
    
    // 缩放限制
    const MIN_SCALE = 0.2;
    const MAX_SCALE = 4;
    
    // 更新变换 & UI
    function updateTransform() {
      stage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      scaleSpan.innerText = `${Math.round(scale * 100)}%`;
    }
    
    // 获取视图中心（基于 viewport 中心点）
    function getViewportCenter() {
      return { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    }
    
    // 以指定点(clientX,clientY) 为缩放中心进行缩放 (delta: 缩放增量, direction: in/out)
    function zoomAtPoint(clientX, clientY, deltaScale) {
      let newScale = scale * deltaScale;
      if (newScale < MIN_SCALE) newScale = MIN_SCALE;
      if (newScale > MAX_SCALE) newScale = MAX_SCALE;
      if (newScale === scale) return;
      
      // 获取鼠标相对于 viewport 的位置
      const mouseX = clientX;
      const mouseY = clientY;
      // 计算鼠标在 stage 坐标系中的位置 (未应用 transform 时的绝对坐标)
      // 公式: stageCoord = (clientCoord - pan) / scale
      const stageX = (mouseX - panX) / scale;
      const stageY = (mouseY - panY) / scale;
      
      // 应用新缩放后，需要使得鼠标位置对应的 stage 点不变
      // 新 pan = clientCoord - newScale * stageCoord
      const newPanX = mouseX - newScale * stageX;
      const newPanY = mouseY - newScale * stageY;
      
      panX = newPanX;
      panY = newPanY;
      scale = newScale;
      updateTransform();
    }
    
    // 缩放增量 (统一接口)
    function zoomInAtCenter() {
      const center = getViewportCenter();
      zoomAtPoint(center.x, center.y, 1.2);
    }
    
    function zoomOutAtCenter() {
      const center = getViewportCenter();
      zoomAtPoint(center.x, center.y, 0.83333);
    }
    
    // 重置视图: 使主要内容区域居中于视口 (基于所有.canvas-section的边界框)
    function resetView() {
      // 收集所有内容区域元素（绝对定位区块）
      const sections = Array.from(document.querySelectorAll('.canvas-section'));
      if (sections.length === 0) {
        scale = 1;
        panX = 0;
        panY = 0;
        updateTransform();
        return;
      }
      
      // 计算边界框 (stage 坐标系, 即 left/top 定位值 + 宽高)
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      sections.forEach(section => {
        const left = parseFloat(section.style.left);
        const top = parseFloat(section.style.top);
        const rect = section.getBoundingClientRect();
        // 但因为 stage 有 transform，我们需要获取相对于 stage 原始坐标系的边界。
        // 由于 stage 目前的变换, getBoundingClientRect 是变换后的，所以不能直接用。
        // 更准确：直接基于 style left/top 以及 offsetWidth/offsetHeight（未变换前的尺寸）。
        const width = section.offsetWidth;
        const height = section.offsetHeight;
        if (!isNaN(left) && !isNaN(top)) {
          minX = Math.min(minX, left);
          minY = Math.min(minY, top);
          maxX = Math.max(maxX, left + width);
          maxY = Math.max(maxY, top + height);
        }
      });
      
      // 额外手动包含额外自由块(如旁边小卡片)
      const extraItems = document.querySelectorAll('.canvas-content > div:not(.canvas-section)');
      extraItems.forEach(el => {
        const left = parseFloat(el.style.left);
        const top = parseFloat(el.style.top);
        if (!isNaN(left) && !isNaN(top)) {
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          minX = Math.min(minX, left);
          minY = Math.min(minY, top);
          maxX = Math.max(maxX, left + w);
          maxY = Math.max(maxY, top + h);
        }
      });
      
      if (!isFinite(minX)) {
        scale = 1;
        panX = 0;
        panY = 0;
        updateTransform();
        return;
      }
      
      // 内容总宽高
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const viewW = viewport.clientWidth;
      const viewH = viewport.clientHeight;
      
      // 计算最佳缩放比例 (保留边距，0.9 留出边框呼吸感)
      let fitScale = Math.min(viewW / (contentWidth + 80), viewH / (contentHeight + 80));
      fitScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, fitScale));
      // 保持重置时尽量不改变用户预期过大，我们最好重置scale为拟合值但不超过1.2, 维持1也可以，但更友好: 让内容完整显示
      // 但是为了习惯，更优雅：设置scale为 fitScale (但不能太大也不能太小)
      scale = Math.min(1.6, Math.max(0.6, fitScale));
      
      // 计算偏移使内容区居中于视口
      const contentCenterX = (minX + maxX) / 2;
      const contentCenterY = (minY + maxY) / 2;
      const viewCenterX = viewW / 2;
      const viewCenterY = viewH / 2;
      panX = viewCenterX - contentCenterX * scale;
      panY = viewCenterY - contentCenterY * scale;
      
      updateTransform();
    }
    
    // ----- 鼠标拖拽平移逻辑 -----
    function onMouseDown(e) {
      // 如果点击的元素是可交互控件(按钮、控制栏内部或任何按钮), 不应触发拖拽。
      const target = e.target.closest('.ctrl-btn, .ds-btn, button, .nav-item, .ctrl-scale, .semantic-item, .color-chip');
      if (target) return;
      e.preventDefault();
      isDragging = true;
      viewport.classList.add('dragging');
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
      dragStartPan.x = panX;
      dragStartPan.y = panY;
    }
    
    function onMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      panX = dragStartPan.x + dx;
      panY = dragStartPan.y + dy;
      updateTransform();
    }
    
    function onMouseUp(e) {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('dragging');
    }
    
    // 滚轮缩放 (以鼠标坐标为中心)
    function onWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.92 : 1.08; // 向下滚缩小，向上滚放大
      zoomAtPoint(e.clientX, e.clientY, delta);
    }
    
    // 按钮事件绑定
    function bindControls() {
      const zoomInBtn = document.querySelector('[data-action="zoom-in"]');
      const zoomOutBtn = document.querySelector('[data-action="zoom-out"]');
      const resetBtn = document.querySelector('[data-action="reset"]');
      if (zoomInBtn) zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); zoomInAtCenter(); });
      if (zoomOutBtn) zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); zoomOutAtCenter(); });
      if (resetBtn) resetBtn.addEventListener('click', (e) => { e.stopPropagation(); resetView(); });
    }
    
    // 初始化事件以及窗口大小适配 (重置居中一次，但避免干扰现有拖拽)
    function init() {
      bindControls();
      viewport.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      viewport.addEventListener('wheel', onWheel, { passive: false });
      // 避免由于内容图片或滚动导致页面滚动
      window.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // 初始视图: 使画布自动居中于主要设计区域
      setTimeout(() => {
        resetView();
      }, 100);
      
      // 窗口大小改变时重新调整偏移, 保持视觉比例 (保持相对位置不失效可简单重新reset，也可平滑调整)
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          // 重新调整使内容保持在视野内 (防止内容跑出边界)
          // 但不强制完全重置，而是智能微调避免内容飞出
          const sections = document.querySelectorAll('.canvas-section');
          if (sections.length) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            sections.forEach(sec => {
              const left = parseFloat(sec.style.left);
              const top = parseFloat(sec.style.top);
              const w = sec.offsetWidth, h = sec.offsetHeight;
              if (!isNaN(left)) { minX = Math.min(minX, left); maxX = Math.max(maxX, left + w); }
              if (!isNaN(top)) { minY = Math.min(minY, top); maxY = Math.max(maxY, top + h); }
            });
            if (isFinite(minX)) {
              const viewW = viewport.clientWidth, viewH = viewport.clientHeight;
              const currentViewLeft = -panX / scale;
              const currentViewRight = currentViewLeft + viewW / scale;
              const currentViewTop = -panY / scale;
              const currentViewBottom = currentViewTop + viewH / scale;
              // 如果主要内容偏离视口太多，轻微重置位置但不改变缩放: 确保核心区域在视野内
              if (currentViewRight < minX || currentViewLeft > maxX || currentViewBottom < minY || currentViewTop > maxY) {
                resetView();haoshishi
              }
            }
          }
        }, 200);
      });
    }
    
    init();
  })();
</script>
</body>
</html>