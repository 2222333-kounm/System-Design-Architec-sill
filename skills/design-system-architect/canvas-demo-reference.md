# 无限画布演示页 — 生成指南

> 从 DESIGN.md 生成交互式设计系统视觉浏览器

## 概述

在 DESIGN.md 生成后，可以额外输出一个 **无限画布演示页**，将 Design Token 体系以可拖拽/缩放的自由画布形式呈现。用户通过平移和缩放自由探索设计系统的色彩、排版、组件和布局规范。

## 前置条件

- `DESIGN.md` 已生成
- `css/tokens.css` 已生成（使用 `extract-tokens.js css` 命令）
- `site/js/canvas-engine.js` — 画布核心引擎（通用模板，可直接复用）
- `site/js/canvas-content.js` — Token 动态渲染器（通用模板，可直接复用）

## 生成文件

| 文件 | 是否模板 | 说明 |
|------|----------|------|
| `infinite-canvas-demo.html` | ❌ 每次生成 | 主页面，内容和布局基于 DESIGN.md |
| `css/canvas-demo.css` | ❌ 每次生成 | 画布样式，颜色/字体从 DESIGN.md 提取 |
| `js/canvas-engine.js` | ✅ 复用 | 画布核心引擎 (v2)，无需修改 |
| `js/canvas-content.js` | ✅ 复用 | Token 动态渲染器 (v2)，无需修改 |

## 生成步骤

### Step 1: 复制通用引擎脚本

```bash
# canvas-engine.js 和 canvas-content.js 已位于 site/js/ 目录
# 如果使用本 skill 时需在新项目中部署，从 site/js/ 复制到目标项目：
cp site/js/canvas-engine.js <目标项目>/js/
cp site/js/canvas-content.js <目标项目>/js/
```

- `site/js/canvas-engine.js` — 负责平移/缩放/重置/手势/键盘快捷键
- `site/js/canvas-content.js` — 从 `tokens.css` 的 CSS 变量读取色值/字号/间距并注入 DOM

### Step 2: 生成 canvas-demo.css

从 DESIGN.md 提取关键 Token 值生成画布样式。核心变量映射：

```css
/* 使用 DESIGN.md 中的颜色 Token */
.canvas-section h2 {
  border-left-color: var(--color-primary-500);
}

.canvas-demo-btn-primary {
  background: var(--color-button-primary, /* 从 DESIGN.md 提取的主色 */ #0071E3);
  color: #FFFFFF;
}

/* 间距使用 Token */
.canvas-controls {
  padding: 10px 20px;
  border-radius: var(--radius-full, /* 从 DESIGN.md 提取的胶囊圆角 */ 980px);
}
```

**样式结构**（520 行，按节组织）：

1. **控制栏** — 固定底部居中，毛玻璃效果，缩放按钮 + 比例显示 + 快捷键提示
2. **视口/舞台** — `overflow: hidden` 视口容器，`transform-origin: 0 0` 舞台
3. **网格背景** — 使用 `repeating-linear-gradient` 实现无限网格感
4. **内容卡片** — 毛玻璃半透明卡片（暗色主题），hover 发光边框
5. **色板展示** — 品牌色阶、中性色、语义色 chip 组件
6. **排版演示** — 层级预览（Hero/Display/Headline/Body/Caption）
7. **组件预览** — 按钮、导航栏、卡片示意
8. **页面结构图** — 线框示意图
9. **间距可视化** — 横向长度条 + Token 标签
10. **移动端适配** — 控制栏缩小，卡片宽度自适应

### Step 3: 生成 infinite-canvas-demo.html

构建主页面 HTML，包含 6 个内容区域映射自 DESIGN.md 的 6 个章节：

| 区域 | 位置 | 对应 DESIGN.md 章节 | 内容 |
|------|------|---------------------|------|
| ① 标题区 | (80, 80) | — | 项目名称 + Design Token 动态加载信息 |
| ② 色板区 | (80, 280) | 章节 2·颜色系统 | 品牌色 5 级色阶 + 中性色 + 语义色 |
| ③ 排版区 | (80, 750) | 章节 3·排版系统 | 5 级字号层级 + 字体家族信息 |
| ④ 组件区 | (620, 280) | 章节 4·组件样式 | 按钮（主/次/轮廓）+ 导航 + 卡片 |
| ⑤ 布局图 | (620, 750) | 章节 5·布局原则 | 页面结构线框示意 |
| ⑥ 间距区 | (620, 1120) | 章节 5·间距系统 | 5 级间距 Token 可视化 |

**布局规则：**

- 双列布局，左侧宽 400-480px，右侧宽 400-480px
- 每列内部卡片纵向间距 30-50px，列间距 40px
- 卡片使用 DESIGN.md 中定义的圆角 Token
- 标题区特殊处理：大字标题 + 渐变文字效果

**HTML 结构要点：**

```html
<!-- 固定控制栏 — position: fixed，不参与变换 -->
<div class="canvas-controls">
  <button data-action="zoom-out">−</button>
  <span id="scaleDisplay">100%</span>
  <button data-action="zoom-in">+</button>
  <button data-action="reset">⌂ 重置</button>
  <span><kbd>Space</kbd>+拖拽 · <kbd>⌘</kbd>+滚轮</span>
  <a href="index.html">← 返回首页</a>
</div>

<!-- 视口 — overflow: hidden，裁剪区域 -->
<div id="canvas-viewport">
  <!-- 舞台 — transform 变换层 -->
  <div id="canvas-stage">
    <!-- 网格背景 -->
    <div class="canvas-grid"></div>
    <!-- 内容层（绝对定位） -->
    <div class="canvas-content">
      <!-- 各卡片区：position: absolute; left; top -->
    </div>
  </div>
</div>

<script src="js/canvas-engine.js"></script>
<script src="js/canvas-content.js"></script>
```

### Step 4: 验证

在浏览器中打开 `infinite-canvas-demo.html` 确认：

- [ ] 页面加载后自动居中所有内容卡片
- [ ] 鼠标拖拽背景可以平移画布
- [ ] 滚轮以鼠标指针为中心缩放
- [ ] 缩放比例显示在底部控制栏
- [ ] `+` / `-` / `R` 键盘快捷键正常工作
- [ ] 控制栏不受画布变换影响（固定定位）
- [ ] 色板值从 `tokens.css` 动态读取（非硬编码）
- [ ] 移动端双指捏合缩放 + 拖拽可用
- [ ] 「返回首页」链接指向项目原入口

## 依赖文件

`canvas-engine.js` 和 `canvas-content.js` 是通用脚本，可跨项目复用。它们存储在 `site/css/` 目录下，每次生成无限画布时直接复制即可。

### canvas-engine.js 功能清单 (v2)

- DOM 引用：`#canvas-viewport`, `#canvas-stage`, `#scaleDisplay`
- 缩放范围：0.15x – 5x
- 平移方式：鼠标左键拖拽 + 单指拖拽
- **惯性滑动**：拖拽松手后减速滑动，手感更顺滑（衰减系数 0.92）
- **状态持久化**：视图位置自动保存到 `localStorage`，刷新/重新打开后恢复
- 缩放方式：滚轮（以鼠标为中心）+ 双指捏合 + Ctrl+/- 快捷键，触控板自动平滑
- **缩放反馈**：缩放比例数字脉冲动画提示
- 重置方式：自动计算所有 `.canvas-section` + `.floating-tag` 的边界框，居中显示
- 过渡动画：重置视图时使用 cubic-bezier(0.22, 1, 0.36, 1) 缓动
- 防交互穿透：点击按钮/链接等可交互元素时不会触发画布拖拽
- 窗口尺寸变化：主要内容移出视口时自动重置

### canvas-content.js 功能清单 (v2)

- 读取 `tokens.css` 中定义的 CSS 变量（`getComputedStyle(document.documentElement).getPropertyValue('--' + name)`）
- 品牌色阶：`--color-primary-50` 到 `--color-primary-900`（5 级色阶 chip 展示）
- 中性色：`--color-neutral-50` 到 `--color-neutral-900`（5 级色阶 chip 展示）
- **辅助色板**：`--color-secondary-500`, `--color-accent-500`, `--color-success-500` 等 6 色
- 语义色：`--color-bg-primary`, `--color-button-primary` 等（dot + label 展示）
- 字号：`--font-size-hero` 到 `--font-size-caption`（含实际字号 + 文本预览）
- 间距：`--spacing-xs` 到 `--spacing-xl`（范围值如 `39-44px` 取数值，长度条可视化）
- 字体家族：`--font-family-cn` 显示在页面注脚

## 常见问题

### Q: 画布页面与原有 index.html 冲突吗？
不冲突。`infinite-canvas-demo.html` 是独立文件，通过「返回首页」链接与 `index.html` 互通。`canvas-demo.css` 使用 `.canvas-*` 类名前缀，不会污染主页样式。

### Q: 如何自定义画布内容？
在 HTML 中直接修改 `.canvas-section` 卡片的内容文本和位置坐标（`left` / `top`）。内容从 DESIGN.md 的对应章节获取。

### Q: 画布支持哪些浏览器？
现代浏览器（Chrome 90+, Firefox 90+, Safari 15+, Edge 90+）。需要支持 `backdrop-filter`、CSS Grid、`touch events`。

---

## Live Editor — 实时编辑与同步

从 v2.0 开始，画布支持 **实时编辑模式**，配合 Node.js 服务端实现"改画布 → 输出页即时同步"。

### 启动方式

```bash
cd site
npm install
node server.js
# 打开 http://localhost:3000/studio.html
```

### 架构

```
site/server.js (Express + WebSocket + Multer)
  │
  ├── 静态托管 site/ 目录
  ├── POST /api/update-token    改色值/字体/间距 → 写 tokens.css + 广播
  ├── POST /api/update-tokens   批量更新 Token
  ├── POST /api/upload-image    上传图片文件
  ├── POST /api/upload-image-base64  base64 图片上传
  ├── GET  /api/tokens          获取所有 Token
  ├── GET  /api/health          健康检查
  └── WebSocket 广播变更到所有客户端

studio.html (分屏视图)
  ├── 左: 画布编辑器 (iframe + ?mode=edit)
  │    ├── 点击色块 → 颜色拾色器 → 即时更新
  │    ├── 点击图片 → 文件选择器 → 上传替换
  │    └── WebSocket 发送变更
  └── 右: 输出预览 (iframe + ?mode=preview)
       └── WebSocket 接收 → 更新 CSS 变量 / 图片

数据流:
  用户改色块 → 本地即时生效
            → POST /api/update-token → 写 tokens.css
            → WebSocket 广播
            → index.html 收到 → setProperty('--color', newVal)
            → 右侧页面实时变色
```

### 编辑模式功能

| 交互 | 操作 | 效果 |
|------|------|------|
| 点击色块 | 弹出系统颜色拾色器 | 色块、面板、右侧预览即时变色 |
| 点击图片 | 选择本地图片文件 | 图片替换，上传到 `images/uploads/` |
| 修改色值 | 拾色器拖动或输入 | `tokens.css` 持久化保存 |
| 拖拽视图 | 鼠标/触控 | 不影响编辑状态 |

### 新增 / 修改文件

| 文件 | 说明 |
|------|------|
| `server.js` | 🆕 Express + WebSocket 服务端 |
| `package.json` | 🆕 依赖: express, ws, multer, cors |
| `studio.html` | 🆕 分屏编辑器 + 预览 |
| `js/canvas-content.js` | 🔄 新增 `mode=edit` 编辑交互 + WebSocket 发送 |
| `css/canvas-demo.css` | 🔄 新增编辑模式样式 (editable-chip, editable-image-area) |
| `infinite-canvas-demo.html` | 🔄 新增编辑模式指示 + 图片替换区域 |
| `index.html` | 🔄 新增 `mode=preview` WebSocket 接收端 |
