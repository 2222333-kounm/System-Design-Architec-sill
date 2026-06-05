# 编辑器测试与稳定性方案

> **日期：** 2026-06-06
> **范围：** Vitest 单元测试（A）+ Playwright E2E（C）

---

## 1. 工具选型

| 层 | 工具 | 原因 |
|----|------|------|
| 单元测试 | Vitest | 与 Vite 同生态，零配置集成，运行快 |
| 组件测试 | @testing-library/react | 测试用户行为而非实现细节 |
| E2E | @playwright/test | 跨浏览器，支持移动端模拟，录制回放 |

## 2. 目录结构

```
editor-v2/
├── vitest.config.js
├── playwright.config.js
├── test/
│   ├── store.test.js          — Store 基础操作、componentStore CRUD
│   └── dataflow.test.js       — 循环检测算法、端口类型匹配规则
│   └── export.test.js         — 导出代码生成逻辑（数据层）
├── e2e/
│   ├── editor.spec.js         — 编辑器基本操作（添加/连线/调参/保存）
│   ├── flow.spec.js           — 循环检测 + 端口不匹配
│   └── ai-scanner.spec.js     — AI 扫描流程（mock 或本地文件）
└── package.json
```

## 3. 单元测试设计 (A)

### 3.1 store.test.js — 4 个测试

| 测试 | 内容 |
|------|------|
| `set/get 基础操作` | Store.set('key', val) → Store.get('key') === val |
| `subscribe 监听` | set 后回调触发，unsubscribe 后不再触发 |
| `componentStore.save/remove` | 保存组件定义 → 列表包含 → 删除后消失 |
| `componentStore.createFromSelected` | 从选中节点创建，自动识别插槽 |

### 3.2 dataflow.test.js — 4 个测试

| 测试 | 内容 |
|------|------|
| `循环检测 BFS` | 构造有环图 → wouldCreateCycle 返回 true |
| `无环图通过` | 构造 DAG → wouldCreateCycle 返回 false |
| `端口类型兼容` | color 可连 css，color 不可连 image |
| `OUTPUT_TYPE_MAP 完整` | 所有 18 种节点类型都有对应输出类型 |

### 3.3 export.test.js — 3 个测试

| 测试 | 内容 |
|------|------|
| `HTML 代码生成` | 色块+文字节点 → 生成完整 HTML 含 CSS |
| `React JSX 生成` | 按钮节点 → 生成 JSX 含 camelCase 样式 |
| `Vue SFC 生成` | 输出模板含 scoped style |

**不包含节点渲染快照测试，改用手动验证。**

## 4. E2E 测试设计 (C)

### 4.1 环境准备

- Playwright 自动启动 `vite preview --port 5181`
- 测试文件放在 `editor-v2/e2e/` 目录
- AI 扫描场景使用本地 HTML 文件而非网络 URL

### 4.2 editor.spec.js — 5 个场景

| 场景 | 步骤 | 断言 |
|------|------|------|
| 添加节点 | 拖放色块到画布 | 画布上出现色块节点 |
| 节点连线 | 色块→输出连线 | 右侧预览面板出现色块 |
| 调参联动 | 改色块颜色值 | 预览面板颜色同步变化 + 节点内预览更新 |
| 保存/加载 | Ctrl+S 下载，Ctrl+O 加载 | 恢复后节点数量一致 |
| 撤销/重做 | 添加节点→Ctrl+Z→Ctrl+Shift+Z | 节点先消失后恢复 |

### 4.3 flow.spec.js — 2 个场景

| 场景 | 步骤 | 断言 |
|------|------|------|
| 循环检测 | 输出连回色块 | Toast 显示"检测到循环依赖" |
| 端口不匹配 | color→image 连线 | Toast 显示"端口类型不兼容" |

### 4.4 ai-scanner.spec.js — 1 个场景

| 场景 | 步骤 | 断言 |
|------|------|------|
| 扫描并添加 | 拖入本地 HTML 文件 → 扫描完成 → 全部添加 | 画布上新增节点 |
