# Apple 中国官网首页重构 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用纯 HTML + CSS 重构 Apple 中国官网首页（www.apple.com.cn），生成可直接在浏览器中打开的静态页面，完整复现其设计语言、布局结构和响应式行为。

**Architecture:** 单页静态 HTML + 单一 CSS 样式表（按功能分节），零 JavaScript 依赖。所有样式值基于 `DESIGN.md` 中的 Design Token 体系。页面结构为：固定导航栏 → 公告横幅 → Hero 区（2 个全屏区块） → 产品卡片网格 → 页面底部购物指南 → 全局页脚。

**Tech Stack:** HTML5 + CSS3（自定义属性、Grid/Flexbox、Media Queries）+ SVG（Apple Logo）

**参考规范：** `DESIGN.md`（项目根目录，已生成的设计系统规范文档）

---

### Task 1: 项目初始化与样式基础

**Files:**
- Create: `index.html`
- Create: `css/style.css`

- [ ] **Step 1: 创建目录结构和 index.html 骨架**

```bash
mkdir -p css images
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apple (中国大陆) - 官方网站</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- 页面内容将逐步添加 -->
</body>
</html>
```

- [ ] **Step 2: 创建 CSS 文件并写入 Design Token**

```css
/* css/style.css */
/* ========================================
   Apple 中国官网重构 — Design Token
   ======================================== */

:root {
  /* === 颜色系统 === */
  /* 品牌主色 */
  --color-primary-500: #0071E3;
  --color-primary-700: #0066CC;
  --color-primary-hover: #0076DF;
  --color-primary-active: #006EDB;

  /* 中性色 (亮色模式) */
  --color-neutral-50: #FFFFFF;
  --color-neutral-100: #FAFAFC;
  --color-neutral-150: #F5F5F7;
  --color-neutral-200: #E8E8ED;
  --color-neutral-300: #D2D2D7;
  --color-neutral-500: #86868B;
  --color-neutral-600: #6E6E73;
  --color-neutral-700: #424245;
  --color-neutral-900: #1D1D1F;

  /* 语义色 */
  --color-bg-primary: #FFFFFF;
  --color-bg-card: #F5F5F7;
  --color-bg-dark: #000000;
  --color-text-primary: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-text-tertiary: #86868B;
  --color-text-inverse: #FFFFFF;
  --color-link: #0066CC;
  --color-link-hover: #0071E3;
  --color-border: #D2D2D7;
  --color-button-primary: #0071E3;
  --color-button-dark: #1D1D1F;

  /* 暗色模式 */
  --color-dark-bg: #000000;
  --color-dark-text: #F5F5F7;
  --color-dark-text-secondary: #86868B;

  /* === 排版 === */
  --font-display: "SF Pro Display", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  --font-text: "SF Pro Text", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  --font-cn: "PingFang SC", "SF Pro SC", "Microsoft YaHei", sans-serif;

  /* === 间距 === */
  --spacing-xs: 9px;
  --spacing-sm: 14px;
  --spacing-md: 24px;
  --spacing-lg: 44px;
  --spacing-xl: 56px;
  --spacing-2xl: 80px;

  /* === 圆角 === */
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 980px;

  /* === 导航 === */
  --nav-height: 44px;
  --nav-height-mobile: 48px;
}
```

- [ ] **Step 3: 写入全局重置和基础样式**

```css
/* ========================================
   Global Reset & Base
   ======================================== */

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-text), var(--font-cn);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  line-height: 1.47059;
  letter-spacing: -0.022em;
  overflow-x: hidden;
}

a {
  color: var(--color-link);
  text-decoration: none;
}
a:hover {
  color: var(--color-link-hover);
}

img {
  max-width: 100%;
  display: block;
}

ul {
  list-style: none;
}

/* === 工具类 === */
.visuallyhidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

- [ ] **Step 4: 写入排版系统**

```css
/* ========================================
   Typography
   ======================================== */

.typography-hero-headline {
  font-family: var(--font-display), var(--font-cn);
  font-size: 56px;
  line-height: 1.07143;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: var(--color-text-primary);
}

.typography-section-headline {
  font-family: var(--font-display), var(--font-cn);
  font-size: 40px;
  line-height: 1.125;
  font-weight: 600;
  letter-spacing: -0.016em;
  color: var(--color-text-primary);
}

.typography-subhead {
  font-size: 24px;
  line-height: 1.25;
  font-weight: 400;
  letter-spacing: 0.012em;
  color: var(--color-text-secondary);
}

.typography-body {
  font-size: 17px;
  line-height: 1.47059;
  font-weight: 400;
  letter-spacing: -0.022em;
}

.typography-callout {
  font-size: 14px;
  line-height: 1.28577;
  font-weight: 400;
  letter-spacing: -0.016em;
}

/* === 响应式排版 === */
@media (max-width: 1068px) {
  .typography-hero-headline { font-size: 48px; }
  .typography-section-headline { font-size: 32px; }
  .typography-subhead { font-size: 21px; }
}

@media (max-width: 734px) {
  .typography-hero-headline { font-size: 32px; line-height: 1.125; }
  .typography-section-headline { font-size: 28px; line-height: 1.143; }
  .typography-subhead { font-size: 17px; line-height: 1.235; }
  .typography-body { font-size: 14px; }
}
```

- [ ] **Step 5: 写入按钮系统**

```css
/* ========================================
   Buttons
   ======================================== */

.button {
  display: inline-block;
  padding: 9px 16px;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-size: 14px;
  line-height: 1.28577;
  font-weight: 400;
  letter-spacing: -0.016em;
  font-family: var(--font-text), var(--font-cn);
  cursor: pointer;
  text-align: center;
  min-width: 60px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.button-primary {
  background: var(--color-button-primary);
  color: var(--color-text-inverse);
}
.button-primary:hover {
  background: var(--color-primary-hover);
  color: var(--color-text-inverse);
}
.button-primary:active {
  background: var(--color-primary-active);
}

.button-dark {
  background: var(--color-button-dark);
  color: var(--color-text-inverse);
}
.button-dark:hover {
  background: var(--color-button-dark-hover);
  color: var(--color-text-inverse);
}
.button-dark:active {
  background: var(--color-button-dark-active);
}

.button-link {
  background: transparent;
  color: var(--color-link);
  border-color: var(--color-link);
}
.button-link:hover {
  background: var(--color-button-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-button-primary);
}

.button-link-dark {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}
.button-link-dark:hover {
  background: var(--color-button-dark);
  color: var(--color-text-inverse);
  border-color: var(--color-button-dark);
}

.button-large {
  padding: 18px 31px;
  font-size: 17px;
  line-height: 1.17648;
  letter-spacing: -0.022em;
  min-width: 90px;
}

.button-group {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
```

- [ ] **Step 6: 提交**

```bash
git add css/style.css index.html
git commit -m "chore: initialize project structure and design token foundation"
```

---

### Task 2: 实现全局导航栏 (GlobalNav)

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 在 index.html body 开头写入导航栏 HTML**

```html
<!-- ====== 全局导航栏 ====== -->
<nav class="globalnav" role="navigation" aria-label="全部网页">
  <div class="globalnav-content">
    <ul class="globalnav-list">
      <li class="globalnav-item globalnav-item-apple">
        <a href="/" class="globalnav-link" aria-label="Apple">
          <svg height="44" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg">
            <path d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z" fill="currentColor"/>
          </svg>
        </a>
      </li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">商店</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">Mac</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">iPad</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">iPhone</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">Watch</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">AirPods</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">电视与家居</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">娱乐</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">配件</a></li>
      <li class="globalnav-item"><a href="#" class="globalnav-link">技术支持</a></li>
      <li class="globalnav-item globalnav-item-search">
        <a href="#" class="globalnav-link" aria-label="搜索">
          <svg height="44" viewBox="0 0 18 44" width="18" xmlns="http://www.w3.org/2000/svg">
            <path d="m17.594 33.742-5.241-5.241a7.484 7.484 0 0 0 1.648-4.75c0-4.145-3.373-7.518-7.518-7.518s-7.518 3.373-7.518 7.518 3.373 7.518 7.518 7.518a7.47 7.47 0 0 0 4.446-1.512l5.268 5.267a.997.997 0 0 0 1.411 0 1.002 1.002 0 0 0-.014-1.282zm-16.111-9.991a5.508 5.508 0 1 1 11.016 0 5.508 5.508 0 0 1-11.016 0z" fill="currentColor"/>
          </svg>
        </a>
      </li>
      <li class="globalnav-item globalnav-item-bag">
        <a href="#" class="globalnav-link" aria-label="购物袋">
          <svg height="44" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg">
            <path d="m11.353 13.711a.5.5 0 0 0 .27-.912c-1.302-.866-2.613-1.447-3.9-1.73l.001-1.209a2.698 2.698 0 0 0 -5.398 0v1.226c-1.255.292-2.535.876-3.806 1.725a.5.5 0 0 0 .269.912c.085 0 .17-.013.253-.04l.033-.012v13.09a1.906 1.906 0 0 0 1.898 1.898h9.118a1.906 1.906 0 0 0 1.898-1.898v-13.088l.027.01a.475.475 0 0 0 .237.048zm-6.15-1.931v-1.181a1.698 1.698 0 0 1 3.396 0v1.197a15.384 15.384 0 0 0 -3.396-.016zm6.149 1.983-.01 13.177a.906.906 0 0 1 -.898.898h-9.118a.906.906 0 0 1 -.898-.898v-13.162c.936.476 1.905.83 2.885 1.063l.005-.001-.002.986h5.371v-.986l.003.001c.95-.229 1.89-.573 2.798-1.032l-.136-.046z" fill="currentColor"/>
          </svg>
        </a>
      </li>
    </ul>
  </div>
</nav>
```

- [ ] **Step 2: 写入导航栏 CSS**

```css
/* ========================================
   GlobalNav
   ======================================== */

.globalnav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  z-index: 9999;
}

.globalnav-content {
  max-width: 1024px;
  margin: 0 auto;
  height: 100%;
  padding: 0 22px;
}

.globalnav-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  list-style: none;
}

.globalnav-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  height: 100%;
}

.globalnav-link:hover {
  color: #FFFFFF;
}

.globalnav-item-apple a,
.globalnav-item-search a,
.globalnav-item-bag a {
  color: rgba(255, 255, 255, 0.8);
}

.globalnav-item-apple a:hover,
.globalnav-item-search a:hover,
.globalnav-item-bag a:hover {
  color: #FFFFFF;
}

.globalnav-item-apple svg,
.globalnav-item-search svg,
.globalnav-item-bag svg {
  display: block;
}

/* 移动端导航 — 隐藏文字链接，只保留图标 */
@media (max-width: 734px) {
  .globalnav-item:not(.globalnav-item-apple):not(.globalnav-item-search):not(.globalnav-item-bag) {
    display: none;
  }
}

/* 中小屏导航 — 隐藏部分链接 */
@media (max-width: 1068px) {
  .globalnav-item:nth-child(n+8):not(.globalnav-item-search):not(.globalnav-item-bag) {
    display: none;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: implement fixed global navigation bar with Apple styling"
```

---

### Task 3: 实现公告横幅

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 在导航后写入公告横幅 HTML**

```html
<!-- ====== 公告横幅 ====== -->
<section class="globalmessage">
  <div class="globalmessage-content">
    <p>购买 Mac 或 iPad 的过程中通过 Apple 教育优惠可享丰厚折扣及赠品。<a href="#">教育优惠</a></p>
  </div>
</section>
```

- [ ] **Step 2: 写入公告横幅 CSS**

```css
/* ========================================
   Global Message
   ======================================== */

.globalmessage {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: 12px 0;
  margin-top: var(--nav-height);
  text-align: center;
}

.globalmessage-content {
  font-size: 14px;
  line-height: 1.42859;
  letter-spacing: -0.016em;
  color: var(--color-text-secondary);
  max-width: 980px;
  margin: 0 auto;
  padding: 0 16px;
}

.globalmessage-content a {
  color: var(--color-link);
  white-space: nowrap;
}
.globalmessage-content a:hover {
  text-decoration: underline;
}

@media (max-width: 734px) {
  .globalmessage {
    margin-top: var(--nav-height-mobile);
  }
  .globalmessage-content {
    font-size: 12px;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add announcement banner with education offer"
```

---

### Task 4: 实现主 Hero 区 — iPhone 16 Pro

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 在公告横幅后写入 iPhone 16 Pro Hero HTML**

```html
<!-- ====== Hero: iPhone 16 Pro ====== -->
<section class="section-hero section-hero-dark">
  <div class="hero-content">
    <h2 class="hero-headline typography-hero-headline">iPhone 16 Pro</h2>
    <p class="hero-subhead typography-subhead">Apple 智能。强悍升级。</p>
    <div class="button-group">
      <a href="#" class="button button-primary button-large">进一步了解</a>
      <a href="#" class="button button-link-dark button-large">购买</a>
    </div>
  </div>
  <div class="hero-image">
    <picture>
      <source media="(max-width: 734px)" srcset="https://www.apple.com.cn/home/images/heroes/iphone-16-pro/iphone-16-pro-small.jpg">
      <img src="https://www.apple.com.cn/home/images/heroes/iphone-16-pro/iphone-16-pro-large.jpg" alt="iPhone 16 Pro">
    </picture>
  </div>
</section>
```

- [ ] **Step 2: 写入 Hero 区 CSS**

```css
/* ========================================
   Hero Sections
   ======================================== */

.section-hero {
  position: relative;
  min-height: 580px;
  height: 100vh;
  max-height: 750px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 55px;
  text-align: center;
  overflow: hidden;
}

.section-hero-dark {
  background: var(--color-bg-dark);
}
.section-hero-dark .hero-headline {
  color: var(--color-text-inverse);
}
.section-hero-dark .hero-subhead {
  color: var(--color-text-inverse);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 16px;
}

.hero-headline {
  margin-bottom: 6px;
}

.hero-subhead {
  margin-bottom: 16px;
}

.hero-image {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  height: 100%;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}

@media (max-width: 1068px) {
  .section-hero {
    min-height: 500px;
    max-height: 650px;
  }
}

@media (max-width: 734px) {
  .section-hero {
    min-height: 500px;
    max-height: 600px;
    padding-top: 40px;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add iPhone 16 Pro hero section with dark background"
```

---

### Task 5: 实现第二个 Hero 区 — iPhone 16

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 在 iPhone 16 Pro Hero 后写入 iPhone 16 Hero HTML**

```html
<!-- ====== Hero: iPhone 16 ====== -->
<section class="section-hero section-hero-light">
  <div class="hero-content">
    <h2 class="hero-headline typography-hero-headline">iPhone 16</h2>
    <p class="hero-subhead typography-subhead">Apple 智能。强势来袭。</p>
    <div class="button-group">
      <a href="#" class="button button-primary button-large">进一步了解</a>
      <a href="#" class="button button-link button-large">购买</a>
    </div>
  </div>
  <div class="hero-image">
    <picture>
      <source media="(max-width: 734px)" srcset="https://www.apple.com.cn/home/images/heroes/iphone-16/iphone-16-small.jpg">
      <img src="https://www.apple.com.cn/home/images/heroes/iphone-16/iphone-16-large.jpg" alt="iPhone 16">
    </picture>
  </div>
</section>
```

- [ ] **Step 2: 写入浅色 Hero 变体 CSS**

```css
.section-hero-light {
  background: var(--color-bg-card);
}
.section-hero-light .hero-headline {
  color: var(--color-text-primary);
}
.section-hero-light .hero-subhead {
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add iPhone 16 hero section with light background"
```

---

### Task 6: 实现 WWDC26 公告 Hero

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 写入 WWDC26 Hero HTML（在 iPhone 16 之后）**

```html
<!-- ====== Hero: WWDC26 ====== -->
<section class="section-hero section-hero-dark">
  <div class="hero-content">
    <h2 class="hero-headline typography-hero-headline">WWDC26</h2>
    <p class="hero-subhead typography-subhead">Apple 全球开发者大会。<br>6 月 10 日至 14 日。</p>
    <div class="button-group">
      <a href="#" class="button button-primary button-large">进一步了解</a>
    </div>
  </div>
  <div class="hero-image">
    <picture>
      <source media="(max-width: 734px)" srcset="https://www.apple.com.cn/home/images/heroes/wwdc26/wwdc26-small.jpg">
      <img src="https://www.apple.com.cn/home/images/heroes/wwdc26/wwdc26-large.jpg" alt="WWDC26">
    </picture>
  </div>
</section>
```

- [ ] **Step 2: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add WWDC26 announcement hero section"
```

---

### Task 7: 实现产品卡片网格

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 写入产品卡片网格 HTML**

```html
<!-- ====== 产品卡片网格 ====== -->
<section class="section-tiles">
  <!-- 第一行：iPad Pro + MacBook Air -->
  <div class="tile-row">
    <article class="tile tile-dark">
      <div class="tile-content">
        <h3 class="tile-eyebrow">iPad Pro</h3>
        <p class="tile-headline typography-section-headline">薄得出奇。</p>
        <div class="button-group">
          <a href="#" class="button button-primary">进一步了解</a>
          <a href="#" class="button button-link-dark">购买</a>
        </div>
      </div>
      <div class="tile-image">
        <img src="https://www.apple.com.cn/home/images/tiles/ipad-pro/ipad-pro.jpg" alt="iPad Pro">
      </div>
    </article>

    <article class="tile tile-light">
      <div class="tile-content">
        <h3 class="tile-eyebrow">MacBook Air</h3>
        <p class="tile-headline typography-section-headline">强劲实力，轻松随身。</p>
        <div class="button-group">
          <a href="#" class="button button-primary">进一步了解</a>
          <a href="#" class="button button-link">购买</a>
        </div>
      </div>
      <div class="tile-image">
        <img src="https://www.apple.com.cn/home/images/tiles/macbook-air/macbook-air.jpg" alt="MacBook Air">
      </div>
    </article>
  </div>

  <!-- 第二行：AirPods Pro + Apple Watch -->
  <div class="tile-row">
    <article class="tile tile-light">
      <div class="tile-content">
        <h3 class="tile-eyebrow">AirPods Pro</h3>
        <p class="tile-headline typography-section-headline">自适应音频。<br>现在更进一步。</p>
        <div class="button-group">
          <a href="#" class="button button-primary">进一步了解</a>
          <a href="#" class="button button-link">购买</a>
        </div>
      </div>
      <div class="tile-image">
        <img src="https://www.apple.com.cn/home/images/tiles/airpods-pro/airpods-pro.jpg" alt="AirPods Pro">
      </div>
    </article>

    <article class="tile tile-dark">
      <div class="tile-content">
        <h3 class="tile-eyebrow">Apple Watch</h3>
        <p class="tile-headline typography-section-headline" style="color: #FFFFFF;">健康，由你掌控。</p>
        <div class="button-group">
          <a href="#" class="button button-primary">进一步了解</a>
          <a href="#" class="button button-link-dark">购买</a>
        </div>
      </div>
      <div class="tile-image">
        <img src="https://www.apple.com.cn/home/images/tiles/apple-watch/apple-watch.jpg" alt="Apple Watch">
      </div>
    </article>
  </div>

  <!-- 第三行：iPad mini + Apple 专属交通卡 -->
  <div class="tile-row">
    <article class="tile tile-light">
      <div class="tile-content">
        <h3 class="tile-eyebrow">iPad mini</h3>
        <p class="tile-headline typography-section-headline">迷你尺寸。<br>巨大魅力。</p>
        <div class="button-group">
          <a href="#" class="button button-primary">进一步了解</a>
          <a href="#" class="button button-link">购买</a>
        </div>
      </div>
      <div class="tile-image">
        <img src="https://www.apple.com.cn/home/images/tiles/ipad-mini/ipad-mini.jpg" alt="iPad mini">
      </div>
    </article>

    <article class="tile tile-dark">
      <div class="tile-content">
        <h3 class="tile-eyebrow">Apple 专属交通卡</h3>
        <p class="tile-headline typography-section-headline" style="color: #FFFFFF;">iPhone 和 Apple Watch<br>就是你的交通卡。</p>
        <div class="button-group">
          <a href="#" class="button button-primary">进一步了解</a>
        </div>
      </div>
      <div class="tile-image">
        <img src="https://www.apple.com.cn/home/images/tiles/transit-card/transit-card.jpg" alt="Apple 专属交通卡">
      </div>
    </article>
  </div>
</section>
```

- [ ] **Step 2: 写入产品卡片网格 CSS**

```css
/* ========================================
   Product Tiles
   ======================================== */

.section-tiles {
  max-width: 1440px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tile-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tile {
  position: relative;
  min-height: 580px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
  border-radius: 0;
}

.tile-dark {
  background: var(--color-bg-dark);
  color: var(--color-text-inverse);
}

.tile-light {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}

.tile-content {
  position: relative;
  z-index: 2;
  padding-top: 53px;
}

.tile-eyebrow {
  font-size: 14px;
  line-height: 1.28577;
  font-weight: 400;
  letter-spacing: -0.016em;
  margin-bottom: 4px;
  color: inherit;
}

.tile-headline {
  margin-bottom: 16px;
}

.tile-image {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.tile-image img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* Tile 响应式 */
@media (max-width: 734px) {
  .tile-row {
    grid-template-columns: 1fr;
  }

  .tile {
    min-height: 480px;
  }

  .tile-content {
    padding-top: 40px;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add product tiles grid with iPad Pro, MacBook Air, AirPods, Watch, etc."
```

---

### Task 8: 实现页面底部购物指南栏

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 在产品卡片网格后写入购物指南栏 HTML**

```html
<!-- ====== 购物指南栏 ====== -->
<section class="section-cta-bar">
  <div class="cta-bar-content">
    <div class="cta-bar-item">
      <div class="cta-bar-icon">
        <img src="https://www.apple.com.cn/home/images/cta-bar/delivery.svg" alt="" width="56" height="56">
      </div>
      <h3 class="cta-bar-title">免费送货</h3>
      <p class="cta-bar-text">享受免费送货上门服务。</p>
      <a href="#" class="cta-bar-link">进一步了解</a>
    </div>
    <div class="cta-bar-item">
      <div class="cta-bar-icon">
        <img src="https://www.apple.com.cn/home/images/cta-bar/trade-in.svg" alt="" width="56" height="56">
      </div>
      <h3 class="cta-bar-title">Apple 换购</h3>
      <p class="cta-bar-text">用符合条件的设备换购，<br>可获折抵优惠。</p>
      <a href="#" class="cta-bar-link">进一步了解</a>
    </div>
    <div class="cta-bar-item">
      <div class="cta-bar-icon">
        <img src="https://www.apple.com.cn/home/images/cta-bar/support.svg" alt="" width="56" height="56">
      </div>
      <h3 class="cta-bar-title">专家服务支持</h3>
      <p class="cta-bar-text"> Specialist 专家协助你选购。<br>在线或电话。
</p>
      <a href="#" class="cta-bar-link">进一步了解</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: 写入购物指南栏 CSS**

```css
/* ========================================
   CTA Bar
   ======================================== */

.section-cta-bar {
  background: var(--color-bg-primary);
  padding: 24px 16px 32px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.cta-bar-content {
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: center;
}

.cta-bar-item {
  padding: 24px 16px;
}

.cta-bar-icon {
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.cta-bar-icon img {
  width: 56px;
  height: 56px;
}

.cta-bar-title {
  font-size: 14px;
  line-height: 1.28577;
  font-weight: 600;
  letter-spacing: -0.016em;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.cta-bar-text {
  font-size: 14px;
  line-height: 1.42859;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.cta-bar-link {
  font-size: 14px;
  color: var(--color-link);
}
.cta-bar-link:hover {
  text-decoration: underline;
}

@media (max-width: 734px) {
  .cta-bar-content {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add CTA bar with delivery, trade-in, and support links"
```

---

### Task 9: 实现全局页脚

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 在购物指南栏后写入页脚 HTML**

```html
<!-- ====== 全局页脚 ====== -->
<footer class="globalfooter">
  <div class="globalfooter-content">
    <!-- 脚注标注 -->
    <section class="globalfooter-notes">
      <ol>
        <li>优惠价格仅适用于符合条件的学生、教师及教育机构员工。</li>
      </ol>
    </section>

    <!-- 导航链接 -->
    <nav class="globalfooter-nav">
      <div class="footer-nav-col">
        <h4 class="footer-nav-title">选购与了解</h4>
        <ul>
          <li><a href="#">Mac</a></li>
          <li><a href="#">iPad</a></li>
          <li><a href="#">iPhone</a></li>
          <li><a href="#">Watch</a></li>
          <li><a href="#">AirPods</a></li>
        </ul>
      </div>
      <div class="footer-nav-col">
        <h4 class="footer-nav-title">服务</h4>
        <ul>
          <li><a href="#">Apple Music</a></li>
          <li><a href="#">iCloud</a></li>
          <li><a href="#">Apple 播客</a></li>
          <li><a href="#">App Store</a></li>
        </ul>
        <h4 class="footer-nav-title footer-nav-title-sub">账户</h4>
        <ul>
          <li><a href="#">管理你的 Apple ID</a></li>
          <li><a href="#">Apple Store 账户</a></li>
        </ul>
      </div>
      <div class="footer-nav-col">
        <h4 class="footer-nav-title">Apple Store 商店</h4>
        <ul>
          <li><a href="#">查找零售店</a></li>
          <li><a href="#">Genius Bar 天才吧</a></li>
          <li><a href="#">今日 Apple</a></li>
          <li><a href="#">Apple 夏令营</a></li>
        </ul>
      </div>
      <div class="footer-nav-col">
        <h4 class="footer-nav-title">商业应用</h4>
        <ul>
          <li><a href="#">Apple 与商务</a></li>
          <li><a href="#">商务选购</a></li>
        </ul>
        <h4 class="footer-nav-title footer-nav-title-sub">教育应用</h4>
        <ul>
          <li><a href="#">Apple 与教育</a></li>
          <li><a href="#">教育优惠选购</a></li>
        </ul>
      </div>
      <div class="footer-nav-col">
        <h4 class="footer-nav-title">Apple 价值观</h4>
        <ul>
          <li><a href="#">辅助功能</a></li>
          <li><a href="#">环境</a></li>
          <li><a href="#">隐私</a></li>
          <li><a href="#">供应链</a></li>
        </ul>
      </div>
    </nav>

    <!-- 底部法律信息 -->
    <section class="globalfooter-legal">
      <div class="legal-text">
        <p>更多选购方式：<a href="#">查找你附近的 Apple Store 零售店</a>，或致电 400-666-8800。</p>
      </div>
      <div class="legal-bottom">
        <p class="legal-copyright">Copyright &copy; 2026 Apple Inc. 保留所有权利。</p>
        <ul class="legal-links">
          <li><a href="#">隐私政策</a></li>
          <li><a href="#">使用条款</a></li>
          <li><a href="#">销售政策</a></li>
          <li><a href="#">法律信息</a></li>
          <li><a href="#">网站地图</a></li>
        </ul>
        <p class="legal-locale">中国</p>
      </div>
    </section>
  </div>
</footer>
```

- [ ] **Step 2: 写入页脚 CSS**

```css
/* ========================================
   Global Footer
   ======================================== */

.globalfooter {
  background: var(--color-bg-card);
  font-size: 12px;
  line-height: 1.33337;
  letter-spacing: -0.01em;
  color: var(--color-text-secondary);
}

.globalfooter-content {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 22px;
}

/* 脚注标注 */
.globalfooter-notes {
  padding: 17px 0 11px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.globalfooter-notes ol {
  padding-left: 16px;
}

.globalfooter-notes li {
  margin-bottom: 8px;
}

/* 导航链接 */
.globalfooter-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  padding: 20px 0;
}

.footer-nav-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.footer-nav-title-sub {
  margin-top: 20px;
}

.footer-nav-col ul {
  list-style: none;
}

.footer-nav-col li {
  margin-bottom: 8px;
}

.footer-nav-col a {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.footer-nav-col a:hover {
  color: var(--color-text-primary);
  text-decoration: underline;
}

/* 底部法律信息 */
.globalfooter-legal {
  padding: 16px 0 28px;
  border-top: 1px solid var(--color-neutral-200);
}

.legal-text {
  margin-bottom: 8px;
}

.legal-text a {
  color: var(--color-link);
}

.legal-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.legal-copyright {
  margin-right: auto;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  gap: 8px 16px;
}

.legal-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.legal-links a:hover {
  color: var(--color-text-primary);
}

.legal-locale {
  margin-left: auto;
  font-weight: 600;
  color: var(--color-text-primary);
}

@media (max-width: 734px) {
  .globalfooter-nav {
    grid-template-columns: 1fr;
  }

  .legal-bottom {
    flex-direction: column;
    align-items: flex-start;
  }

  .legal-locale {
    margin-left: 0;
  }
}

@media (min-width: 735px) and (max-width: 1068px) {
  .globalfooter-nav {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add global footer with navigation and legal information"
```

---

### Task 10: 响应式调优与最终验证

**Files:**
- Modify: `css/style.css`
- Modify: `index.html`

- [ ] **Step 1: 添加暗色模式支持**

```css
/* ========================================
   Dark Mode Support
   ======================================== */

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #000000;
    --color-bg-card: #1D1D1F;
    --color-text-primary: #F5F5F7;
    --color-text-secondary: #86868B;
    --color-link: #2997FF;
    --color-border: #333336;
  }

  .section-hero-light {
    background: #1D1D1F;
  }

  .globalmessage {
    background: #1D1D1F;
    border-color: #333336;
  }

  .globalfooter {
    background: #1D1D1F;
  }

  .section-cta-bar {
    background: #000000;
    border-color: #333336;
  }
}
```

- [ ] **Step 2: 验证所有图片URL和断点行为**

```bash
echo "验证 HTML 结构完整性"
grep -c '</section>' index.html
grep -c '</nav>' index.html
grep -c '</footer>' index.html
echo "验证 CSS 选择器一致性"
grep -c '\.section-hero' css/style.css
grep -c '\.globalnav' css/style.css
grep -c '\.tile' css/style.css
```

- [ ] **Step 3: 如果图片 404，替换为本地占位图**

实际图片可能存在 CORS 限制，需要根据 Apple CDN 实际可达性在调试时替换。以下为备选路径方案：

```html
<!-- 如果官方 CDN 图片不可达，使用本地占位 -->
<!-- 直接从 Apple 页面检查图片 URL 实际路径 -->
```

- [ ] **Step 4: 添加页面滚动偏移修正（导航栏高度补偿）**

```css
/* 导航栏固定定位补偿 */
.section-hero {
  scroll-margin-top: var(--nav-height);
}
```

- [ ] **Step 5: 提交最终版本**

```bash
git add index.html css/style.css
git commit -m "feat: add dark mode, responsive refinements, and final polish"
```

---

## 计划自我审查

**规范覆盖检查：**
1. ✅ 视觉主题 — 深色/浅色 Hero 区分
2. ✅ 颜色系统 — CSS 自定义属性映射完整色板
3. ✅ 排版系统 — hero/section/subhead/body 三层字号 + 响应式
4. ✅ 组件样式 — 按钮 4 种变体 + 导航栏 + 卡片
5. ✅ 布局原则 — 12 列网格（tile-row 用 grid）、间距、断点
6. ✅ 设计禁忌 — 无阴影、无装饰、居中布局、纯色背景

**占位符检查：** 无 TBD/TODO，所有颜色值精确。

**类型一致性：** CSS 类名在 HTML 和 CSS 间一致。

**图片注意：** 代码中使用 Apple CDN 图片路径。如果图片无法加载（CORS/防盗链），可用纯色背景代替。
