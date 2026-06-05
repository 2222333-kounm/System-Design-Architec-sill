# 🎨 Sill — Node-Based Design System Editor

> Evolved from an Apple homepage reconstruction into a visual node editor + design system management platform.

---

## Overview

Sill is a **visual node-based design editor** that lets you compose design tokens, components, and layouts through an intuitive drag-and-drop node graph. It started as a reverse engineering exercise of Apple's design system and grew into a full-featured editor with AI scanning, multi-format code export, and design compliance checking.

### Key Features

| Capability | Description |
|------------|-------------|
| 🧩 **20 Node Types** | 4 groups: Base, Layout, Effects, Utilities |
| 🔗 **Visual Dataflow** | Port type matching + cycle detection + real-time preview |
| 📐 **CSS Cascade** | Child nodes inherit styles from parent layout containers |
| 🌐 **Token Editor** | Visual CSS variable editor, real-time sync across all nodes |
| 🤖 **AI Scanner** | Input URL or HTML file → auto-generate node graph |
| 📤 **Multi-Format Export** | HTML/CSS, React JSX, Vue SFC, Tailwind, Styled Components |
| 📱 **Responsive Code** | Auto-generate `@media` queries from breakpoint nodes |
| ✅ **Design Check** | Detect color/typography mismatches against global tokens, one-click fix |
| ♻ **Component Instances** | Save node groups as reusable components with slot mapping |

---

## 🚀 Quick Start

```bash
# Start the editor (dev mode)
cd site/editor-v2
npm install
npm run dev

# Open browser → http://localhost:5180
```


### Basic Usage

| Step | Action |
|------|--------|
| **Add nodes** | Drag from bottom toolbar or right-click canvas |
| **Connect** | Drag from output port to input port |
| **Configure** | Click a node, adjust parameters inline |
| **Preview** | Connect any node to the "Output" node → right panel updates |
| **Shortcuts** | Press `?` to see all keyboard shortcuts |


### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl+S` | Save as JSON file |
| `Ctrl+O` | Load from JSON file |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+C` / `Ctrl+V` | Copy / Paste nodes |
| `Ctrl+E` | Collapse / Expand selected node |
| `R` | Reset view (fitView) |
| `Delete` | Delete selected |
| `?` | Toggle shortcuts panel |

---

## 🧩 Node Catalog (20 Types)

| Group | Nodes |
|-------|-------|
| **Base** | 🎨 Color Block · 📝 Text · 🖼️ Image · 🎬 Video · 🔘 Button · 🔣 Icon |
| **Layout & Structure** | 📐 Layout Container · ↔ Spacing · ♻ Component Instance · 📱 Breakpoint |
| **Transform & Effects** | 🔄 Transform · 🎭 Mask · 📦 Border · 💡 Shadow · 🖱️ Mouse Follow · ✨ Transition |
| **Tools & Global** | 🔄 Convert · 🗂️ Merge · 🌐 Global Token · 📤 Output |

---

## 🏗️ Project Structure

```
site/
├── editor.html                          ← Redirect to V2
├── css/tokens.css                       ← 77 Design Tokens
│
├── editor-v2/                           ← Main editor (React Flow)
│   ├── App.jsx                          ← Application shell (~1300 lines)
│   ├── main.jsx                         ← Entry point
│   │
│   ├── nodes/                           ← 20 node components
│   │   ├── ColorBlockNode.jsx
│   │   ├── TextNode.jsx
│   │   ├── LayoutContainerNode.jsx
│   │   └── ...
│   │
│   ├── components/                      ← Feature panels
│   │   ├── PreviewPanel.jsx             — Right-side preview
│   │   ├── AIScanner.jsx               — AI scan modal
│   │   ├── ExportPanel.jsx             — Code export (5 formats)
│   │   ├── TokenEditor.jsx             — Visual token editor
│   │   └── DesignCheck.jsx             — Design compliance checker
│   │
│   ├── store/index.js                   ← Global state (pub/sub)
│   ├── utils/
│   │   ├── cascade.js                   — CSS inheritance logic
│   │   └── tailwind-map.js             — CSS→Tailwind class mapping
│   ├── lib/token-reader.js              — Token CSS reader
│   │
│   ├── test/                            ← 63 unit tests
│   ├── e2e/                             ← 12 E2E scenarios
│   ├── package.json
│   └── vite.config.js
│
├── docs/superpowers/
│   ├── specs/                           ← Design documents
│   └── plans/                           ← Implementation plans
│
└── skills/design-system-architect/      ← Claude Code Skill
```

---

## 🧪 Testing

```bash
# Unit tests (63)
cd site/editor-v2 && npx vitest run

# E2E tests (12 scenarios)
npx playwright test --headed

# Total: 75 verification points ✅
```

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| `store.test.js` | 8 | Store operations, componentStore CRUD |
| `dataflow.test.js` | 12 | Cycle detection, port type matching |
| `export.test.js` | 5 | HTML/React/Vue code generation |
| `nodes.test.js` | 16 | Node output format, topo sort, token sync |
| `performance.test.js` | 4 | 1000-edge sort, 500-node cycle, 10000 port checks |
| `recursion.test.js` | 4 | Direct/indirect/self component reference cycles |
| `tailwind.test.js` | 10 | CSS→Tailwind class mapping |
| `cascade.test.js` | 4 | Multi-level CSS inheritance |
| **E2E** | **12** | Editor, dataflow, AI scanner scenarios |

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **@xyflow/react** | Node graph engine (React Flow v12) |
| **Vite** | Build tool |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **LiteGraph.js** | V1 prototype (archived) |

---

## 🗺️ Architecture Evolution

```
Phase 1 (V1)    LiteGraph.js + Vanilla JS    → Rapid prototype
Phase 2 (V2)    React Flow + React 18        → Maintainability + extensibility
Final           V2 fully replaces V1         → Current
```

### Data Flow Contract

Every node outputs a unified `{ type, css, extra }` format:

```js
{
  type: 'color',              // Data type identifier
  css: {                      // Layout properties only
    background: '#0071E3',
    width: '320px',
    borderRadius: '12px'
  },
  extra: {                    // Node-specific data
    // custom properties
  }
}
```

- **`css`** — Layout-only properties (consumed by preview panel)
- **`extra`** — Non-layout data (playback behavior, overrides, metadata)

---

## 📄 License

MIT © 2222333-kounm

---

<br>

# 🎨 Sill — 节点式设计系统编辑器

> 从 Apple 官网重构起步，进化为可视化节点编辑器 + 设计系统管理平台

---

## 概述

Sill 是一个**基于节点的可视化设计编辑器**，支持拖拽式节点编排、设计 Token 管理、AI 扫描网页生成节点、多格式代码导出。项目从逆向工程 Apple 官网设计系统起步，逐步演变为完整的节点编辑器。

### 核心能力

| 能力 | 说明 |
|------|------|
| 🧩 **20 个节点** | 4 组：基础组件 / 布局结构 / 变换特效 / 工具全局 |
| 🔗 **可视化数据流** | 端口类型匹配 + 循环依赖检测 + 实时预览 |
| 📐 **CSS 级联** | 子节点自动继承父布局容器的样式属性 |
| 🌐 **全局 Token** | 可视化编辑 CSS 变量，实时同步所有节点 |
| 🤖 **AI 扫描** | 输入 URL 或拖入 HTML 文件，自动生成节点 |
| 📤 **多格式导出** | HTML/CSS、React JSX、Vue SFC、Tailwind、Styled Components |
| 📱 **响应式代码** | 识别断点节点，自动生成 `@media` 查询代码 |
| ✅ **设计规范检查** | 检测节点颜色/字号是否与 Token 一致，一键修复 |
| ♻ **组件实例** | 选中节点 → 保存为组件 → 多实例引用同步 |

---

## 🚀 快速上手

```bash
# 启动编辑器（开发模式）
cd site/editor-v2
npm install
npm run dev

# 打开浏览器 → http://localhost:5180
```

### 基础操作

| 步骤 | 操作 |
|------|------|
| **添加节点** | 从底部拖拽节点到画布，或右键画布选择 |
| **连线** | 从节点输出端口拖到输入端口 |
| **调参** | 点击节点，参数直接在节点上调节 |
| **预览** | 连接任意节点到「输出」节点，右侧实时预览 |
| **快捷键** | 按 `?` 键查看全部快捷键 |

### 全部快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存为 JSON 文件 |
| `Ctrl+O` | 加载 JSON 文件 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` / `Ctrl+Y` | 重做 |
| `Ctrl+C` / `Ctrl+V` | 复制/粘贴节点 |
| `Ctrl+E` | 折叠/展开选中节点 |
| `R` | 重置视图（fitView） |
| `Delete` | 删除选中 |
| `?` | 快捷键面板 |

---

## 🧩 节点清单（20 个）

| 分组 | 节点 |
|------|------|
| **基础组件** | 🎨 色块 · 📝 文字 · 🖼️ 图片 · 🎬 视频 · 🔘 按钮 · 🔣 图标 |
| **布局 & 结构** | 📐 布局容器 · ↔ 间距 · ♻ 组件实例 · 📱 断点 |
| **变换 & 特效** | 🔄 变换 · 🎭 蒙版 · 📦 边框 · 💡 阴影 · 🖱️ 鼠标跟随 · ✨ 转场 |
| **工具 & 全局** | 🔄 转换 · 🗂️ 合并 · 🌐 全局 Token · 📤 输出 |

---

## 🧪 测试

```bash
# 单元测试（63 个）
cd site/editor-v2 && npx vitest run

# E2E 测试（12 个场景）
npx playwright test --headed

# 总计：75 个验证点 ✅
```

| 测试套件 | 数量 | 覆盖内容 |
|----------|------|----------|
| `store.test.js` | 8 | Store 操作、componentStore 增删改查 |
| `dataflow.test.js` | 12 | 循环检测、端口类型匹配 |
| `export.test.js` | 5 | HTML/React/Vue 代码生成 |
| `nodes.test.js` | 16 | 节点输出格式、拓扑排序、Token 同步 |
| `performance.test.js` | 4 | 1000 边排序、500 节点检测、10000 次匹配 |
| `recursion.test.js` | 4 | 直接/间接/自引用组件环检测 |
| `tailwind.test.js` | 10 | CSS→Tailwind 类名映射 |
| `cascade.test.js` | 4 | 多级 CSS 继承 |
| **E2E 场景** | **12** | 编辑器、数据流、AI 扫描全流程 |

---

## 🔧 技术栈

| 技术 | 用途 |
|------|------|
| **React 18** | UI 框架 |
| **@xyflow/react** | 节点引擎（React Flow v12） |
| **Vite** | 构建工具 |
| **Vitest** | 单元测试 |
| **Playwright** | E2E 测试 |
| **LiteGraph.js** | V1 原型（已归档） |

---

## 📜 技术选型演进

```
阶段 1 (V1)    LiteGraph.js + 原生 JS    → 快速原型验证
阶段 2 (V2)    React Flow + React 18     → 可维护性 + 扩展性
最终架构        V2 完全替代 V1            → 当前版本
```

### 统一数据格式

所有节点使用 `{ type, css, extra }` 格式输出：

```js
{
  type: 'color',              // 数据类型标识
  css: {                      // 仅含布局属性
    background: '#0071E3',
    width: '320px',
    borderRadius: '12px'
  },
  extra: {                    // 非布局特有数据
    // 节点特有属性
  }
}
```

- **`css`** — 布局属性，供预览面板渲染
- **`extra`** — 非布局数据（播放行为、覆盖参数等）

---

## 📄 许可证

MIT © 2222333-kounm
