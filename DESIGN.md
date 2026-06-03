# DESIGN.md — Apple 中国官网设计系统规范

> **版本：** 1.0.0
> **生成日期：** 2026-06-03
> **来源素材：** https://www.apple.com.cn
> **设计流派：** 极简主义 + 科技/SaaS 现代风
> **适用行业：** 消费电子、科技零售

---

## 1. 视觉主题概述

### 设计流派
Apple 官网以 **极简主义 (Minimalist)** 为核心基座，融合 **科技/SaaS 现代风** 的产品展示逻辑。大量留白、中性色为主体，以产品全彩视觉为唯一装饰元素，UI 本身高度克制——引导用户注意力完全聚焦在产品影像上。

### 设计核心理念
- **氛围**：简洁、高级、静谧、以产品为核心
- **关键词**：极简、留白、克制、精致、现代
- **核心理念**：最好的设计是让人感受不到设计的存在。UI 不喧宾夺主，让产品本身说话。

### 适用场景
- 高端消费品牌官网
- 产品展示型 Landing Page
- 全球多语言品牌首页

---

## 2. 颜色系统

> 注：颜色值来自 Apple 官方 CSS 编译结果（`rgb`/`rgba` 格式），已转为十六进制供前端直接使用。

### 2.1 品牌主色板

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-primary-50` | `#E8F4FD` | ████ | 极浅主色（背景色调） |
| `--color-primary-100` | `#B8DAFF` | ████ | 浅主色（hover 背景） |
| `--color-primary-500` | `#0071E3` | ████ | 主色（按钮、交互元素） |
| `--color-primary-700` | `#0066CC` | ████ | 深主色（链接文字） |
| `--color-primary-900` | `#004080` | ████ | 最深主色（Active 状态） |

**按钮状态色：**
- Hover：`#0076DF`
- Active：`#006EDB`

### 2.2 辅助色板

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-secondary-500` | `#1D1D1F` | ████ | 辅色（暗模式按钮/文字） |
| `--color-accent-500` | `#B64400` | ████ | 强调色（特殊标注/徽章） |
| `--color-success-500` | `#03A10E` | ████ | 成功状态 |
| `--color-warning-500` | `#FFE045` | ████ | 警告/促销标签 |
| `--color-error-500` | `#E30000` | ████ | 错误状态 |
| `--color-info-500` | `#2997FF` | ████ | 信息提示（暗模式链接色） |

### 2.3 中性色板（亮色模式）

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-neutral-50` | `#FFFFFF` | 页面主背景 |
| `--color-neutral-100` | `#FAFAFC` | 极浅背景 |
| `--color-neutral-150` | `#F5F5F7` | 产品卡片/区块背景 |
| `--color-neutral-200` | `#E8E8ED` | 边框/分割线 |
| `--color-neutral-300` | `#D2D2D7` | 轻边框/占位符 |
| `--color-neutral-500` | `#86868B` | 次要文字/辅助信息 |
| `--color-neutral-600` | `#6E6E73` | 副标题文字 |
| `--color-neutral-700` | `#424245` | 正文备选色 |
| `--color-neutral-900` | `#1D1D1F` | 标题/主文字 |

### 2.4 中性色板（暗色模式）

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-dark-bg` | `#000000` | 页面主背景 |
| `--color-dark-bg-secondary` | `#161617` | 次要背景 |
| `--color-dark-bg-tertiary` | `#1D1D1F` | 区块背景 |
| `--color-dark-text` | `#F5F5F7` | 主文字 |
| `--color-dark-text-secondary` | `#86868B` | 次要文字 |
| `--color-dark-border` | `#333336` | 边框 |
| `--color-dark-link` | `#2997FF` | 链接文字 |

### 2.5 语义色别名

| Alias Token | 映射值 | 用途 |
|-------------|--------|------|
| `--color-bg-primary` | `#FFFFFF` | 页面主背景 |
| `--color-bg-card` | `#F5F5F7` | 卡片/产品区块背景 |
| `--color-bg-dark` | `#000000` | 暗色区块背景 |
| `--color-text-primary` | `#1D1D1F` | 主标题/正文 |
| `--color-text-secondary` | `#6E6E73` | 副标题/辅助文字 |
| `--color-text-tertiary` | `#86868B` | 脚注/次要信息 |
| `--color-text-inverse` | `#FFFFFF` | 深色背景上文字 |
| `--color-link` | `#0066CC` | 超链接 |
| `--color-link-hover` | `#0071E3` | 链接悬停 |
| `--color-link-dark` | `#2997FF` | 暗模式链接 |
| `--color-border` | `#D2D2D7` | 边框/分割线 |
| `--color-button-primary` | `#0071E3` | 主按钮背景 |
| `--color-button-primary-hover` | `#0076DF` | 主按钮悬停 |
| `--color-button-primary-active` | `#006EDB` | 主按钮按下 |
| `--color-button-dark` | `#1D1D1F` | 暗色按钮背景 |
| `--color-button-dark-hover` | `#272729` | 暗色按钮悬停 |
| `--color-button-dark-active` | `#18181A` | 暗色按钮按下 |

---

## 3. 排版系统

### 3.1 字体家族

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-family-display` | `"SF Pro Display", "SF Pro Icons", "Helvetica Neue", "Helvetica", "Arial", sans-serif` | 标题/展示文字 |
| `--font-family-text` | `"SF Pro Text", "SF Pro Icons", "Helvetica Neue", "Helvetica", "Arial", sans-serif` | 正文/UI 文字 |
| `--font-family-cn` | `"SF Pro SC", "PingFang SC", "Helvetica Neue", "Helvetica", "Arial", sans-serif` | 中文内容 |
| `--font-family-mono` | `"SF Mono", "SF Pro Icons", "Menlo", "Monaco", "Consolas", monospace` | 代码字体 |

**语言适配：**
- 中文 (zh-CN)：`SF Pro SC`, `PingFang SC`
- 日文 (ja)：`SF Pro JP`, `Hiragino Kaku Gothic Pro`
- 韩文 (ko)：`SF Pro KR`, `Apple Gothic`
- 阿拉伯文 (ar)：`SF Pro AR`, `SF Pro Gulf`

### 3.2 字号层级

#### 大屏 (≥1069px)

| Token | 尺寸 | 行高 | 字重 | 字间距 | 用途 |
|-------|------|------|------|--------|------|
| `--font-size-hero` | `56px` | `1.071` | `600` (Semibold) | `-0.022em` | 首页 Hero 大标题 |
| `--font-size-display` | `40px` | `1.125` | `600` (Semibold) | `-0.016em` | 产品区块标题 |
| `--font-size-headline` | `24px` | `1.25` | `400` (Regular) | `+0.012em` | 副标题 |
| `--font-size-subhead` | `21px` | `1.25` | `400` (Regular) | `+0.012em` | 小副标题 |
| `--font-size-body` | `17px` | `1.470` | `400` (Regular) | `-0.022em` | 正文/按钮文字 |
| `--font-size-callout` | `14px` | `1.286` | `400` (Regular) | `-0.016em` | 标注/小字 |
| `--font-size-caption` | `12px` | `1.333` | `400` (Regular) | `-0.01em` | 脚注 |

#### 中屏 (735–1068px)

| 层级 | 尺寸 | 行高 |
|------|------|------|
| Hero | `48px` | `1.083` |
| 产品标题 | `32px` | `1.125` |
| 副标题 | `21px` | `1.25` |
| 正文 | `17px` | `1.470` |

#### 小屏 (≤734px)

| 层级 | 尺寸 | 行高 |
|------|------|------|
| Hero | `32px` | `1.125` |
| 产品标题 | `28px` | `1.143` |
| 副标题 | `17px` | `1.235` |
| 正文 | `14px` | `1.286` |

### 3.3 字重映射

| Token | 数值 | CSS 关键字 | 用途 |
|-------|------|-----------|------|
| `--font-weight-regular` | `400` | `normal` | 正文、副标题 |
| `--font-weight-medium` | `500` | `500` | 按钮文字 |
| `--font-weight-semibold` | `600` | `600` | 标题、Hero |
| `--font-weight-bold` | `700` | `bold` | 强调标题 |

> **注意：** SF Pro 字体的字重与 CSS `font-weight` 不完全一一对应。Semibold (600) 是 Apple 标题最常用的字重，Regular (400) 用于正文。

---

## 4. 组件样式

### 4.1 按钮

Apple 的按钮以**胶囊形圆角**为标志性特征，分两大类：填充按钮和边框链接按钮。

#### 主按钮 (Primary Blue)

| 状态 | 背景色 | 文字色 | 边框 | 阴影 |
|------|--------|--------|------|------|
| Normal | `#0071E3` | `#FFFFFF` | `transparent` | none |
| Hover | `#0076DF` | `#FFFFFF` | `transparent` | none |
| Active | `#006EDB` | `#FFFFFF` | `transparent` | none |
| Disabled | `—` | `—` | `—` | opacity: 0.42 |

```css
.button-primary {
  background: #0071E3;
  color: #FFFFFF;
  border: 1px solid transparent;
  padding: 9px 16px;
  border-radius: 980px;   /* 胶囊形 */
  font-size: 14px;
  line-height: 1.28577;
  font-weight: 400;
  letter-spacing: -0.016em;
  font-family: var(--font-family-text);
  cursor: pointer;
  transition: background 0.2s ease;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}
```

#### 暗色按钮 (Dark)

| 状态 | 背景色 | 文字色 |
|------|--------|--------|
| Normal | `#1D1D1F` | `#FFFFFF` |
| Hover | `#272729` | `#FFFFFF` |
| Active | `#18181A` | `#FFFFFF` |

#### 链接按钮 (Blue Outline)

| 状态 | 背景色 | 文字色 | 边框 |
|------|--------|--------|------|
| Normal | `transparent` | `#0066CC` | `1px solid #0066CC` |
| Hover | `#0071E3` | `#FFFFFF` | `1px solid #0071E3` |

#### 链接按钮 (Dark Outline)

| 状态 | 背景色 | 文字色 | 边框 |
|------|--------|--------|------|
| Normal | `transparent` | `#1D1D1F` | `1px solid #1D1D1F` |
| Hover | `#1D1D1F` | `#FFFFFF` | `1px solid #1D1D1F` |

#### 大按钮变体

```css
.button-large {
  padding: 18px 31px;
  font-size: 17px;
  line-height: 1.17648;
  letter-spacing: -0.022em;
  border-radius: 980px;    /* 保持胶囊形 */
  min-width: 90px;
}
```

#### 小按钮变体

```css
.button-small {
  padding: 4px 11px;
  font-size: 12px;
  line-height: 1.33337;
  letter-spacing: -0.01em;
  border-radius: 5px;      /* 更小圆角 */
  min-width: 45px;
}
```

### 4.2 导航栏 (GlobalNav)

Apple 全局导航栏是黑色半透明极简设计的标志。

| 属性 | 值 |
|------|-----|
| 背景色 | `rgba(0, 0, 0, 0.92)` |
| 文字色 | `rgba(255, 255, 255, 0.8)` / hover 变为 `#FFFFFF` |
| 高度 | `44px`（桌面）/ `48px`（移动端） |
| 位置 | `position: fixed; top: 0;` 固定顶部 |
| z-index | 极高值（盖过所有内容） |
| 对齐 | 水平居中，最大宽度 `~1024px` |
| 图标 | Apple Logo SVG（白色） |

**导航项：** 商店 / Mac / iPad / iPhone / Watch / AirPods / 电视与家居 / 娱乐 / 配件 / 技术支持

```css
.globalnav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: saturate(180%) blur(20px);  /* 毛玻璃效果 */
  z-index: 9999;
  font-family: var(--font-family-text);
  font-size: 14px;
}
```

### 4.3 英雄区 (Hero Section)

| 属性 | 值 |
|------|-----|
| 高度 | 视口高度或 ~580-700px |
| 背景 | 全幅产品图片，object-fit: cover |
| 标题对齐 | 居中（仅标题+CTA）/ 底部（带副标题） |
| 间距 | 顶部导航栏补偿 padding-top: 44px |

**Hero 内部元素间距：**
- 标题到副标题：`11px`
- 副标题到 CTA 按钮：`~20px`
- CTA 按钮组间距：`14px`（水平）

### 4.4 产品卡片 (Tile)

| 属性 | 值 |
|------|-----|
| 背景色 | `#F5F5F7`（浅灰卡片）或 `#000000`（深色卡片） |
| 圆角 | 无（直角） |
| 内边距 | 顶部 `~60px`，底部自适应 |
| 标题颜色 | `#1D1D1F`（浅卡片）/ `#F5F5F7`（深卡片） |
| 副标题颜色 | `#6E6E73`（浅卡片）/ `#86868B`（深卡片） |

### 4.5 促销徽章 (Badge)

| 属性 | 值 |
|------|-----|
| 背景色 | `rgba(245, 99, 0, 0.2)` |
| 文字色 | `rgb(255, 121, 27)` |
| 圆角 | 小圆角或直角 |
| 字体大小 | `14px` |

---

## 5. 布局原则

### 5.1 间距系统

Apple 的间距不遵循固定的 4px/8px 网格，而是基于视觉比例调整。以下为常见间距值：

| Token | 值 | 用途 |
|-------|-----|------|
| `--spacing-xs` | `9px` | 按钮垂直内边距 |
| `--spacing-sm` | `14px` | 按钮水平间距 |
| `--spacing-md` | `24px` | 栅格间距、区块内边距 |
| `--spacing-lg` | `39-44px` | 产品卡片上内边距 |
| `--spacing-xl` | `53-61px` | 大区块间距 |
| `--spacing-2xl` | `80-110px` | 页面顶级分区间距 |

### 5.2 断点系统

| Token | 值 | 设备 | 列数 |
|-------|-----|------|------|
| `--breakpoint-sm` | `734px` | 手机 | 4 列 |
| `--breakpoint-md` | `1068px` | 平板/小桌面 | 8 列 |
| `--breakpoint-lg` | `1440px` | 桌面 | 12 列 |
| `--breakpoint-xl` | `--` | 宽屏桌面 | 12 列 + 最大宽度限制 |

### 5.3 栅格系统

| 属性 | 值 |
|------|-----|
| 列数 | 12（自适应折叠） |
| 栅格间距 | `24px` |
| 页面左右边距 | `24px`（大屏）/ `16px`（小屏） |
| 最大内容宽度 | `~1200px`（Hero 图片可溢出） |
| 响应式策略 | **Desktop First**（Apple 以桌面端为主设计，向下兼容） |

### 5.4 阴影系统

Apple 官网极少使用阴影，保持扁平极简风格。

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-none` | `none` | 默认（无阴影） |
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.08)` | 轻度浮动（极少使用） |

### 5.5 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `5px` | 小按钮、标签 |
| `--radius-md` | `8px` | 按钮（移动端）、小卡片 |
| `--radius-lg` | `12px` | 大按钮（移动端变体） |
| `--radius-full` | `980px` | 胶囊形按钮（所有桌面按钮） |

> **注意：** `980px` 是 Apple 标志性的胶囊形按钮圆角值，远比实际需要大，仅用于确保按钮两端永远是半圆形。

### 5.6 页面结构层次

```
┌─────────────────────────────────────┐
│           GlobalNav (44px)          │  ← fixed, z-index: 9999
├─────────────────────────────────────┤
│      GlobalMessage (公告横幅)        │  ← 可变高度
├─────────────────────────────────────┤
│                                     │
│    Hero: iPhone 16 Pro              │  ← 全幅视口
│    [大标题 + 副标题 + CTA 按钮]      │     高度: 视口高度
│    [产品图片]                        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    Hero: iPhone 16                  │  ← 全幅
│    [大标题 + 副标题 + CTA]           │
│    [产品图片]                        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ▓▓▓ iPad Pro ▓▓▓  │  MacBook ▓▓▓│  ← 2列 (大屏) / 1列 (小屏)
│    标题 + CTA         │  标题 + CTA │     背景: #F5F5F7
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ▓ iPhone 16 Pro ▓  │  ▓ 其他 ▓   │  ← 2列
│    标题 + CTA         │  标题 + CTA │
│                                     │
├─────────────────────────────────────┤
│  底部购物指南栏                       │  ← 浅灰背景
├─────────────────────────────────────┤
│   GlobalFooter (页脚)                │  ← 深灰背景
│   多列链接 + 法律信息                 │
└─────────────────────────────────────┘
```

---

## 6. 设计禁忌 (Do's and Don'ts)

### ✅ Do's（推荐做法）

1. **极致留白** — 区块之间保持充足间距（53-61px），让每个产品区域呼吸
2. **文字与背景高对比度** — 主文字 `#1D1D1F` 在白色背景上，确保可读性
3. **以产品图片为核心** — UI 元素不遮盖产品细节，图片占版面 60% 以上
4. **一致的按钮语言** — 所有按钮统一胶囊形圆角（980px），同一页面不混用不同按钮风格
5. **响应式字号缩减** — 大屏到小屏按比例缩小字号，保持视觉层级清晰
6. **深色/亮色模式兼容** — 同时定义两套中性色板，通过 `@media (prefers-color-scheme: dark)` 切换
7. **导航毛玻璃效果** — 导航栏使用 `backdrop-filter: blur(20px)` 增强层次感

### ❌ Don'ts（应避免）

1. **不使用背景图案或纹理** — Apple 的纯色背景是设计特征，不添加水印、纹理或复杂背景图
2. **避免多余装饰** — 不添加阴影、渐变、花哨边框、动画特效（产品图片本身已足够）
3. **不混用多种蓝色** — 品牌蓝 `#0071E3` 和链接蓝 `#0066CC` 是仅有的两种蓝色，不引入其他蓝色调
4. **避免信息过载** — 每个产品区块最多展示 1 个标题 + 1 个副标题 + 2 个 CTA，不堆砌文字
5. **不使用怪异的字体** — 限制在 SF Pro 字体家族内，不使用衬线、手写或装饰性字体
6. **不将标题与产品图片重叠** — 标题在图片上方或下方，不遮挡产品关键区域
7. **避免非对称布局** — 所有内容居中对齐，不采用左侧/右侧对齐的杂志风格

---

> **调用方式：** 本文件为 Apple 中国官网的设计规范文档，可直接提供给 Claude Code 或其他 AI 工具
> 作为代码生成的设计依据。在生成 UI 组件代码前，请先加载本文件作为设计参考。
