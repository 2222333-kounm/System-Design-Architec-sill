# DESIGN.md — 设计系统规范文档

> 版本：1.0.0  
> 生成日期：{{DATE}}  
> 来源素材：{{INPUT_SOURCE}}  
> 设计流派：{{DESIGN_STYLE}}  
> 适用行业：{{INDUSTRY}}

---

## 1. 视觉主题概述

### 设计流派
{{DESIGN_STYLE_DESCRIPTION}}

### 设计核心理念
- **氛围**：{{ATMOSPHERE}}
- **关键词**：{{KEYWORDS}}
- **灵感来源**：{{INSPIRATION}}

### 适用场景
{{USE_SCENARIOS}}

---

## 2. 颜色系统

### 2.1 品牌主色板

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-primary-50` | `#{{HEX}}` | ████ | 极浅主色（背景） |
| `--color-primary-100` | `#{{HEX}}` | ████ | 浅主色（hover 背景） |
| `--color-primary-500` | `#{{HEX}}` | ████ | 主色（按钮、链接） |
| `--color-primary-700` | `#{{HEX}}` | ████ | 深主色（hover 状态） |
| `--color-primary-900` | `#{{HEX}}` | ████ | 最深主色（文字） |

### 2.2 辅助色板

| Token | 色值 | 色块 | 用途 |
|-------|------|------|------|
| `--color-secondary-500` | `#{{HEX}}` | ████ | 辅色（次要操作） |
| `--color-accent-500` | `#{{HEX}}` | ████ | 强调色（高亮、标签） |
| `--color-success-500` | `#{{HEX}}` | ████ | 成功状态 |
| `--color-warning-500` | `#{{HEX}}` | ████ | 警告状态 |
| `--color-error-500` | `#{{HEX}}` | ████ | 错误状态 |
| `--color-info-500` | `#{{HEX}}` | ████ | 信息提示 |

### 2.3 中性色板

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-neutral-50` | `#{{HEX}}` | 页面背景 |
| `--color-neutral-100` | `#{{HEX}}` | 卡片/区块背景 |
| `--color-neutral-200` | `#{{HEX}}` | 边框/分割线 |
| `--color-neutral-500` | `#{{HEX}}` | 次要文字 |
| `--color-neutral-700` | `#{{HEX}}` | 正文 |
| `--color-neutral-900` | `#{{HEX}}` | 标题/强调文字 |

### 2.4 语义色别名

| Alias Token | 映射值 | 用途 |
|-------------|--------|------|
| `--color-bg-primary` | `--color-neutral-50` | 页面主背景 |
| `--color-bg-card` | `--color-neutral-100` | 卡片背景 |
| `--color-text-primary` | `--color-neutral-900` | 主文字 |
| `--color-text-secondary` | `--color-neutral-500` | 次要文字 |
| `--color-border` | `--color-neutral-200` | 边框 |

---

## 3. 排版系统

### 3.1 字体家族

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-family-sans` | `{{FONT_STACK_SANS}}` | 正文字体 |
| `--font-family-serif` | `{{FONT_STACK_SERIF}}` | 标题字体（可选） |
| `--font-family-mono` | `{{FONT_STACK_MONO}}` | 代码字体 |

### 3.2 字号层级

| Token | 尺寸 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `--font-size-h1` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 页面大标题 |
| `--font-size-h2` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 区块标题 |
| `--font-size-h3` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 卡片标题 |
| `--font-size-h4` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 小标题 |
| `--font-size-body` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 正文 |
| `--font-size-small` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 辅助文字 |
| `--font-size-caption` | `{{SIZE}}` | `{{LINE_HEIGHT}}` | `{{WEIGHT}}` | 标注文字 |

### 3.3 字重映射

| Token | 数值 | 名称 |
|-------|------|------|
| `--font-weight-regular` | `400` | 常规 |
| `--font-weight-medium` | `500` | 中等 |
| `--font-weight-semibold` | `600` | 半粗 |
| `--font-weight-bold` | `700` | 粗体 |

### 3.4 排版示例

```markdown
# h1 — 页面大标题 ({{SIZE}})
## h2 — 区块标题 ({{SIZE}})
### h3 — 卡片标题 ({{SIZE}})

正文示例：这是一个设计系统的排版示例文本。
辅助文字用于标注和说明。
```

---

## 4. 组件样式

### 4.1 按钮

#### 主按钮 (Primary)

| 状态 | 背景色 | 文字色 | 边框 | 阴影 |
|------|--------|--------|------|------|
| Normal | `--color-primary-500` | `#FFFFFF` | none | `--shadow-sm` |
| Hover | `--color-primary-700` | `#FFFFFF` | none | `--shadow-md` |
| Active | `--color-primary-900` | `#FFFFFF` | none | none |
| Disabled | `--color-neutral-200` | `--color-neutral-500` | none | none |

```css
.btn-primary {
  background: var(--color-primary-500);
  color: #FFFFFF;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}
```

#### 次要按钮 (Secondary)

| 状态 | 背景色 | 文字色 | 边框 |
|------|--------|--------|------|
| Normal | transparent | `--color-primary-500` | `1px solid --color-primary-500` |
| Hover | `--color-primary-50` | `--color-primary-700` | `1px solid --color-primary-700` |
| Disabled | transparent | `--color-neutral-300` | `1px solid --color-neutral-300` |

### 4.2 输入框

| 状态 | 边框 | 背景 | 圆角 |
|------|------|------|------|
| Normal | `1px solid --color-neutral-200` | `--color-neutral-50` | `--radius-md` |
| Focus | `2px solid --color-primary-500` | `#FFFFFF` | `--radius-md` |
| Error | `1px solid --color-error-500` | `--color-error-50` | `--radius-md` |
| Disabled | `1px solid --color-neutral-100` | `--color-neutral-100` | `--radius-md` |

### 4.3 卡片

```css
.card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}
```

### 4.4 导航

- **导航栏背景色**：`--color-bg-primary`
- **导航链接**：`--color-text-secondary` → hover 变为 `--color-primary-500`
- **激活状态**：`--color-primary-500` + 下划线或底部指示器
- **高度**：`64px`（桌面）/ `56px`（移动端）

---

## 5. 布局原则

### 5.1 间距系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--spacing-xs` | `{{SIZE}}` | 元素内小间距 |
| `--spacing-sm` | `{{SIZE}}` | 元素间间距 |
| `--spacing-md` | `{{SIZE}}` | 区块内间距 |
| `--spacing-lg` | `{{SIZE}}` | 区块间间距 |
| `--spacing-xl` | `{{SIZE}}` | 大区块间距 |
| `--spacing-2xl` | `{{SIZE}}` | 页面分区间距 |

### 5.2 断点系统

| Token | 值 | 设备 |
|-------|-----|------|
| `--breakpoint-sm` | `640px` | 手机横屏 |
| `--breakpoint-md` | `768px` | 平板 |
| `--breakpoint-lg` | `1024px` | 桌面 |
| `--breakpoint-xl` | `1280px` | 宽屏桌面 |

### 5.3 栅格系统

- **列数**：12 列栅格
- **间距**：`--spacing-md`（16px/1rem）
- **最大容器宽度**：`1200px`
- **响应式策略**：Mobile First

### 5.4 阴影系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 卡片默认 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | 下拉菜单 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 模态框 |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | 通知弹窗 |

### 5.5 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `4px` | 输入框、小元素 |
| `--radius-md` | `8px` | 卡片、按钮 |
| `--radius-lg` | `12px` | 模态框、大卡片 |
| `--radius-xl` | `16px` | 特殊容器 |
| `--radius-full` | `9999px` | 胶囊/标签 |

---

## 6. 设计禁忌 (Do's and Don'ts)

### ✅ Do's（推荐做法）

1. **保持颜色一致性**：主色、辅色、语义色严格遵循 Token 定义，不在组件中硬编码颜色值
2. **遵循间距韵律**：使用间距 Token 而非随意数值，保持视觉节奏感
3. **关注可访问性**：确保文字与背景的对比度 ≥ 4.5:1（WCAG AA 标准）
4. **交互反馈**：每个可交互元素都有 hover/focus/active 状态样式
5. **响应式优先**：先设计移动端布局，再逐步扩展到桌面

### ❌ Don'ts（应避免）

1. **不引入未定义的额外颜色**：所有颜色必须来自颜色系统
2. **不使用近似颜色**：严格使用 Token 中的精确十六进制值
3. **不混合设计流派**：保持设计语言的一致性
4. **不忽略空状态和边缘状态**：考虑加载态、空数据态、错误态
5. **不创建孤立的样式**：每个新组件样式都应纳入 Token 体系

---

> **调用方式**：本文件为设计规范文档，可直接提供给 Claude Code 或其他 AI 工具  
> 作为代码生成的设计依据。在生成 UI 组件代码前，请先加载本文件作为设计参考。
