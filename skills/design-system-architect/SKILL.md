---
name: design-system-architect
description: Use when given a webpage URL or design screenshot and asked to produce a structured design system (design tokens, color system, typography, component styles) as a DESIGN.md file for downstream AI code generation
---

# 设计系统架构师 (Design System Architect)

## 概述

从视觉素材（网页链接或设计截图）中逆向工程出完整的设计系统，输出结构化的 Design Token 体系和 DESIGN.md 规范文档，桥接视觉设计与代码实现之间的鸿沟。

## 何时使用

- 用户提供一个网页 URL，要求分析其设计风格并生成设计规范
- 用户提供一张设计截图/图片，要求提取视觉元素并构建设计系统
- 需要在代码生成之前先建立统一的设计语言和 Design Token
- 项目需要一份 AI 可读的设计规范文档来指导后续 UI 开发

**不适用的场景：**
- 已有现成的设计规范文档，只需代码实现
- 需要生成 Figma/Sketch 等设计工具文件（本技能只输出 Markdown）
- 用户提供的素材不包含视觉设计信息（如纯文本、代码片段）

## 核心工作流

```
输入素材 ──→ 感知层分析 ──→ 设计推理与匹配 ──→ Token体系构建 ──→ 输出DESIGN.md
  (URL/图片)    (提取原始样式)    (匹配风格流派)     (结构化Token)      (完整文档)
```

### 1. 接收输入素材

确认输入类型：
- **网页链接**：需可公开访问，准备进行 CSS 样式提取
- **设计截图**：需清晰展示设计元素（配色、排版、组件），准备进行视觉分析

### 2. 感知层分析

#### 网页链接模式
使用浏览器脚本或内联 CSS 解析方式读取以下 computed 样式：
- **颜色**：主色、辅色、背景色、文字色、边框色、hover/active 状态色
- **排版**：字体家族、字号（px/rem）、字重、行高、字间距
- **间距**：margin、padding、gap（内外边距与网格间距）
- **组件**：按钮（normal/hover/active）、输入框、卡片、导航等常见组件样式
- **阴影**：box-shadow 值（偏移、模糊、颜色）
- **圆角**：border-radius 值
- **渐变**：background-gradient 值

#### 设计截图模式
进行多模态视觉分析，识别：
- **配色方案**：主色调、辅助色、中性色、强调色（提取十六进制值）
- **字体风格**：衬线/无衬线、现代/古典、字体层级关系
- **布局逻辑**：栅格系统、对齐方式、间距韵律
- **标志性元素**：图标风格、图片处理方式、装饰元素
- **设计流派**：极简主义、毛玻璃效果、新拟态、扁平设计等

### 3. 设计推理与匹配

将感知层提取的原始数据与设计风格库进行匹配：

1. **风格识别**：根据视觉特征匹配最接近的设计流派
2. **行业推理**：应用行业特定规则进行优化
   - 金融/企业 → 专业深蓝配色、保守排版
   - 电商/零售 → 温暖活泼配色、大号 CTA 按钮
   - 科技/SaaS → 现代简洁配色、大留白空间
   - 内容/媒体 → 可读性优先、清晰排版层级
   - 游戏/娱乐 → 鲜明高饱和配色、动态视觉元素
3. **一致性校验**：确保颜色搭配、字体组合、间距比例在视觉上协调

### 4. 构建设计 Token 体系

将推理后的设计元素转化为三层 Token 结构：

#### Global Token（全局 Token）
原始设计值，不附带语义：
```css
--color-blue-500: #3B82F6;
--font-size-xl: 1.25rem;
--spacing-4: 1rem;
```

#### Alias Token（语义 Token）
映射到设计意图：
```css
--color-primary: var(--color-blue-500);
--font-size-heading: var(--font-size-xl);
--spacing-section: var(--spacing-4);
```

#### Component Token（组件 Token）
绑定到具体组件：
```css
--btn-primary-bg: var(--color-primary);
--btn-primary-text: #FFFFFF;
--card-padding: var(--spacing-4);
```

### 5. 生成并输出 DESIGN.md

按标准模板生成完整的结构化文档（详见 DESIGN-TEMPLATE.md）。

## 设计 Token 命名规范

| 类别 | 命名模式 | 示例 |
|------|---------|------|
| 颜色 | `--color-{name}-{weight}` | `--color-primary-500` |
| 字体尺寸 | `--font-size-{level}` | `--font-size-h1`, `--font-size-body` |
| 字体家族 | `--font-family-{type}` | `--font-family-sans`, `--font-family-mono` |
| 字重 | `--font-weight-{name}` | `--font-weight-bold`, `--font-weight-regular` |
| 间距 | `--spacing-{size}` | `--spacing-xs`, `--spacing-lg` |
| 阴影 | `--shadow-{level}` | `--shadow-sm`, `--shadow-lg` |
| 圆角 | `--radius-{size}` | `--radius-sm`, `--radius-full` |
| 断点 | `--breakpoint-{device}` | `--breakpoint-md`, `--breakpoint-lg` |

## 输出格式要求

- 输出文件名为 `DESIGN.md`，放在项目根目录
- 使用标准 Markdown 语法，确保 AI 可正常解析
- 颜色使用十六进制格式（如 `#3B82F6`）
- 字体使用具体家族名称和尺寸（px/rem）
- 间距使用具体单位数值（px/rem）
- 每个设计 Token 均附带精确数值

## 常见错误

### 1. 模糊推断颜色
❌ "使用深蓝色作为主色"
✅ `--color-primary: #1E3A5F`

### 2. 自创命名规范
❌ `--mySpecialColor`
✅ `--color-accent-500`

### 3. 忽略状态样式
只提取 normal 状态，遗漏 hover/active/disabled
必须确保每个可交互组件都有完整状态样式

### 4. 风格混杂
不从输入素材出发，混入其他设计风格的元素
必须严格基于输入素材进行分析

## 约束铁律

1. **精准度**：提取设计元素时必须保证 100% 精准度，不得模糊推断或杜撰不存在的样式属性
2. **颜色格式**：色彩系统必须附带精确的十六进制颜色代码（如 `#FF6B35`），严禁使用近似值或色名替代
3. **命名规范**：设计 Token 命名必须遵循行业通用规范，不得随意自创
4. **格式合规**：输出的 DESIGN.md 必须符合 Markdown 标准语法
5. **忠于输入**：必须严格基于输入素材分析，不得泄露或混淆不同来源的设计风格
