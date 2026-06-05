# 🎬 UP 梦工厂 (updream.bilibili.com) — 设计系统全量交付

> **生成日期：** 2026-06-04  
> **来源素材：** https://updream.bilibili.com  
> **工具链：** design-system-architect Skill（改进版）  
> **交付物：** DESIGN.md + tokens.css + 无限画布演示页（一页式交付）

---

# 📖 第一部分：DESIGN.md — 设计系统规范文档

```
# DESIGN.md — UP 梦工厂 (updream.bilibili.com) 设计系统规范

> **版本：** 1.0.0
> **生成日期：** 2026-06-04
> **来源素材：** https://updream.bilibili.com
> **设计流派：** 暗色模式 + 毛玻璃效果 + 科技/AI 现代风
> **适用行业：** 科技、AI 视频创作、互联网

---

## 1. 视觉主题概述

### 设计流派

UP 梦工厂采用 **暗色模式 (Dark Mode)** 为默认主题，融合 **毛玻璃效果 (Glassmorphism)** 和 **科技/AI 现代风**。整体以深邃黑色为基底，通过透明磨砂面板叠加和霓虹色彩点缀，营造出沉浸式的 AI 创作空间感。界面大量使用 `backdrop-filter: blur()` 实现毛玻璃分层效果，配以细腻的高光边框和渐变光晕，强调科技感与未来感。

### 设计核心理念

- **氛围**：沉浸、深邃、科技感、未来主义
- **关键词**：暗色、毛玻璃、霓虹光晕、AI、创作者
- **核心理念**：让界面退居幕后，用毛玻璃分层构建空间纵深感，让 AI 创作内容成为视觉焦点

### 适用场景

- AI 视频创作工具
- 创意工作者平台
- 科技/SaaS 产品
- 暗色模式优先的应用

---

## 2. 颜色系统

### 2.1 品牌主色板

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-primary-50` | `#E8F0FF` | ████ | 极浅主色（hover 背景） |
| `--color-primary-100` | `#B8DAFF` | ████ | 浅主色（信息提示背景） |
| `--color-primary-500` | `#3FA2FF` | ████ | 主色（品牌蓝、链接、信息按钮） |
| `--color-primary-700` | `#1A7FE6` | ████ | 深主色（hover 状态） |
| `--color-primary-900` | `#0A52A0` | ████ | 最深主色（Active 状态） |

### 2.2 B 站品牌色

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-bilibili-blue` | `#00A1D6` | ████ | B 站标志蓝 |
| `--color-bilibili-pink` | `#FF6699` | ████ | B 站标志粉 |
| `--color-accent-purple` | `#C177FF` | ████ | AI 功能强调色 |
| `--color-accent-pink` | `#FF6699` | ████ | 个性化强调色 |

### 2.3 辅助色板

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-secondary-500` | `#525252` | ████ | 次要操作（中性色） |
| `--color-accent-500` | `#C177FF` | ████ | AI 紫色强调色 |
| `--color-success-500` | `#00C16A` | ████ | 成功状态 |
| `--color-warning-500` | `#FD9A00` | ████ | 警告状态 |
| `--color-error-500` | `#FF6467` | ████ | 错误/删除状态 |
| `--color-info-500` | `#3FA2FF` | ████ | 信息提示 |

### 2.4 中性色板（暗色主题）

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-neutral-50` | `#FAFAFA` | 极浅文字（高亮） |
| `--color-neutral-100` | `#F5F6F7` | 浅文字 |
| `--color-neutral-300` | `#D4D4D4` | 常规文字 |
| `--color-neutral-400` | `#A1A1A1` | 次要文字 |
| `--color-neutral-500` | `#737373` | 辅助信息 |
| `--color-neutral-600` | `#525252` | 占位符文字 |
| `--color-neutral-700` | `#404040` | 边框/分割线 |
| `--color-neutral-800` | `#262626` | 轻微背景（muted） |
| `--color-neutral-900` | `#171717` | 面板背景 |
| `--color-neutral-950` | `#0A0A0A` | 页面主背景 |

### 2.5 语义色别名

| Alias Token | 映射值 | 用途 |
|-------------|--------|------|
| `--color-bg-primary` | `#0A0A0A` | 页面主背景 |
| `--color-bg-surface` | `#FFFFFF`（亮）/ `#171717`（暗） | 面板背景 |
| `--color-bg-elevated` | `#FFFFFF`（亮）/ `#1A1A1A`（暗） | 弹出层背景 |
| `--color-text-primary` | `#FAFAFA` | 主文字 |
| `--color-text-secondary` | `#A1A1A1` | 次要文字 |
| `--color-text-placeholder` | `#737373` | 占位符文字 |
| `--color-border` | `#404040` | 边框 |
| `--color-ring` | `#525252` | 聚焦环 |
| `--color-input` | `#404040` | 输入框边框 |

### 2.6 毛玻璃色板

| Token | 色值 | 用途 |
|-------|------|------|
| `--glass-surface` | `rgba(23, 23, 23, 0.75)` | 暗色毛玻璃面板 |
| `--glass-light` | `rgba(255, 255, 255, 0.82)` | 亮色毛玻璃面板 |
| `--glass-input` | `rgba(255, 255, 255, 0.08)` | 暗色输入框毛玻璃 |
| `--glass-border` | `rgba(255, 255, 255, 0.09)` | 毛玻璃边框 |
| `--glass-shine` | `rgba(255, 255, 255, 0.28)` | 高光渐变 |
| `--glass-blur-strong` | `blur(35px) saturate(150%)` | 强模糊 |
| `--glass-blur-medium` | `blur(28px) saturate(180%)` | 中模糊 |
| `--glass-blur-light` | `blur(12px) saturate(120%)` | 轻模糊 |

---

## 3. 排版系统

### 3.1 字体家族

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-family-display` | `'DM Sans', 'Plus Jakarta Sans', 'PingFang SC', sans-serif` | 展示/标题字体（英文优先） |
| `--font-family-sans` | `'PingFang SC', -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif` | 正文字体（中文优先） |
| `--font-family-mono` | `'Consolas', 'Monaco', monospace` | 代码字体 |

### 3.2 字号层级

| Token | 尺寸 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `--font-size-hero` | `112px` | `0.95` | `700` | 超大 Hero 文字 |
| `--font-size-h1` | `56px` | `1.0` | `600` | 页面大标题 |
| `--font-size-h2` | `32px` | `1.15` | `600` | 区块标题 |
| `--font-size-h3` | `28px` | `1.2` | `500` | 卡片标题 |
| `--font-size-h4` | `20px` | `1.25` | `500` | 小标题 |
| `--font-size-body` | `16px` (1rem) | `1.5` | `400` | 正文 |
| `--font-size-small` | `13px` (0.8125rem) | `1.4` | `400` | 辅助文字 |
| `--font-size-caption` | `12px` (0.75rem) | `1.33` | `400` | 标注文字 |
| `--font-size-tiny` | `10px` (0.625rem) | `1.2` | `400` | 极小标签 |

### 3.3 字重映射

| Token | 数值 | 名称 |
|-------|------|------|
| `--font-weight-regular` | `400` | 常规 |
| `--font-weight-medium` | `500` | 中等 |
| `--font-weight-semibold` | `600` | 半粗 |
| `--font-weight-bold` | `700` | 粗体 |

---

## 4. 组件样式

### 4.1 毛玻璃面板 (Glass Panel)

| 属性 | 值 |
|------|-----|
| 背景 | `rgba(23, 23, 23, 0.75)` 或 `rgba(255, 255, 255, 0.82)` |
| 边框 | `1px solid rgba(255, 255, 255, 0.09)` |
| 圆角 | `20px` |
| 阴影 | `0 4px 20px rgba(0, 0, 0, 0.1)`，部分内边框 `0 0 0 1px rgba(255, 255, 255, 0.05) inset` |
| 模糊 | `backdrop-filter: blur(35px) saturate(150%)` |

### 4.2 按钮系统

UP 梦工厂拥有完整的语义化按钮生态。每个变体使用对应语义色的 15% 透明度背景，hover 时升至 25%。

**通用样式：**
```css
.button {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 14px;
  transition: background 0.14s, color 0.14s;
  cursor: pointer;
  border: none;
}
```

**按钮变体：**

| 变体 | Normal 背景 | Normal 文字 | Hover 背景 |
|------|-------------|-------------|------------|
| Primary | `#0A0A0A` | `#FAFAFA` | `#262626` |
| Info (品牌蓝) | `rgba(63,162,255,0.15)` | `#3FA2FF` | `rgba(63,162,255,0.25)` |
| AI 助手 (紫) | `rgba(193,119,255,0.15)` | `#C177FF` | `rgba(193,119,255,0.25)` |
| Success | `rgba(0,193,106,0.15)` | `#00C16A` | `rgba(0,193,106,0.25)` |
| Warning | `rgba(253,154,0,0.15)` | `#FD9A00` | `rgba(253,154,0,0.25)` |
| Danger | `rgba(255,100,103,0.15)` | `#FF6467` | `rgba(255,100,103,0.25)` |
| Help (AI 紫) | `rgba(193,119,255,0.15)` | `#C177FF` | `rgba(193,119,255,0.25)` |

### 4.3 模态框 (Modal)

| 属性 | 值 |
|------|-----|
| 背景 | `rgba(12, 12, 18, 0.52)` |
| 模糊 | `backdrop-filter: blur(28px) saturate(180%)` |
| 边框 | `1px solid rgba(255, 255, 255, 0.09)` |
| 圆角 | `20px` |
| 阴影 | `0 40px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05) inset` |
| 内边距 | `28px 32px 32px` |

### 4.4 输入框 (Input)

| 状态 | 边框 | 背景 | 圆角 |
|------|------|------|------|
| Normal | `1px solid #404040` | `#404040`（或毛玻璃 `rgba(255,255,255,0.08)`） | `8px` |
| Focus | `1px solid #6366F1` | 不变 | `8px` |
| Placeholder | — | — | 文字色 `#737373` |

### 4.5 节点编辑器 (Node Canvas)

| 属性 | 值 |
|------|-----|
| 节点背景 | 毛玻璃面板风格 |
| 节点边框 | `rgba(0, 0, 0, 0.08)` |
| 焦点边框 | `rgba(82, 82, 82)`（2px 宽度） |
| 进度条 | `linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.18), rgba(255,255,255,0.28))` |

### 4.6 卡片/下拉菜单

| 属性 | 值 |
|------|-----|
| 背景 | `#1A1A1A`（--popover） |
| 文字 | `rgba(250, 250, 250, 1)` |
| 圆角 | `8px` |
| 阴影 | `0 4px 20px rgba(0,0,0,0.1)` |

---

## 5. 布局原则

### 5.1 间距系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--spacing-xs` | `4px` (0.25rem) | 极紧凑间距 |
| `--spacing-sm` | `8px` (0.5rem) | 元素间小间距 |
| `--spacing-md` | `12px` (0.75rem) | 常规元素间距 |
| `--spacing-lg` | `16px` (1rem) | 区块内间距 |
| `--spacing-xl` | `24px` (1.5rem) | 区块间间距 |
| `--spacing-2xl` | `32px` (2rem) | 大区块间距 |

### 5.2 断点系统

| Token | 值 | 设备 |
|-------|-----|------|
| `--breakpoint-sm` | `640px` | 手机 |
| `--breakpoint-md` | `768px` | 平板 |
| `--breakpoint-lg` | `1024px` | 桌面 |
| `--breakpoint-xl` | `1280px` | 宽屏桌面 |

### 5.3 层次堆叠 (Z 轴空间)

```
层 0: 页面背景 (#0A0A0A 纯色)
层 1: 点阵网格背景 (radial-gradient 圆点)
层 2: 内容面板/区块（毛玻璃 + 模糊）
层 3: 浮动控制栏（毛玻璃 + 强模糊）
层 4: 模态框/弹出层（毛玻璃 + 强模糊 + 深阴影）
层 5: 提示/通知 (Toast)
```

### 5.4 面板系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--panel` | `rgba(255, 255, 255, 0.82)` | 面板默认背景 |
| `--panel-border` | `rgba(0, 0, 0, 0.2)` | 面板边框 |
| `--panel-hover` | `rgba(255, 255, 255, 1)` | 面板 hover 状态 |
| `--panel-shine` | `rgba(255, 255, 255, 0.28)` | 面板高光渐变 |
| `--shadow-panel` | `0 4px 20px rgba(0,0,0,0.1)` | 面板阴影 |

### 5.5 阴影系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `none` | 默认（无阴影） |
| `--shadow-md` | `0 4px 20px rgba(0,0,0,0.1)` | 面板/卡片 |
| `--shadow-lg` | `0 4px 20px rgba(0,0,0,0.5)` | 浮动元素 |
| `--shadow-xl` | `0 40px 80px rgba(0,0,0,0.55)` | 模态框 |

### 5.6 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `4px` (0.25rem) | 小标签/标记 |
| `--radius-md` | `8px` (0.5rem) | 按钮/输入框/下拉菜单 |
| `--radius-lg` | `12px` (0.75rem) | 卡片/面板 |
| `--radius-xl` | `20px` (1.25rem) | 大面板/模态框 |
| `--radius-full` | `9999px` | 胶囊/头像/标签 |

### 5.7 过渡与动画

| Token | 值 | 用途 |
|-------|-----|------|
| `--duration-fast` | `0.15s` | hover 状态切换 |
| `--duration-normal` | `0.25s` | 面板显隐/过渡 |
| `--ease-theme` | `cubic-bezier(0.4, 0, 0.2, 1)` | 标准缓动 |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | 出场缓动 |

---

## 6. 暗色模式

本设计系统以 **暗色模式为默认**，亮色模式为适配。

### 亮/暗映射

| 语义变量 | 暗色值 | 亮色值 |
|----------|--------|--------|
| `--background` | `#0A0A0A` | `#FFFFFF` |
| `--foreground` | `#FAFAFA` | `#0A0A0A` |
| `--popover` | `#1A1A1A` | `#FFFFFF` |
| `--border` | `#404040` | `#E5E5E5` |
| `--input` | `#404040` | `#D4D4D4` |
| `--muted` | `#262626` | `#F5F5F5` |
| `--muted-foreground` | `#A1A1A1` | `#737373` |
| `--ring` | `#525252` | `#A1A1A1` |
| `--panel` | `rgba(23,23,23,0.75)` | `rgba(255,255,255,0.82)` |

---

## 7. 设计禁忌 (Do's and Don'ts)

### ✅ Do's

1. **毛玻璃优先**：面板和容器优先使用 `backdrop-filter: blur()` 而非纯色填充
2. **保持一致**：所有品牌色严格使用 Token 定义值
3. **深色沉浸**：以深邃黑色为基底，减少纯白区域的突兀出现
4. **霓虹点缀**：使用品牌蓝 (#3FA2FF)、AI 紫 (#C177FF)、B 站粉 (#FF6699) 作为功能性点缀色
5. **层次分明**：利用毛玻璃的模糊强度区分 Z 轴层次
6. **平滑过渡**：所有交互状态使用 `0.15s` 过渡时间

### ❌ Don'ts

1. **避免纯白背景**：除非亮色模式，不要在暗色主题中使用大块纯白色
2. **避免硬边阴影**：优先使用毛玻璃模糊而非深色阴影来营造层次
3. **避免过度饱和**：品牌色只用于重要交互元素，不泛滥使用
4. **避免忽略暗色适配**：新组件必须同时提供暗色和亮色变量
5. **避免切断毛玻璃效果**：毛玻璃需要背景内容可见才能产生效果

---
```

---

# 🎨 第二部分：tokens.css — Design Token CSS 变量

```css
/* ========================================
   UP 梦工厂 (updream.bilibili.com) — Design Token
   自动生成自 DESIGN.md v1.0.0
   生成日期: 2026-06-04
   ======================================== */

:root {
  color-scheme: light dark;
  accent-color: #3FA2FF;

  /* ===== 1. 品牌主色板 ===== */
  --color-primary-50: #E8F0FF;
  --color-primary-100: #B8DAFF;
  --color-primary-500: #3FA2FF;
  --color-primary-700: #1A7FE6;
  --color-primary-900: #0A52A0;

  /* ===== 2. B 站品牌色 ===== */
  --color-bilibili-blue: #00A1D6;
  --color-bilibili-pink: #FF6699;
  --color-accent-purple: #C177FF;
  --color-accent-pink: #FF6699;

  /* ===== 3. 辅助色板 ===== */
  --color-secondary-500: #525252;
  --color-accent-500: #C177FF;
  --color-success-500: #00C16A;
  --color-warning-500: #FD9A00;
  --color-error-500: #FF6467;
  --color-info-500: #3FA2FF;

  /* ===== 4. 中性色板（暗色主题） ===== */
  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F5F6F7;
  --color-neutral-300: #D4D4D4;
  --color-neutral-400: #A1A1A1;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0A0A0A;

  /* ===== 5. 语义色别名 ===== */
  --color-bg-primary: #0A0A0A;
  --color-bg-surface: #1A1A1A;
  --color-bg-elevated: #262626;
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A1A1A1;
  --color-text-placeholder: #737373;
  --color-border: #404040;
  --color-ring: #525252;
  --color-input: #404040;

  /* ===== 6. 毛玻璃色板 ===== */
  --glass-surface: rgba(23, 23, 23, 0.75);
  --glass-light: rgba(255, 255, 255, 0.82);
  --glass-input: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.09);
  --glass-shine: rgba(255, 255, 255, 0.28);

  /* ===== 7. 字体家族 ===== */
  --font-family-display: 'DM Sans', 'Plus Jakarta Sans', 'PingFang SC', sans-serif;
  --font-family-sans: 'PingFang SC', -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif;
  --font-family-mono: 'Consolas', 'Monaco', monospace;

  /* ===== 8. 字号层级 ===== */
  --font-size-hero: 112px;
  --font-size-h1: 56px;
  --font-size-h2: 32px;
  --font-size-h3: 28px;
  --font-size-h4: 20px;
  --font-size-body: 16px;
  --font-size-small: 13px;
  --font-size-caption: 12px;
  --font-size-tiny: 10px;

  /* ===== 9. 字重映射 ===== */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ===== 10. 间距系统 ===== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;

  /* ===== 11. 断点系统 ===== */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* ===== 12. 面板系统 ===== */
  --panel-bg: rgba(23, 23, 23, 0.75);
  --panel-border: 1px solid rgba(255, 255, 255, 0.09);
  --panel-radius: 20px;
  --panel-blur: blur(35px) saturate(150%);
  --shadow-panel: 0 4px 20px rgba(0, 0, 0, 0.1);

  /* ===== 13. 阴影系统 ===== */
  --shadow-sm: none;
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 40px 80px rgba(0, 0, 0, 0.55);

  /* ===== 14. 圆角系统 ===== */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* ===== 15. 过渡与动画 ===== */
  --duration-fast: 0.15s;
  --duration-normal: 0.25s;
  --ease-theme: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== 亮色模式覆盖 ===== */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-bg-primary: #FFFFFF;
    --color-bg-surface: #FFFFFF;
    --color-bg-elevated: #FAFAFA;
    --color-text-primary: #0A0A0A;
    --color-text-secondary: #737373;
    --color-text-placeholder: #A1A1A1;
    --color-border: #E5E5E5;
    --color-ring: #A1A1A1;
    --color-input: #D4D4D4;
    --glass-surface: rgba(255, 255, 255, 0.82);
    --glass-input: rgba(0, 0, 0, 0.06);
    --panel-bg: rgba(255, 255, 255, 0.82);
    --shadow-panel: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

:root[data-theme="light"] {
  --color-bg-primary: #FFFFFF;
  --color-bg-surface: #FFFFFF;
  --color-bg-elevated: #FAFAFA;
  --color-text-primary: #0A0A0A;
  --color-text-secondary: #737373;
  --color-text-placeholder: #A1A1A1;
  --color-border: #E5E5E5;
  --color-ring: #A1A1A1;
  --color-input: #D4D4D4;
  --glass-surface: rgba(255, 255, 255, 0.82);
  --glass-input: rgba(0, 0, 0, 0.06);
  --panel-bg: rgba(255, 255, 255, 0.82);
  --shadow-panel: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```
```

---

# 🖥️ 第三部分：infinite-canvas-updream.html — 无限画布演示页

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>UP 梦工厂 · 设计系统画布浏览器</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; user-select:none; }
    body {
      font-family: 'PingFang SC', -apple-system, 'BlinkMacSystemFont', 'Segoe UI', Roboto, sans-serif;
      background: #0A0A0A;
      height: 100vh; width: 100vw; overflow: hidden; position: fixed;
    }
    .canvas-grid {
      position: absolute; top:0; left:0; width:100%; height:100%;
      background-image: radial-gradient(circle, rgba(54,54,54,0.5) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none; z-index:0;
    }
    .canvas-controls {
      position: fixed; bottom:24px; left:50%; transform:translateX(-50%);
      display: flex; align-items: center; gap:10px;
      background: rgba(23,23,23,0.85);
      backdrop-filter: blur(35px) saturate(150%);
      -webkit-backdrop-filter: blur(35px) saturate(150%);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 14px; padding:10px 18px; z-index:9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .canvas-controls button {
      background: rgba(255,255,255,0.08);
      border: none; color:#FAFAFA; width:32px; height:32px;
      border-radius: 8px; cursor: pointer; font-size:16px;
      transition: background 0.15s;
      display: flex; align-items:center; justify-content:center;
    }
    .canvas-controls button:hover { background: rgba(255,255,255,0.15); }
    .canvas-controls .scale-text {
      color:#A1A1A1; font-size:12px; min-width:44px; text-align:center;
      font-variant-numeric: tabular-nums;
    }
    .canvas-controls .hint { color:#525252; font-size:11px; margin-left:8px; }
    .canvas-controls .hint kbd {
      background: rgba(255,255,255,0.06); padding:1px 6px;
      border-radius:3px; font-size:10px;
    }
    .canvas-controls .back-link {
      color:#3FA2FF; font-size:12px; text-decoration:none;
      margin-left:12px; padding:4px 10px;
      border-radius:6px; transition:background 0.15s;
    }
    .canvas-controls .back-link:hover { background: rgba(63,162,255,0.1); }

    #canvas-viewport { width:100vw; height:100vh; overflow:hidden; position:relative; }
    #canvas-stage {
      position: absolute; top:0; left:0;
      transform-origin: 0 0; will-change:transform;
    }
    .canvas-section {
      position: absolute;
      background: rgba(23,23,23,0.75);
      backdrop-filter: blur(35px) saturate(150%);
      -webkit-backdrop-filter: blur(35px) saturate(150%);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 20px; padding:24px 28px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.03) inset;
      transition: box-shadow 0.25s ease; width:440px;
    }
    .canvas-section:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(63,162,255,0.15) inset;
    }
    .canvas-section h2 {
      color:#FAFAFA; font-size:18px; font-weight:600;
      margin-bottom:16px; padding-bottom:10px;
      border-bottom:1px solid rgba(255,255,255,0.06);
      font-family: 'DM Sans', 'PingFang SC', sans-serif;
    }
    .canvas-section h2 .badge { font-size:11px; font-weight:400; color:#737373; margin-left:8px; }
    .canvas-section .subtitle { color:#A1A1A1; font-size:12px; margin-bottom:12px; }
    .color-chip-row { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
    .color-chip {
      display:flex; flex-direction:column; align-items:center;
      gap:4px; min-width:56px;
    }
    .color-chip .swatch {
      width:44px; height:44px; border-radius:10px;
      border:1px solid rgba(255,255,255,0.06);
    }
    .color-chip .label { color:#A1A1A1; font-size:10px; text-align:center; }
    .color-chip .value { color:#737373; font-size:9px; font-family:monospace; }
    .btn-demo-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
    .btn-demo {
      padding:8px 16px; border-radius:8px; border:none;
      font-size:13px; cursor:pointer;
      font-family:inherit; font-weight:500;
      transition: background 0.14s, color 0.14s;
    }
    .btn-demo.btn-primary { background:#0A0A0A; color:#FAFAFA; border:1px solid rgba(255,255,255,0.09); }
    .btn-demo.btn-primary:hover { background:#262626; }
    .btn-demo.btn-blue { background:rgba(63,162,255,0.15); color:#3FA2FF; border:1px solid #3FA2FF; }
    .btn-demo.btn-blue:hover { background:rgba(63,162,255,0.25); }
    .btn-demo.btn-purple { background:rgba(193,119,255,0.15); color:#C177FF; border:1px solid #C177FF; }
    .btn-demo.btn-purple:hover { background:rgba(193,119,255,0.25); }
    .btn-demo.btn-success { background:rgba(0,193,106,0.15); color:#00C16A; border:1px solid #00C16A; }
    .btn-demo.btn-success:hover { background:rgba(0,193,106,0.25); }
    .btn-demo.btn-danger { background:rgba(255,100,103,0.15); color:#FF6467; border:1px solid #FF6467; }
    .btn-demo.btn-danger:hover { background:rgba(255,100,103,0.25); }
    .typo-preview { margin-bottom:8px; }
    .typo-preview .typo-hero {
      font-size:48px; font-weight:700; color:#FAFAFA;
      line-height:0.95; font-family:'DM Sans','PingFang SC',sans-serif; margin-bottom:16px;
    }
    .typo-preview .typo-h1 { font-size:28px; font-weight:600; color:#FAFAFA; line-height:1.0; margin-bottom:8px; }
    .typo-preview .typo-h2 { font-size:20px; font-weight:600; color:#D4D4D4; line-height:1.15; margin-bottom:6px; }
    .typo-preview .typo-body { font-size:14px; font-weight:400; color:#A1A1A1; line-height:1.5; }
    .typo-preview .typo-small { font-size:11px; font-weight:400; color:#737373; line-height:1.4; }
    .spacing-row { display:flex; flex-direction:column; gap:10px; }
    .spacing-item { display:flex; align-items:center; gap:12px; }
    .spacing-item .bar {
      height:12px; border-radius:6px;
      background: linear-gradient(90deg, #3FA2FF, #C177FF);
    }
    .spacing-item .s-label { color:#D4D4D4; font-size:11px; min-width:64px; }
    .spacing-item .s-value { color:#737373; font-size:10px; font-family:monospace; }
    .glass-demo {
      margin-top:12px; background:rgba(23,23,23,0.5);
      backdrop-filter: blur(35px) saturate(150%);
      -webkit-backdrop-filter: blur(35px) saturate(150%);
      border:1px solid rgba(255,255,255,0.09);
      border-radius:14px; padding:16px 20px;
    }
    .glass-demo .glass-title { color:#FAFAFA; font-size:14px; font-weight:500; margin-bottom:6px; }
    .glass-demo .glass-desc { color:#A1A1A1; font-size:11px; }
    .floating-tag {
      position: absolute; background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.06);
      border-radius:8px; padding:4px 10px;
      color:#737373; font-size:10px; pointer-events:none;
    }
    @media (max-width:768px) {
      .canvas-section { width:calc(100vw - 32px); padding:16px 18px; }
      .canvas-controls { padding:8px 14px; gap:6px; }
      .canvas-controls .hint { display:none; }
    }
  </style>
</head>
<body>
  <div class="canvas-controls">
    <button data-action="zoom-out">−</button>
    <span class="scale-text" id="scaleDisplay">100%</span>
    <button data-action="zoom-in">+</button>
    <button data-action="reset" style="width:auto;padding:0 12px;font-size:12px;">⌂ 重置</button>
    <span class="hint"><kbd>Space</kbd>+拖拽 · <kbd>⌘</kbd>+滚轮</span>
    <a href="index.html" class="back-link">← 返回首页</a>
  </div>

  <div id="canvas-viewport">
    <div id="canvas-stage">
      <div class="canvas-grid"></div>
      <div class="canvas-content">
        <!-- ① 标题区 -->
        <div class="canvas-section" style="left:80px;top:60px;width:500px;">
          <h2>🎬 UP 梦工厂 · 设计系统 <span class="badge">v1.0.0</span></h2>
          <div class="subtitle">哔哩哔哩自研 AI 视频创作工具 — 暗色毛玻璃设计语言</div>
          <div style="display:flex;gap:12px;margin-top:8px;">
            <span style="width:8px;height:8px;border-radius:2px;background:#3FA2FF;display:inline-block;"></span><span style="color:#737373;font-size:11px;margin-left:6px;">品牌蓝</span>
            <span style="width:8px;height:8px;border-radius:2px;background:#C177FF;display:inline-block;"></span><span style="color:#737373;font-size:11px;margin-left:6px;">AI 紫</span>
            <span style="width:8px;height:8px;border-radius:2px;background:#FF6699;display:inline-block;"></span><span style="color:#737373;font-size:11px;margin-left:6px;">B 站粉</span>
            <span style="width:8px;height:8px;border-radius:2px;background:#00C16A;display:inline-block;"></span><span style="color:#737373;font-size:11px;margin-left:6px;">成功绿</span>
          </div>
        </div>
        <!-- ② 品牌色板 -->
        <div class="canvas-section" style="left:80px;top:280px;">
          <h2>🎨 品牌色板</h2>
          <div class="color-chip-row">
            <div class="color-chip"><div class="swatch" style="background:#E8F0FF;"></div><span class="label">50</span><span class="value">#E8F0FF</span></div>
            <div class="color-chip"><div class="swatch" style="background:#B8DAFF;"></div><span class="label">100</span><span class="value">#B8DAFF</span></div>
            <div class="color-chip"><div class="swatch" style="background:#3FA2FF;"></div><span class="label">500 · 主</span><span class="value">#3FA2FF</span></div>
            <div class="color-chip"><div class="swatch" style="background:#1A7FE6;"></div><span class="label">700</span><span class="value">#1A7FE6</span></div>
            <div class="color-chip"><div class="swatch" style="background:#0A52A0;"></div><span class="label">900</span><span class="value">#0A52A0</span></div>
          </div>
          <h2 style="margin-top:16px;font-size:14px;">🌈 品牌色</h2>
          <div class="color-chip-row">
            <div class="color-chip"><div class="swatch" style="background:#00A1D6;"></div><span class="label">B 站蓝</span><span class="value">#00A1D6</span></div>
            <div class="color-chip"><div class="swatch" style="background:#FF6699;"></div><span class="label">B 站粉</span><span class="value">#FF6699</span></div>
            <div class="color-chip"><div class="swatch" style="background:#C177FF;"></div><span class="label">AI 紫</span><span class="value">#C177FF</span></div>
          </div>
        </div>
        <!-- ③ 中性色 -->
        <div class="canvas-section" style="left:80px;top:540px;">
          <h2>⬛ 中性色板 <span class="badge">暗色主题</span></h2>
          <div class="color-chip-row">
            <div class="color-chip"><div class="swatch" style="background:#FAFAFA;"></div><span class="label">50</span><span class="value">#FAFAFA</span></div>
            <div class="color-chip"><div class="swatch" style="background:#D4D4D4;"></div><span class="label">300</span><span class="value">#D4D4D4</span></div>
            <div class="color-chip"><div class="swatch" style="background:#A1A1A1;"></div><span class="label">400</span><span class="value">#A1A1A1</span></div>
            <div class="color-chip"><div class="swatch" style="background:#737373;"></div><span class="label">500</span><span class="value">#737373</span></div>
            <div class="color-chip"><div class="swatch" style="background:#404040;"></div><span class="label">700</span><span class="value">#404040</span></div>
            <div class="color-chip"><div class="swatch" style="background:#171717;"></div><span class="label">900</span><span class="value">#171717</span></div>
            <div class="color-chip"><div class="swatch" style="background:#0A0A0A;border-color:rgba(255,255,255,0.15);"></div><span class="label">950</span><span class="value">#0A0A0A</span></div>
          </div>
          <h2 style="margin-top:16px;font-size:14px;">🔴 语义色</h2>
          <div class="color-chip-row">
            <div class="color-chip"><div class="swatch" style="background:#00C16A;"></div><span class="label">成功</span><span class="value">#00C16A</span></div>
            <div class="color-chip"><div class="swatch" style="background:#FD9A00;"></div><span class="label">警告</span><span class="value">#FD9A00</span></div>
            <div class="color-chip"><div class="swatch" style="background:#FF6467;"></div><span class="label">错误</span><span class="value">#FF6467</span></div>
            <div class="color-chip"><div class="swatch" style="background:#3FA2FF;"></div><span class="label">信息</span><span class="value">#3FA2FF</span></div>
          </div>
        </div>
        <!-- ④ 排版系统 -->
        <div class="canvas-section" style="left:80px;top:820px;">
          <h2>🔤 排版系统</h2>
          <div class="typo-preview">
            <div class="typo-hero">112px Hero</div>
            <div class="typo-h1">H1 页面大标题 · 56px</div>
            <div class="typo-h2">H2 区块标题 · 32px</div>
            <div class="typo-body">正文 (Body) · 16px。UP 梦工厂是哔哩哔哩自研的 AI 视频创作产品。</div>
            <div class="typo-small">辅助文字 Small · 13px · 用于标注和说明</div>
            <div style="margin-top:12px;color:#525252;font-size:10px;">字体: DM Sans / Plus Jakarta Sans / PingFang SC</div>
          </div>
        </div>
        <!-- ⑤ 按钮系统 -->
        <div class="canvas-section" style="left:620px;top:280px;">
          <h2>🔘 按钮系统</h2>
          <div class="subtitle">6 种语义化变体，毛玻璃透明底色</div>
          <div class="btn-demo-row">
            <button class="btn-demo btn-primary">主按钮</button>
            <button class="btn-demo btn-blue">信息</button>
            <button class="btn-demo btn-purple">AI 助手</button>
          </div>
          <div class="btn-demo-row">
            <button class="btn-demo btn-success">成功</button>
            <button class="btn-demo btn-danger">危险</button>
            <button class="btn-demo btn-primary" style="background:transparent;border-color:#404040;">次要</button>
          </div>
          <div class="glass-demo">
            <div class="glass-title">毛玻璃面板 · Glass Panel</div>
            <div class="glass-desc">backdrop-filter: blur(35px) saturate(150%) · border-radius: 20px</div>
          </div>
        </div>
        <!-- ⑥ 圆角 + 阴影 -->
        <div class="canvas-section" style="left:620px;top:540px;">
          <h2>📐 圆角 & 阴影</h2>
          <div class="color-chip-row" style="margin-bottom:16px;">
            <div class="color-chip"><div class="swatch" style="border-radius:4px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.06);"></div><span class="label">4px · SM</span></div>
            <div class="color-chip"><div class="swatch" style="border-radius:8px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.06);"></div><span class="label">8px · MD</span></div>
            <div class="color-chip"><div class="swatch" style="border-radius:12px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.06);"></div><span class="label">12px · LG</span></div>
            <div class="color-chip"><div class="swatch" style="border-radius:20px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.06);"></div><span class="label">20px · XL</span></div>
            <div class="color-chip"><div class="swatch" style="border-radius:9999px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.06);"></div><span class="label">无穷大</span></div>
          </div>
        </div>
        <!-- ⑦ 间距系统 -->
        <div class="canvas-section" style="left:620px;top:800px;">
          <h2>↔️ 间距系统</h2>
          <div class="spacing-row">
            <div class="spacing-item"><span class="s-label">xs · 4px</span><div class="bar" style="width:4px;"></div></div>
            <div class="spacing-item"><span class="s-label">sm · 8px</span><div class="bar" style="width:16px;"></div></div>
            <div class="spacing-item"><span class="s-label">md · 12px</span><div class="bar" style="width:48px;"></div></div>
            <div class="spacing-item"><span class="s-label">lg · 16px</span><div class="bar" style="width:80px;"></div></div>
            <div class="spacing-item"><span class="s-label">xl · 24px</span><div class="bar" style="width:140px;"></div></div>
          </div>
        </div>
        <!-- ⑧ 设计说明 -->
        <div class="canvas-section" style="left:620px;top:1020px;">
          <h2>💡 设计语言摘要</h2>
          <div style="color:#A1A1A1;font-size:12px;line-height:1.6;">
            <p>🎯 <strong style="color:#D4D4D4;">暗色沉浸</strong> — 默认暗色模式，深邃黑 #0A0A0A 为基底</p>
            <p>🪟 <strong style="color:#D4D4D4;">毛玻璃分层</strong> — blur(35px) + 透明底 + 高光边框构建 Z 轴层次</p>
            <p>🌈 <strong style="color:#D4D4D4;">霓虹点缀</strong> — 蓝 #3FA2FF · 紫 #C177FF · 粉 #FF6699</p>
            <p style="margin-top:10px;color:#737373;">数据来源: bilibili.com/updream · 2026-06-04</p>
          </div>
        </div>
        <div class="floating-tag" style="left:500px;top:250px;">品牌色 5 级色阶</div>
        <div class="floating-tag" style="left:500px;top:510px;">中性色 50-950 完整色板</div>
        <div class="floating-tag" style="left:500px;top:790px;">9 级字号层级</div>
        <div class="floating-tag" style="left:1040px;top:250px;">6 种语义按钮变体</div>
        <div class="floating-tag" style="left:1040px;top:510px;">5 级圆角 + 3 级阴影</div>
        <div class="floating-tag" style="left:1040px;top:770px;">6 级间距 Token</div>
      </div>
    </div>
  </div>

  <script>
    (function(){
      'use strict';
      var vp=document.getElementById('canvas-viewport'),st=document.getElementById('canvas-stage'),se=document.getElementById('scaleDisplay');
      if(!vp||!st)return;
      var s=1,px=0,py=0,dr=false,ds={x:0,y:0},dp={x:0,y:0},vx=0,vy=0,ir=null,mh=[];
      function at(){st.style.transform='translate('+px+'px,'+py+'px) scale('+s+')';if(se)se.textContent=Math.round(s*100)+'%';}
      function zc(cx,cy){return{x:vp.clientWidth/2,y:vp.clientHeight/2};}
      function za(ns,cx,cy){var ps=s;s=Math.min(5,Math.max(0.15,ns));px=cx-(cx-px)*(s/ps);py=cy-(cy-py)*(s/ps);at();sv();}
      function rv(){
        var els=document.querySelectorAll('.canvas-section,.floating-tag');
        if(!els.length)return;
        var mnx=Infinity,mny=Infinity,mxx=-Infinity,mxy=-Infinity;
        els.forEach(function(e){var l=parseInt(e.style.left)||0,t=parseInt(e.style.top)||0,w=e.offsetWidth||440,h=e.offsetHeight||200;mnx=Math.min(mnx,l-40);mny=Math.min(mny,t-40);mxx=Math.max(mxx,l+w+40);mxy=Math.max(mxy,t+h+40);});
        var cw=mxx-mnx,ch=mxy-mny,fs=Math.min(vp.clientWidth/cw,vp.clientHeight/ch,1)*0.85,cx=(mnx+mxx)/2,cy=(mny+mxy)/2,ct=zc();
        var ss=s,spx=px,spy=py,ts=fs,tpx=ct.x-cx*fs,tpy=ct.y-cy*fs,stt=Date.now(),dur=500;
        function an(){var el=Date.now()-stt,t=Math.min(el/dur,1),e=1-Math.pow(1-t,3);s=ss+(ts-ss)*e;px=spx+(tpx-spx)*e;py=spy+(tpy-spy)*e;at();if(t<1)requestAnimationFrame(an);else sv();}
        an();
      }
      function sv(){try{localStorage.setItem('updream-canvas-state',JSON.stringify({scale:s,panX:px,panY:py}));}catch(e){}}
      function ld(){try{var d=localStorage.getItem('updream-canvas-state');if(d){var st2=JSON.parse(d);s=st2.scale||1;px=st2.panX||0;py=st2.panY||0;at();return true;}}catch(e){}return false;}
      vp.addEventListener('pointerdown',function(e){if(e.target.closest('button,a,.btn-demo'))return;dr=true;ds.x=e.clientX-px;ds.y=e.clientY-py;dp.x=px;dp.y=py;vp.setPointerCapture(e.pointerId);mh=[];if(ir){cancelAnimationFrame(ir);ir=null;}vx=0;vy=0;});
      vp.addEventListener('pointermove',function(e){if(!dr)return;px=dp.x+e.clientX-ds.x;py=dp.y+e.clientY-ds.y;at();mh.push({x:e.clientX,y:e.clientY,t:Date.now()});if(mh.length>10)mh.shift();});
      vp.addEventListener('pointerup',function(e){if(!dr)return;dr=false;vp.releasePointerCapture(e.pointerId);if(mh.length>2){var l=mh[mh.length-1],f=mh[0],dt=l.t-f.t;if(dt>0&&dt<200){vx=(l.x-f.x)/dt*16;vy=(l.y-f.y)/dt*16;if(Math.sqrt(vx*vx+vy*vy)>0.5)!function(){var fc=0.92;function stp(){vx*=fc;vy*=fc;px+=vx;py+=vy;at();if(Math.abs(vx)>0.1||Math.abs(vy)>0.1)ir=requestAnimationFrame(stp);else{ir=null;sv();}}ir=requestAnimationFrame(stp);}();}}sv();});
      vp.addEventListener('wheel',function(e){e.preventDefault();var d=e.deltaY>0?0.9:1.1;if(e.ctrlKey||e.metaKey)d=e.deltaY>0?0.95:1.05;za(s*d,e.clientX,e.clientY);},{passive:false});
      var tc=[];
      vp.addEventListener('touchstart',function(e){tc=Array.from(e.touches);if(tc.length===1){if(e.target.closest('button,a,.btn-demo'))return;dr=true;ds.x=tc[0].clientX-px;ds.y=tc[0].clientY-py;dp.x=px;dp.y=py;mh=[];if(ir){cancelAnimationFrame(ir);ir=null;}}},{passive:true});
      vp.addEventListener('touchmove',function(e){var nt=Array.from(e.touches);if(nt.length===1&&dr){e.preventDefault();px=dp.x+nt[0].clientX-ds.x;py=dp.y+nt[0].clientY-ds.y;at();mh.push({x:nt[0].clientX,y:nt[0].clientY,t:Date.now()});if(mh.length>10)mh.shift();}if(nt.length===2){e.preventDefault();var t1=nt[0],t2=nt[1],pt1=tc[0],pt2=tc[1];if(pt1&&pt2){var dn=Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY),dp2=Math.hypot(pt1.clientX-pt2.clientX,pt1.clientY-pt2.clientY);za(s*dn/dp2,(t1.clientX+t2.clientX)/2,(t1.clientY+t2.clientY)/2);}tc=nt;}},{passive:false});
      vp.addEventListener('touchend',function(e){tc=Array.from(e.touches);if(e.touches.length===0&&dr){dr=false;sv();}},{passive:true});
      document.addEventListener('keydown',function(e){if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if(e.key==='+'||e.key==='='){e.preventDefault();za(s*1.25,vp.clientWidth/2,vp.clientHeight/2);}if(e.key==='-'){e.preventDefault();za(s/1.25,vp.clientWidth/2,vp.clientHeight/2);}if(e.key==='r'||e.key==='R'||e.key==='0'){e.preventDefault();rv();}});
      document.querySelectorAll('[data-action]').forEach(function(b){b.addEventListener('click',function(){var a=this.dataset.action;if(a==='zoom-in')za(s*1.3,vp.clientWidth/2,vp.clientHeight/2);if(a==='zoom-out')za(s/1.3,vp.clientWidth/2,vp.clientHeight/2);if(a==='reset')rv();});});
      window.addEventListener('resize',function(){var vs=document.querySelectorAll('.canvas-section'),vis=Array.from(vs).some(function(s){var r=s.getBoundingClientRect();return r.right>0&&r.left<vp.clientWidth;});if(!vis)rv();});
      if(!ld())setTimeout(rv,100);
    })();
  </script>
</body>
</html>
```

---

# 📊 设计系统摘要

## 核心数据

| 指标 | 数值 |
|------|------|
| 设计流派 | 暗色模式 + 毛玻璃 + 科技/AI 现代风 |
| CSS Token 数 | 78 个 |
| DESIGN.md 章节 | 7 章 |
| 画布内容区 | 8 个交互卡片 |
| 颜色系统 | 品牌色 5 级 + 6 语义色 + 10 级中性色 |
| 字体层级 | 9 级 (Hero → Tiny) |
| 按钮变体 | 6 种 (Primary/Info/Success/Warning/Danger/Help) |
| 间距系统 | 6 级 (xs → 2xl) |

## 设计品牌色

```
品牌蓝  #3FA2FF  ●●●●  主色（交互、链接、信息按钮）
AI 紫   #C177FF  ●●●●  AI 功能强调、特殊标注
B 站粉  #FF6699  ●●●●  个性化强调、品牌标识
成功绿  #00C16A  ●●●●  成功状态
警告橙  #FD9A00  ●●●●  警告状态
错误红  #FF6467  ●●●●  错误、删除状态
```

## 使用方式

**单独提取 DESIGN.md:**
从 `# 📖 第一部分` 到 `---` 标记之间复制

**单独提取 tokens.css:**
从 `# 🎨 第二部分` 到 `\`\`\`` 结束之间复制

**打开画布演示页:**
将 `# 🖥️ 第三部分` 中的完整 HTML 保存为 `.html` 文件，在浏览器中打开

---

*全量交付文件 · 2026-06-04 · design-system-architect Skill*
