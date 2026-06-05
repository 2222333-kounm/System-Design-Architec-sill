# 无限画布恢复 & Token 修复 — 设计文档

> **日期：** 2026-06-05
> **范围：** 将回退后缺失的 7 个文件重新生成 + 修复 tokens.css 无效值

---

## 1. 修复范围

### 1.1 缺失文件（重新生成）

| 文件 | 用途 |
|------|------|
| `site/css/canvas-demo.css` | 画布布局、网格背景、控制栏、预览区、编辑模式样式 |
| `site/js/canvas-engine.js` | 画布平移/缩放/惯性/重置，拖拽与滚轮交互 |
| `site/js/canvas-content.js` | 读取 TokenStore，动态渲染色板/排版/间距/组件到画布 |
| `site/js/color-utils.js` | 颜色工具：hex→rgb、亮度检测、对比度计算 |
| `site/js/color-wheel.js` | 颜色选择轮盘 UI（编辑模式 `?mode=edit` 用） |
| `site/js/property-panel.js` | 属性面板 UI（选中元素改色/改图/改样式） |
| `site/js/canvas-components.js` | 组件拖拽系统：18 个组件可拖入画布 |

### 1.2 Token 修复

| 字段 | 原值 | 改为 |
|------|------|------|
| `--spacing-lg` | `39-44px` | `44px` |
| `--spacing-xl` | `53-61px` | `61px` |
| `--spacing-2xl` | `80-110px` | `110px` |
| `--breakpoint-xl` | `--` | `1440px` |
| `--nav-height` | 缺失（引用但未定义） | `44px` |
| `--nav-height-mobile` | 缺失（引用但未定义） | `48px` |

---

## 2. 架构

### 2.1 文件依赖顺序（按加载顺序）

```
infinite-canvas-demo.html
├── css/tokens.css            ← 修复后
├── css/canvas-demo.css       ← 新增
├── css/node-editor.css       ← 已有
├── js/node-token.js          ← 已有（TokenStore）
├── js/node-token-ref.js      ← 已有（@token 解析）
├── js/canvas-engine.js       ← 画布核心
│   └── 依赖: 无（独立）
├── js/canvas-content.js      ← Token 渲染
│   └── 依赖: TokenStore, canvas-engine（获取 stage 容器）
├── js/color-utils.js         ← 颜色工具
│   └── 依赖: 无（纯函数）
├── js/color-wheel.js         ← 颜色轮盘
│   └── 依赖: color-utils
├── js/property-panel.js      ← 属性面板
│   └── 依赖: color-wheel, color-utils
└── js/canvas-components.js   ← 组件拖拽
    └── 依赖: canvas-engine（获取 stage 坐标）
```

### 2.2 页面两种模式

- **浏览模式**（默认 URL）：浏览 Design Token、排版、间距、组件预览
- **编辑模式**（`?mode=edit`）：在浏览基础上增加点击改色、图片替换、属性面板

---

## 3. 各文件核心功能

### 3.1 canvas-engine.js
- 鼠标拖拽平移画布（Space+拖拽）
- 滚轮缩放（Ctrl+滚轮加速）
- 缩放比例显示
- 重置视图
- 网格背景绘制

### 3.2 canvas-content.js
- 从 TokenStore 读取 `--color-primary-*`、`--color-neutral-*`、语义色
- 渲染品牌色板、中性色板、辅助色板、语义色板
- 渲染排版系统（7 级字号展示）
- 渲染间距系统（可视化条）
- 渲染组件预览（按钮、导航）

### 3.3 color-utils.js
- `hexToRgb(hex)` → `{r,g,b}`
- `rgbToHex(r,g,b)` → `#RRGGBB`
- `getLuminance(hex)` → 相对亮度
- `getContrastRatio(hex1, hex2)` → 对比度
- `isLight(hex)` → 是否亮色

### 3.4 color-wheel.js
- 可拖拽的颜色选择轮盘
- 点击取色
- 预设色板快速选择

### 3.5 property-panel.js
- 选中元素后显示属性
- 颜色编辑（联动 color-wheel）
- 图片替换（URL 输入）
- 样式属性（字体/字号/透明度等）

### 3.6 canvas-components.js
- 18 个组件面板（从 DESIGN.md 映射）
- 点击添加到画布
- 拖拽移动

---

## 4. 边界情况与错误处理

- **TokenStore 未就绪** → content.js 显示加载中，不崩溃
- **颜色值非法** → color-utils 返回默认黑色，不抛异常
- **color-wheel 无选中** → 显示"请选择一个元素"
- **property-panel 无选中** → 隐藏面板
- **画布容器大小为 0** → engine.js 设最小尺寸 400x400
- **编辑模式未启用** → color-wheel / property-panel / canvas-components 不加载（通过 URL 参数判断）

---

## 5. 不包含（YAGNI）

- 不引入任何 npm 包或构建工具
- 不加 WebSocket 实时同步（那是未来功能）
- 不加撤销/历史记录
- 不加后端服务（server.js 不做）
- 不做文件拆分/合并重构
