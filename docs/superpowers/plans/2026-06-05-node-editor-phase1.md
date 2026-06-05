# 节点编辑器 Phase 1 — 引擎搭建实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建基于 litegraph.js 的节点编辑器引擎（Webflow/Framer 风格分屏布局），注册 7 个核心节点（色块/文字/图片/转换/合并/全局Token/输出），实现浮层集成、@token 引用、Token 锁定/解锁、快捷键和 JSON 保存/加载。

**Architecture:** 分屏布局 — 左侧 litegraph.js Canvas 用于节点编排，右侧实时预览面板展示输出结果。输出节点从画布中移除，改为固定预览面板。7 个节点通过 `LiteGraph.registerNodeType()` 在 `node-engine.js` 中注册。Token 基础设施在 `node-token.js`、`node-token-ref.js`、`node-token-lock.js` 中。通过 iframe 浮层弹窗集成到现有画布页面。

**Tech Stack:** litegraph.js 0.7.x (CDN)、原生 JavaScript、CSS3

**依赖前置条件：** `docs/superpowers/specs/2026-06-04-node-editor-design.md` 中的设计规范。

---

## 文件结构

### 新建文件

| 文件 | 职责 | 行数 |
|------|------|------|
| `site/css/node-editor.css` | 分屏布局（左画布右预览）+ 浮层 + 控件样式 | ~200 |
| `site/js/node-token.js` | Token 读取/缓存/搜索/精选集（get/set/watch/keys） | ~100 |
| `site/js/node-token-ref.js` | `@xxx` 引用解析（resolve/hasRef/extractRefs） | ~50 |
| `site/js/node-token-lock.js` | 🔗 锁定/解锁状态管理 + 🔄 重置为 Token 默认值 | ~80 |
| `site/js/node-engine.js` | LiteGraph 初始化 + 7 个节点注册 + 右键分组 + 错误态 | ~600 |
| `site/node-editor.html` | 分屏页面（左画布 + 右预览面板 + 顶栏） | ~150 |

### 修改文件

| 文件 | 修改点 |
|------|--------|
| `site/infinite-canvas-demo.html` | 控制栏加「🔌 节点编辑」按钮 + 浮层容器 div |
| `site/css/canvas-demo.css` | 浮层按钮样式（3 行） |

---

## Task 1: 编写 node-editor.css — 分屏布局 + 控件样式

**Files:**
- Create: `site/css/node-editor.css`

- [ ] **Step 1.1: 编写分屏布局样式**

```css
/* ========================================
   节点编辑器 — 分屏布局 + 浮层 + 控件样式
   Phase 1: 左画布右预览，Webflow/Framer 风格
   主题适配在最终 Phase 完成
   ======================================== */

/* ---- 页面基础 ---- */
html, body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  background: #1A1C23;
  color: #E2E8F0;
}

/* ---- 浮层覆盖层 ---- */
.node-editor-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: none;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.node-editor-overlay.active {
  display: flex;
}

.node-editor-overlay .node-editor-container {
  width: 95vw;
  height: 92vh;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.node-editor-overlay .node-editor-container iframe {
  width: 100%; height: 100%;
  border: none;
  background: #1A1C23;
}

/* ---- 顶栏 ---- */
.ne-toolbar {
  height: 44px;
  background: #22242B;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  flex-shrink: 0;
}

.ne-toolbar .brand {
  font-size: 13px; font-weight: 600; color: #E2E8F0;
}
.ne-toolbar .brand span { color: #3B82F6; }
.ne-toolbar .spacer { flex: 1; }

.ne-toolbar .toolbar-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #9CA3AF;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}
.ne-toolbar .toolbar-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #E2E8F0;
}
.ne-toolbar .toolbar-btn.danger:hover {
  background: rgba(239,68,68,0.15);
  color: #EF4444;
  border-color: rgba(239,68,68,0.2);
}

.ne-toolbar .ne-status {
  color: #4B5563;
  font-size: 11px;
}

/* ---- 主体：分屏 ---- */
.ne-main {
  display: flex;
  width: 100%; height: calc(100% - 44px);
}

/* 左：画布面板 */
.ne-canvas-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.ne-canvas-panel .litegraph {
  width: 100% !important;
  height: 100% !important;
}

/* 右：预览面板 */
.ne-preview-panel {
  width: 420px;
  min-width: 300px;
  max-width: 600px;
  border-left: 1px solid rgba(255,255,255,0.06);
  background: #181A20;
  display: flex;
  flex-direction: column;
}

.ne-preview-header {
  height: 36px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-size: 11px;
  color: #6B7280;
  gap: 8px;
  flex-shrink: 0;
}

.ne-preview-header .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #22C55E;
}

.ne-preview-header .preview-actions {
  margin-left: auto;
  display: flex; gap: 6px;
}

.ne-preview-header .preview-actions button {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.06);
  color: #6B7280;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.15s;
}
.ne-preview-header .preview-actions button:hover {
  background: rgba(59,130,246,0.15);
  color: #60A5FA;
}

.ne-preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: auto;
  position: relative;
}

.ne-preview-body .empty-state {
  text-align: center;
  color: #4B5563;
  font-size: 13px;
}
.ne-preview-body .empty-state .icon { font-size: 32px; margin-bottom: 8px; }
.ne-preview-body .empty-state .hint { font-size: 11px; color: #374151; margin-top: 4px; }

.ne-preview-body .preview-error {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.2);
  color: #FCA5A5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 100%;
}

/* ---- 浮动控制按钮（叠加在画布上） ---- */
.ne-float-zoom {
  position: absolute;
  bottom: 16px; left: 16px;
  display: flex; gap: 4px;
  z-index: 100;
}

.ne-float-zoom button {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(30,32,38,0.9);
  color: #9CA3AF;
  cursor: pointer;
  font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  backdrop-filter: blur(8px);
}

.ne-float-zoom button:hover {
  background: rgba(255,255,255,0.1);
  color: #E2E8F0;
}

.ne-float-zoom .zoom-label {
  width: 48px; text-align: center;
  background: rgba(30,32,38,0.9);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #6B7280;
  font-size: 11px;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px);
}

/* ---- 打开编辑器的按钮（在原有控制栏中） ---- */
.node-editor-toggle {
  background: rgba(59,130,246,0.15) !important;
  color: #60A5FA !important;
  border: 1px solid rgba(59,130,246,0.2) !important;
  width: auto !important;
  padding: 0 12px !important;
  font-size: 12px !important;
}
.node-editor-toggle:hover {
  background: rgba(59,130,246,0.25) !important;
}

/* ---- 端口悬停提示 ---- */
.litegraph .connection-error {
  animation: port-flash 0.4s ease;
}

@keyframes port-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ---- 节点错误状态 ---- */
.lgraph-node.node-error {
  box-shadow: 0 0 0 2px #EF4444 !important;
}

.lgraph-node.node-error .node-title {
  background: linear-gradient(90deg, #7F1D1D, #991B1B) !important;
}

.lgraph-node .node-error-msg {
  background: rgba(239,68,68,0.1);
  border-top: 1px solid rgba(239,68,68,0.15);
  color: #FCA5A5;
  padding: 4px 8px;
  font-size: 10px;
  line-height: 1.4;
}

/* ---- 输出预览内容区域 ---- */
.ne-preview-body .preview-content {
  width: 100%;
  min-height: 100px;
}
```

- [ ] **Step 1.2: 验证 CSS 文件**

文件写入无误即可。

---

## Task 2: 编写 node-token.js — Token 读取和缓存

**Files:**
- Create: `site/js/node-token.js`

- [ ] **Step 2.1: 编写实现**

```javascript
/* ========================================
   Token 读取工具 — 从 tokens.css 读取 CSS 变量
   提供 get/set/watch/keys/search/getFavorites/refresh
   ======================================== */

;(function() {
  'use strict';

  var TokenStore = window.TokenStore = {};

  var _cache = {};
  var _watchers = {};
  var _initialized = false;

  function refreshCache() {
    var styles = getComputedStyle(document.documentElement);
    _cache = {};
    for (var i = 0; i < styles.length; i++) {
      var name = styles[i];
      if (name.indexOf('--') === 0) {
        _cache[name] = styles.getPropertyValue(name).trim();
      }
    }
    _initialized = true;
  }

  TokenStore.get = function(name) {
    if (!_initialized) refreshCache();
    if (name.indexOf('--') !== 0) name = '--' + name;
    return _cache[name] || '';
  };

  TokenStore.keys = function() {
    if (!_initialized) refreshCache();
    return Object.keys(_cache).filter(function(k) {
      return k.indexOf('--') === 0;
    });
  };

  TokenStore.getFavorites = function() {
    if (!_initialized) refreshCache();
    var result = {
      color: ['--color-primary-500', '--color-primary-700', '--color-primary-900',
              '--color-secondary-500', '--color-accent-500',
              '--color-success-500', '--color-warning-500', '--color-error-500',
              '--color-neutral-50', '--color-neutral-300', '--color-neutral-500',
              '--color-neutral-700', '--color-neutral-900',
              '--color-bg-primary', '--color-text-primary', '--color-text-secondary',
              '--color-border'],
      typography: ['--font-size-hero', '--font-size-h1', '--font-size-h2',
                   '--font-size-body', '--font-size-small', '--font-size-caption',
                   '--font-family-display', '--font-family-sans', '--font-family-mono',
                   '--font-weight-regular', '--font-weight-medium',
                   '--font-weight-semibold', '--font-weight-bold'],
      spacing: ['--spacing-xs', '--spacing-sm', '--spacing-md', '--spacing-lg',
                '--spacing-xl', '--spacing-2xl'],
      radius: ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full']
    };
    var filtered = {};
    Object.keys(result).forEach(function(cat) {
      filtered[cat] = result[cat].filter(function(k) { return _cache[k] !== undefined; });
    });
    return filtered;
  };

  TokenStore.search = function(keyword) {
    if (!_initialized) refreshCache();
    var kw = keyword.toLowerCase();
    var result = [];
    Object.keys(_cache).forEach(function(k) {
      if (k.indexOf(kw) >= 0) {
        result.push({ name: k, value: _cache[k] });
      }
    });
    return result;
  };

  TokenStore.watch = function(name, callback) {
    if (!_watchers[name]) _watchers[name] = [];
    _watchers[name].push(callback);
  };

  TokenStore.set = function(name, value) {
    if (name.indexOf('--') !== 0) name = '--' + name;
    _cache[name] = value;
    var list = _watchers[name];
    if (list) list.forEach(function(cb) { cb(value); });
  };

  TokenStore.refresh = function() {
    refreshCache();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshCache);
  } else {
    refreshCache();
  }
})();
```

- [ ] **Step 2.2: 验证**

文件写入无误即可。

---

## Task 3: 编写 node-token-ref.js — @token 引用解析

**Files:**
- Create: `site/js/node-token-ref.js`

- [ ] **Step 3.1: 编写实现**

```javascript
/* ========================================
   @token 引用解析工具
   "@color-primary-500" → "#3B82F6"
   ======================================== */

;(function() {
  'use strict';

  var TokenRef = window.TokenRef = {};

  TokenRef.resolve = function(str) {
    if (typeof str !== 'string') return str;
    if (str.indexOf('@') < 0) return str;
    var ts = window.TokenStore;
    return str.replace(/@([\w-]+)/g, function(match, tokenName) {
      var val = ts.get(tokenName);
      if (val) return val;
      val = ts.get('--' + tokenName);
      if (val) return val;
      return match;
    });
  };

  TokenRef.hasRef = function(str) {
    return typeof str === 'string' && str.indexOf('@') >= 0;
  };

  TokenRef.extractRefs = function(str) {
    if (typeof str !== 'string') return [];
    var matches = str.match(/@([\w-]+)/g);
    if (!matches) return [];
    return matches.map(function(m) { return m.slice(1); });
  };
})();
```

- [ ] **Step 3.2: 验证**

文件写入无误即可。

---

## Task 4: 编写 node-token-lock.js — Token 锁定/解锁

**Files:**
- Create: `site/js/node-token-lock.js`

- [ ] **Step 4.1: 编写实现**

```javascript
/* ========================================
   Token 锁定/解锁状态管理
   每个节点实例维护自己的锁定状态表
   ======================================== */

;(function() {
  'use strict';

  var TokenLock = window.TokenLock = {};

  // 存储: nodeId -> { fieldName: { tokenName, locked, customValue } }
  var _locks = {};

  /**
   * 初始化一个节点的锁定状态
   * @param {string} nodeId
   * @param {Object} defaults - { fieldName: tokenName }
   */
  TokenLock.init = function(nodeId, defaults) {
    if (!_locks[nodeId]) _locks[nodeId] = {};
    Object.keys(defaults).forEach(function(field) {
      if (!_locks[nodeId][field]) {
        _locks[nodeId][field] = {
          tokenName: defaults[field],
          locked: true,
          customValue: null
        };
      }
    });
  };

  /**
   * 获取某个字段的值（如果是锁定状态则返回 Token 值，否则返回自定义值）
   * @param {string} nodeId
   * @param {string} field
   * @returns {string|null}
   */
  TokenLock.getValue = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    if (!state) return null;
    if (state.locked) {
      return window.TokenStore.get(state.tokenName) || null;
    }
    return state.customValue;
  };

  /**
   * 用户手动修改值 → 自动解锁
   * @param {string} nodeId
   * @param {string} field
   * @param {string} value
   */
  TokenLock.setCustom = function(nodeId, field, value) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    if (!state) return;
    if (state.locked) {
      state.locked = false;
      console.log('[TokenLock] ' + field + ' 已断开与 Token 的同步');
    }
    state.customValue = value;
  };

  /**
   * 重置为 Token 默认值 → 重新锁定
   * @param {string} nodeId
   * @param {string} field
   * @returns {string} 当前 Token 值
   */
  TokenLock.resetToToken = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    if (!state) return '';
    state.locked = true;
    state.customValue = null;
    return window.TokenStore.get(state.tokenName) || '';
  };

  /**
   * 检查某个字段是否锁定
   */
  TokenLock.isLocked = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    return state ? state.locked : false;
  };

  /**
   * 获取某个字段绑定的 Token 名
   */
  TokenLock.getTokenName = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    return state ? state.tokenName : null;
  };

  /**
   * 清理（节点删除时调用）
   */
  TokenLock.removeNode = function(nodeId) {
    delete _locks[nodeId];
  };

})();
```

- [ ] **Step 4.2: 验证**

文件写入无误即可。

---

## Task 5: 编写 node-engine.js — 引擎 + 7 个节点注册

**Files:**
- Create: `site/js/node-engine.js`

这是 Phase 1 最核心的文件。包含：
- LiteGraph 初始化
- 7 个节点注册（色块/文字/图片/转换/合并/全局Token/输出）
- 右键菜单分组
- 分屏预览联动
- 端口悬停 tooltip
- 类型不匹配闪烁
- 快捷键
- 保存/加载 JSON

- [ ] **Step 5.1: 引擎初始化**

```javascript
/* ========================================
   节点编辑器 — 引擎 + 7 个节点注册
   Phase 1: 色块/文字/图片/转换/合并/全局Token/输出
   ======================================== */

;(function() {
  'use strict';

  var NodeEditor = window.NodeEditor = {};

  var PORT_TYPES = {
    COLOR: 'color',
    IMAGE: 'image',
    TEXT: 'text',
    CSS: 'css',
    NUMBER: 'number',
    ANY: 'any',
    INTERACTIVE: 'interactive'
  };

  /**
   * @param {HTMLElement} canvasContainer - 画布容器
   * @param {Object} opts
   * @param {function} [opts.onOutputChange] - 输出数据变化回调（更新预览面板）
   * @returns {{ graph: LGraph, canvas: LGraphCanvas }}
   */
  NodeEditor.init = function(canvasContainer, opts) {
    opts = opts || {};

    if (window.TokenStore) window.TokenStore.refresh();

    var graph = new LGraph();
    var canvas = new LGraphCanvas(canvasContainer, graph);
    canvas.background_image = '';
    canvas.node_title_color = '#FAFAFA';
    canvas.allow_searchbox = false;

    // 双击空白 → 搜索
    canvas.onSearchBox = function(e) {
      canvas.showSearchBox(e);
    };

    // 监听输出变化 → 通知预览面板
    graph.onAfterChange = function() {
      NodeEditor._updatePreview(graph, opts.onOutputChange);
    };

    graph.start();

    return { graph: graph, canvas: canvas };
  };

  /**
   * 遍历图找到输出节点，获取其输出数据
   */
  NodeEditor._updatePreview = function(graph, callback) {
    var outputNode = null;
    if (!graph || !graph._nodes) return;
    for (var i = 0; i < graph._nodes.length; i++) {
      if (graph._nodes[i].type === 'sill/output') {
        outputNode = graph._nodes[i];
        break;
      }
    }
    if (outputNode) {
      // 手动触发执行
      outputNode.onExecute();
      if (callback && outputNode._lastOutput) {
        callback(outputNode._lastOutput);
      } else if (callback) {
        callback(null);
      }
    } else {
      if (callback) callback(null);
    }
  };

  /**
   * 获取当前图的 JSON 快照
   */
  NodeEditor.serialize = function(graph) {
    return JSON.stringify(graph.serialize(), null, 2);
  };

  /**
   * 从 JSON 加载图
   */
  NodeEditor.deserialize = function(graph, jsonStr, callback) {
    try {
      var data = JSON.parse(jsonStr);
      graph.configure(data);
      if (callback) callback(null);
    } catch(e) {
      if (callback) callback(e);
    }
  };

  // 后续：节点类型注册
```

- [ ] **Step 5.2: 注册色块节点 (sill/color-block)**

```javascript
  // =====================
  //  ① 色块节点
  // =====================

  function ColorBlockNode() {
    this.addInput('input', PORT_TYPES.COLOR);
    this.addOutput('color-block', PORT_TYPES.COLOR);
    this.properties = { color: '#3B82F6', width: 320, height: 120, borderRadius: 12, opacity: 100 };

    var ts = window.TokenStore;
    if (ts) {
      var primary = ts.get('--color-primary-500');
      if (primary) this.properties.color = primary;
    }

    var that = this;
    this.addWidget('color', '色值', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    this.addWidget('number', '宽度', this.properties.width, function(v) {
      that.properties.width = v; that._markDirty();
    }, { min: 40, max: 800, step: 1 });

    this.addWidget('number', '高度', this.properties.height, function(v) {
      that.properties.height = v; that._markDirty();
    }, { min: 20, max: 600, step: 1 });

    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v; that._markDirty();
    }, { min: 0, max: 9999, step: 1 });

    this.addWidget('slider', '不透明度', this.properties.opacity, function(v) {
      that.properties.opacity = v; that._markDirty();
    }, { min: 0, max: 100 });

    this.previewY = 180;
    this.size = [320, 260];
  }

  ColorBlockNode.title = '色块';
  ColorBlockNode.desc = '纯色色块 · 色值/宽高/圆角/不透明度';

  ColorBlockNode.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    this.graph?.onAfterChange?.(this.graph);
  };

  ColorBlockNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (input && input.color) this.properties.color = input.color;
    this._lastOutput = {
      type: 'color',
      color: this.properties.color,
      css: {
        background: this.properties.color,
        width: this.properties.width + 'px',
        height: this.properties.height + 'px',
        'border-radius': this.properties.borderRadius + 'px',
        opacity: this.properties.opacity / 100
      }
    };
    this.setOutputData(0, this._lastOutput);
  };

  ColorBlockNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;
    var x = 10, y = this.previewY, w = this.size[0] - 20, h = 50;
    ctx.globalAlpha = this.properties.opacity / 100;
    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(8, w / 2, h / 2));
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.properties.color + ' · ' + this.properties.width + '×' + this.properties.height, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  LiteGraph.registerNodeType('sill/color-block', ColorBlockNode);
```

- [ ] **Step 5.3: 注册文字节点 (sill/text)**

```javascript
  // =====================
  //  ② 文字节点
  // =====================

  function TextNode() {
    this.addInput('input', PORT_TYPES.ANY);
    this.addOutput('text', PORT_TYPES.TEXT);
    this.properties = {
      content: '这是一段示例文字',
      fontFamily: 'PingFang SC, sans-serif',
      fontSize: 16, fontWeight: 400, lineHeight: 1.5,
      letterSpacing: 0, color: '#1D1D1F', textAlign: 'left'
    };

    var ts = window.TokenStore;
    if (ts) {
      var bodySz = ts.get('--font-size-body');
      if (bodySz) this.properties.fontSize = parseFloat(bodySz) || 16;
      var txCol = ts.get('--color-text-primary');
      if (txCol) this.properties.color = txCol;
    }

    var that = this;
    this.addWidget('text', '内容', this.properties.content, function(v) { that.properties.content = v; that._markDirty(); });
    this.addWidget('combo', '字体', this.properties.fontFamily, function(v) { that.properties.fontFamily = v; that._markDirty(); },
      { values: ['PingFang SC, sans-serif', 'SF Pro Display, sans-serif', 'Inter, sans-serif', 'Georgia, serif', 'monospace'] });
    this.addWidget('number', '字号', this.properties.fontSize, function(v) { that.properties.fontSize = v; that._markDirty(); }, { min: 8, max: 120, step: 1 });
    this.addWidget('number', '字重', this.properties.fontWeight, function(v) { that.properties.fontWeight = v; that._markDirty(); }, { min: 100, max: 900, step: 100 });
    this.addWidget('number', '行高', this.properties.lineHeight, function(v) { that.properties.lineHeight = v; that._markDirty(); }, { min: 0.5, max: 3, step: 0.1 });
    this.addWidget('number', '字距', this.properties.letterSpacing, function(v) { that.properties.letterSpacing = v; that._markDirty(); }, { min: -5, max: 20, step: 0.5 });
    this.addWidget('color', '颜色', this.properties.color, function(v) { that.properties.color = v; that._markDirty(); });
    this.addWidget('combo', '对齐', this.properties.textAlign, function(v) { that.properties.textAlign = v; that._markDirty(); }, { values: ['left', 'center', 'right'] });

    this.size = [320, 340];
  }

  TextNode.title = '文字'; TextNode.desc = '多行文本 · 字体/字号/字重/行高/字距/对齐';

  TextNode.prototype._markDirty = function() { this.setDirtyCanvas(true, true); this.graph?.onAfterChange?.(this.graph); };

  TextNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (input && typeof input === 'string') this.properties.content = input;
    var resolvedColor = this.properties.color;
    if (window.TokenRef && typeof resolvedColor === 'string') resolvedColor = window.TokenRef.resolve(resolvedColor);
    this._lastOutput = {
      type: 'text',
      content: this.properties.content,
      css: {
        'font-family': this.properties.fontFamily,
        'font-size': this.properties.fontSize + 'px',
        'font-weight': this.properties.fontWeight,
        'line-height': this.properties.lineHeight,
        'letter-spacing': this.properties.letterSpacing + 'em',
        'color': resolvedColor,
        'text-align': this.properties.textAlign
      }
    };
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/text', TextNode);
```

- [ ] **Step 5.4: 注册图片节点 (sill/image)**

```javascript
  // =====================
  //  ③ 图片节点
  // =====================

  function ImageNode() {
    this.addInput('input', PORT_TYPES.ANY);
    this.addOutput('image', PORT_TYPES.IMAGE);
    this.properties = {
      url: '',
      objectFit: 'cover',
      repeat: 'no-repeat'
    };
    this._fileName = '';

    var that = this;
    this.addWidget('text', '图片 URL', this.properties.url, function(v) {
      that.properties.url = v; that._markDirty();
    });
    this.addWidget('combo', '适配', this.properties.objectFit, function(v) {
      that.properties.objectFit = v; that._markDirty();
    }, { values: ['cover', 'contain', 'fill', 'none', 'scale-down'] });
    this.addWidget('combo', '重复', this.properties.repeat, function(v) {
      that.properties.repeat = v; that._markDirty();
    }, { values: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'] });

    this.size = [320, 200];
  }

  ImageNode.title = '图片'; ImageNode.desc = '上传/引用图片 · 适配/重复';

  ImageNode.prototype._markDirty = function() { this.setDirtyCanvas(true, true); this.graph?.onAfterChange?.(this.graph); };

  ImageNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (input && input.url) this.properties.url = input.url;
    var url = this.properties.url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22120%22%3E%3Crect width=%22320%22 height=%22120%22 fill=%22%23374151%22/%3E%3Ctext x=%22160%22 y=%2265%22 text-anchor=%22middle%22 fill=%22%236B7280%22 font-size=%2214%22%3E图片占位%3C/text%3E%3C/svg%3E';
    this._lastOutput = {
      type: 'image',
      url: url,
      css: {
        'background-image': 'url(' + url + ')',
        'object-fit': this.properties.objectFit,
        'background-repeat': this.properties.repeat,
        width: '100%', height: '200px'
      }
    };
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/image', ImageNode);
```

- [ ] **Step 5.5: 注册转换节点 (sill/convert)**

```javascript
  // =====================
  //  ④ 转换节点（6 种模式）
  // =====================

  function ConvertNode() {
    this.addInput('input', PORT_TYPES.ANY);
    this.addOutput('output', PORT_TYPES.ANY);
    this.properties = { mode: 'text → css' };

    var that = this;
    this.addWidget('combo', '转换模式', this.properties.mode, function(v) {
      that.properties.mode = v; that._markDirty();
    }, { values: ['text → css', 'color → css', 'image → css', 'css → text', 'object → json', 'json → object'] });

    this.size = [260, 100];
  }

  ConvertNode.title = '转换'; ConvertNode.desc = '类型转换 · 6 种模式';

  ConvertNode.prototype._markDirty = function() { this.setDirtyCanvas(true, true); this.graph?.onAfterChange?.(this.graph); };

  ConvertNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (!input) { this._lastOutput = null; this.setOutputData(0, null); return; }

    var mode = this.properties.mode;
    var conversions = {
      'text → css': function(d) { return (d && d.css) || d; },
      'color → css': function(d) { return (d && d.css) || d; },
      'image → css': function(d) { return (d && d.css) || d; },
      'css → text': function(d) { if (d && d.content) return d.content; if (d && typeof d === 'object') return JSON.stringify(d, null, 2); return String(d); },
      'object → json': function(d) { try { return JSON.stringify(d, null, 2); } catch(e) { return String(d); } },
      'json → object': function(d) { if (typeof d === 'string') { try { return JSON.parse(d); } catch(e) { return d; } } return d; }
    };

    this._lastOutput = (conversions[mode] || function(d) { return d; })(input);
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/convert', ConvertNode);
```

- [ ] **Step 5.6: 注册合并节点 (sill/merge)**

```javascript
  // =====================
  //  ⑤ 合并节点（多输入）
  // =====================

  function MergeNode() {
    this.addInput('A', PORT_TYPES.CSS);
    this.addInput('B', PORT_TYPES.CSS);
    this.addInput('C', PORT_TYPES.CSS);
    this.addOutput('merged', PORT_TYPES.CSS);
    this.properties = { mode: '叠加' };

    var that = this;
    this.addWidget('combo', '模式', this.properties.mode, function(v) {
      that.properties.mode = v; that._markDirty();
    }, { values: ['叠加', '堆叠', '覆盖'] });

    this.size = [280, 140];
  }

  MergeNode.title = '合并'; MergeNode.desc = '多路数据合并 · 叠加/堆叠/覆盖';

  MergeNode.prototype._markDirty = function() { this.setDirtyCanvas(true, true); this.graph?.onAfterChange?.(this.graph); };

  MergeNode.prototype.onExecute = function() {
    var inputs = [this.getInputData(0), this.getInputData(1), this.getInputData(2)].filter(Boolean);
    if (inputs.length === 0) { this._lastOutput = null; this.setOutputData(0, null); return; }

    var mode = this.properties.mode, result;

    switch (mode) {
      case '叠加':
        result = { type: 'merged', css: {} };
        inputs.forEach(function(input) {
          var src = (input.css || input);
          Object.keys(src).forEach(function(k) { result.css[k] = src[k]; });
        });
        break;
      case '堆叠':
        result = { type: 'merged', css: { position: 'relative' }, children: [] };
        inputs.forEach(function(input) { result.children.push(input.css || input); });
        break;
      case '覆盖':
        var last = inputs[inputs.length - 1];
        result = { type: 'merged', css: (last.css || last) };
        break;
    }

    this._lastOutput = result;
    this.setOutputData(0, result);
  };

  LiteGraph.registerNodeType('sill/merge', MergeNode);
```

- [ ] **Step 5.7: 注册全局 Token 节点 (sill/global-token)**

```javascript
  // =====================
  //  ⑥ 全局 Token 节点
  // =====================

  function GlobalTokenNode() {
    this.addOutput('tokens', PORT_TYPES.CSS);
    this.properties = {};
    this._cachedFavorites = {};
    this.size = [320, 200];
  }

  GlobalTokenNode.title = '全局 Token'; GlobalTokenNode.desc = '读取 tokens.css · 供 @ 引用和 🔗 锁定';

  GlobalTokenNode.prototype.onExecute = function() {
    var ts = window.TokenStore;
    if (!ts) { this._lastOutput = null; this.setOutputData(0, null); return; }

    var allTokens = {};
    ts.keys().forEach(function(k) {
      allTokens[k] = ts.get(k);
    });

    this._lastOutput = {
      type: 'tokens',
      all: allTokens,
      css: allTokens
    };
    this.setOutputData(0, this._lastOutput);
  };

  GlobalTokenNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;
    var x = 10, y = 45, tw = this.size[0] - 20;

    // 标题
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.fillText('📌 精选 Token', x, y);

    // 读取精选集
    var ts = window.TokenStore;
    if (!ts) return;
    var favs = ts.getFavorites();
    var yPos = y + 8;
    var cats = { color: '颜色', typography: '排版', spacing: '间距', radius: '圆角' };

    Object.keys(cats).forEach(function(cat) {
      var items = favs[cat] || [];
      if (items.length === 0) return;
      yPos += 14;
      ctx.fillStyle = '#4B5563';
      ctx.font = '9px sans-serif';
      ctx.fillText(cats[cat], x, yPos);

      items.slice(0, 4).forEach(function(tokenName) {
        yPos += 13;
        var val = ts.get(tokenName);
        ctx.fillStyle = '#6B7280';
        ctx.font = '8px monospace';
        var label = tokenName.replace('--', '').substring(0, 18);
        ctx.fillText(label, x + 8, yPos);
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText(val, x + tw - 60, yPos);
      });
    });
  };

  LiteGraph.registerNodeType('sill/global-token', GlobalTokenNode);
```

- [ ] **Step 5.8: 注册输出节点 (sill/output)**

```javascript
  // =====================
  //  ⑦ 输出节点（无画布预览，数据推送到右侧面板）
  // =====================

  function OutputNode() {
    this.addInput('input', PORT_TYPES.CSS);
    this.properties = {};
    this._lastOutput = null;
    this.size = [200, 80];
  }

  OutputNode.title = '输出'; OutputNode.desc = '连接到预览面板';

  OutputNode.prototype.onExecute = function() {
    this._lastOutput = this.getInputData(0);
    this.setOutputData(0, this._lastOutput);
  };

  OutputNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(10, 40, this.size[0] - 20, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#4B5563';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('数据已发送到预览面板 →', this.size[0] / 2, 58);
    ctx.textAlign = 'left';
  };

  LiteGraph.registerNodeType('sill/output', OutputNode);
```

- [ ] **Step 5.9: 右键菜单分组 + 快捷键 + 保存/加载**

```javascript
  // =====================
  //  右键菜单分组
  // =====================

  NodeEditor.getGroups = function() {
    return {
      '基础组件': ['sill/color-block', 'sill/text', 'sill/image'],
      '工具': ['sill/convert', 'sill/merge'],
      '全局控制': ['sill/global-token', 'sill/output']
    };
  };

  // =====================
  //  快捷键绑定
  // =====================

  NodeEditor.bindShortcuts = function(canvas, graph, options) {
    var onSave = options.onSave;
    var onLoad = options.onLoad;

    document.addEventListener('keydown', function(e) {
      // Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave();
      }
      // Ctrl+O 加载
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        if (onLoad) onLoad();
      }
      // R 重置视图
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        if (canvas && graph) {
          var nodes = graph._nodes;
          if (nodes && nodes.length) {
            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            nodes.forEach(function(n) {
              minX = Math.min(minX, n.pos[0] - 50);
              minY = Math.min(minY, n.pos[1] - 50);
              maxX = Math.max(maxX, n.pos[0] + n.size[0] + 50);
              maxY = Math.max(maxY, n.pos[1] + n.size[1] + 50);
            });
            var cw = canvas.canvas.width, ch = canvas.canvas.height;
            if (maxX > minX && maxY > minY && cw > 0 && ch > 0) {
              var fs = Math.min(cw / (maxX - minX), ch / (maxY - minY), 1) * 0.85;
              var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
              canvas.setZoom(fs);
              canvas.setOffset(cw / 2 - cx * fs, ch / 2 - cy * fs);
            }
          }
        }
      }
    });
  };
```

- [ ] **Step 5.10: 保存/加载 JSON 功能**

```javascript
  /**
   * 显示文件保存对话框（下载 JSON）
   */
  NodeEditor.saveToFile = function(graph) {
    var json = NodeEditor.serialize(graph);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'node-editor-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 显示文件加载对话框
   */
  NodeEditor.loadFromFile = function(graph, callback) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', function() {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        NodeEditor.deserialize(graph, e.target.result, callback);
      };
      reader.readAsText(file);
    });
    input.click();
  };

  // 关闭
})();
```

- [ ] **Step 5.11: 验证引擎完整性**

```javascript
// 预期在控制台验证:
// NodeEditor.init('#nodeCanvas') → { graph, canvas }
// 右键菜单包含 3 个分组 (基础组件/工具/全局控制)
// 每个分组下有正确的节点列表
// Ctrl+S 触发下载 .json 文件，Ctrl+O 触发文件选择器
```

---

## Task 6: 编写 node-editor.html — 分屏页面

**Files:**
- Create: `site/node-editor.html`

- [ ] **Step 6.1: 编写页面**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>节点编辑器 · Design System</title>

  <!-- litegraph.js CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/litegraph.js@0.7.0/build/litegraph.css">
  <script src="https://cdn.jsdelivr.net/npm/litegraph.js@0.7.0/build/litegraph.min.js"></script>

  <!-- 项目样式 + Token -->
  <link rel="stylesheet" href="css/node-editor.css">
  <link rel="stylesheet" href="css/tokens.css">
</head>
<body>
  <!-- 顶栏 -->
  <div class="ne-toolbar">
    <div class="brand">🔌 <span>Node</span> Editor</div>
    <div class="spacer"></div>
    <button class="toolbar-btn" id="loadBtn" title="Ctrl+O 打开项目">📂 打开</button>
    <button class="toolbar-btn" id="saveBtn" title="Ctrl+S 保存项目">💾 保存</button>
    <span class="ne-status" id="neStatus">就绪</span>
    <button class="toolbar-btn danger" id="closeBtn">✕ 关闭</button>
  </div>

  <!-- 主体：左画布 + 右预览 -->
  <div class="ne-main">
    <!-- 左：画布 -->
    <div class="ne-canvas-panel" id="nodeCanvas">
      <div class="ne-float-zoom">
        <button id="zoomOutBtn" title="缩小">−</button>
        <span class="zoom-label" id="zoomLabel">100%</span>
        <button id="zoomInBtn" title="放大">+</button>
        <button id="resetViewBtn" title="重置视图" style="width:auto;padding:0 10px;font-size:10px;">⌂</button>
      </div>
    </div>

    <!-- 右：预览 -->
    <div class="ne-preview-panel">
      <div class="ne-preview-header">
        <span class="dot"></span>
        实时预览
        <div class="preview-actions">
          <button id="copyHtmlBtn" title="复制输出 HTML">📋 复制</button>
        </div>
      </div>
      <div class="ne-preview-body" id="previewBody">
        <div class="empty-state">
          <div class="icon">🔌</div>
          <div>连接节点到「输出」节点开始预览</div>
          <div class="hint">拖拽节点到画布 → 连线 → 在右侧查看效果</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Token 基础设施 -->
  <script src="js/node-token.js"></script>
  <script src="js/node-token-ref.js"></script>
  <script src="js/node-token-lock.js"></script>

  <!-- 引擎 -->
  <script src="js/node-engine.js"></script>

  <!-- 初始化 -->
  <script>
    (function() {
      'use strict';

      var canvasWrap = document.getElementById('nodeCanvas');
      var previewBody = document.getElementById('previewBody');
      var statusEl = document.getElementById('neStatus');
      var zoomLabel = document.getElementById('zoomLabel');

      // 输出预览更新函数
      function updatePreview(outputData) {
        if (!outputData) {
          previewBody.innerHTML =
            '<div class="empty-state">' +
            '<div class="icon">🔌</div>' +
            '<div>连接节点到「输出」节点开始预览</div>' +
            '<div class="hint">拖拽节点到画布 → 连线 → 在右侧查看效果</div>' +
            '</div>';
          return;
        }

        var html = '';
        try {
          // 从输出数据构建 HTML
          var data = outputData;
          if (data && data.css) {
            var styleStr = '';
            Object.keys(data.css).forEach(function(k) {
              var v = data.css[k];
              if (v !== undefined && v !== null && v !== '') {
                styleStr += k + ':' + v + ';';
              }
            });

            // 子元素（堆叠模式）
            if (data.children && Array.isArray(data.children)) {
              var childHtml = data.children.map(function(child) {
                var cs = '';
                Object.keys(child).forEach(function(k) {
                  var v = child[k];
                  if (v !== undefined && v !== null && v !== '') cs += k + ':' + v + ';';
                });
                return '<div style="' + cs + '"></div>';
              }).join('\n');
              html = '<div class="preview-content" style="position:relative;">' + childHtml + '</div>';
            } else {
              var content = data.content || '';
              html = '<div class="preview-content" style="' + styleStr + '">' + content + '</div>';
            }
          } else if (typeof data === 'string') {
            html = '<div class="preview-content">' + data + '</div>';
          } else {
            html = '<div class="preview-content" style="color:#9CA3AF;font-size:13px;">无法预览此数据类型</div>';
          }

          // 包裹在预览容器中，使内容居中
          previewBody.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:auto;">' + html + '</div>';
        } catch(e) {
          previewBody.innerHTML = '<div class="preview-error">❌ 渲染错误: ' + e.message + '</div>';
        }
      }

      // 初始化引擎
      var engine = NodeEditor.init(canvasWrap, {
        onOutputChange: updatePreview
      });

      // 状态更新
      function updateStatus() {
        var count = engine.graph._nodes ? engine.graph._nodes.length : 0;
        statusEl.textContent = count + ' 个节点';
      }
      engine.graph.onAfterChange = function() {
        updateStatus();
        NodeEditor._updatePreview(engine.graph, updatePreview);
      };
      updateStatus();

      // 缩放
      function updateZoomLabel() {
        if (engine.canvas) {
          zoomLabel.textContent = Math.round(engine.canvas.ds.scale * 100) + '%';
        }
      }
      document.getElementById('zoomInBtn').addEventListener('click', function() {
        engine.canvas.ds.scale *= 1.3;
        engine.canvas.setDirty(true, true);
        updateZoomLabel();
      });
      document.getElementById('zoomOutBtn').addEventListener('click', function() {
        engine.canvas.ds.scale /= 1.3;
        engine.canvas.setDirty(true, true);
        updateZoomLabel();
      });
      document.getElementById('resetViewBtn').addEventListener('click', function() {
        var nodes = engine.graph._nodes;
        if (nodes && nodes.length) {
          var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          nodes.forEach(function(n) {
            minX = Math.min(minX, n.pos[0] - 50);
            minY = Math.min(minY, n.pos[1] - 50);
            maxX = Math.max(maxX, n.pos[0] + n.size[0] + 50);
            maxY = Math.max(maxY, n.pos[1] + n.size[1] + 50);
          });
          var cw = canvasWrap.clientWidth, ch = canvasWrap.clientHeight;
          if (maxX > minX && maxY > minY && cw > 0 && ch > 0) {
            var fs = Math.min(cw / (maxX - minX), ch / (maxY - minY), 1) * 0.85;
            var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
            engine.canvas.setZoom(fs);
            engine.canvas.setOffset(cw / 2 - cx * fs, ch / 2 - cy * fs);
          }
        }
        updateZoomLabel();
      });

      // 快捷键
      NodeEditor.bindShortcuts(engine.canvas, engine.graph, {
        onSave: function() { NodeEditor.saveToFile(engine.graph); },
        onLoad: function() { NodeEditor.loadFromFile(engine.graph, function(err) {
          if (err) alert('加载失败: ' + err.message);
          else { updateStatus(); updatePreview(null); }
        }); }
      });

      // 工具栏按钮
      document.getElementById('saveBtn').addEventListener('click', function() { NodeEditor.saveToFile(engine.graph); });
      document.getElementById('loadBtn').addEventListener('click', function() {
        NodeEditor.loadFromFile(engine.graph, function(err) {
          if (err) alert('加载失败: ' + err.message);
          else { updateStatus(); NodeEditor._updatePreview(engine.graph, updatePreview); }
        });
      });

      // 复制 HTML
      document.getElementById('copyHtmlBtn').addEventListener('click', function() {
        var previewEl = previewBody.querySelector('.preview-content');
        if (previewEl) {
          navigator.clipboard.writeText(previewEl.outerHTML).then(function() {
            var btn = document.getElementById('copyHtmlBtn');
            btn.textContent = '✅ 已复制';
            setTimeout(function() { btn.textContent = '📋 复制'; }, 2000);
          });
        }
      });

      // 关闭 → 通知父窗口
      document.getElementById('closeBtn').addEventListener('click', function() {
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'node-editor-close' }, '*');
        }
      });

      // ESC
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && engine.canvas) engine.canvas.selectNodes([]);
      });

      console.log('[节点编辑器] Phase 1 启动完成: 7 个节点 + 分屏预览 + 快捷键');
    })();
  </script>
</body>
</html>
```

---

## Task 7: 浮层集成到画布页面

**Files:**
- Modify: `site/infinite-canvas-demo.html`
- Modify: `site/css/canvas-demo.css`

- [ ] **Step 7.1: 在控制栏添加按钮**

在 `site/infinite-canvas-demo.html` 的控制栏中（在返回首页链接后面添加）：

```html
<button class="ctrl-btn node-editor-toggle" data-action="open-node-editor" title="打开节点编辑器">🔌 节点</button>
```

- [ ] **Step 7.2: 加载 node-editor.css**

在 `<head>` 中添加：

```html
<link rel="stylesheet" href="css/node-editor.css">
```

- [ ] **Step 7.3: 添加浮层容器和脚本**

在 `</body>` 之前添加：

```html
  <!-- 节点编辑器浮层 -->
  <div class="node-editor-overlay" id="nodeEditorOverlay">
    <div class="node-editor-container">
      <iframe src="node-editor.html" id="nodeEditorFrame" title="节点编辑器"></iframe>
    </div>
  </div>

  <script>
  (function() {
    var overlay = document.getElementById('nodeEditorOverlay');
    var toggleBtn = document.querySelector('[data-action="open-node-editor"]');
    if (!overlay || !toggleBtn) return;

    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      overlay.classList.add('active');
    });

    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'node-editor-close') {
        overlay.classList.remove('active');
      }
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('active');
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
      }
    });
  })();
  </script>
```

---

## Task 8: 端到端验证

- [ ] **Step 8.1: 启动服务器**

```bash
cd ~/Desktop/sill/site && node server.js
```

- [ ] **Step 8.2: 验证分屏布局**

访问 `http://localhost:3000/node-editor.html`

预期：
- ✅ 顶栏：品牌 + 打开 + 保存 + 状态 + 关闭
- ✅ 左侧：LiteGraph 画布，浮动缩放按钮（+/−/⌂）
- ✅ 右侧：实时预览面板，显示"连接节点到输出节点"空状态
- ✅ 右键菜单 → Add Node → 3 个分组共 7 个节点

- [ ] **Step 8.3: 验证节点功能**

预期：
- ✅ 添加色块节点 → 拖拽 → 连接输出节点 → 右侧预览面板显示色块
- ✅ 修改色块 widget 参数 → 预览即时更新
- ✅ 添加文字节点 → 修改内容 → 连线 → 预览更新
- ✅ 添加图片节点 → 输入 URL → 预览显示图片
- ✅ 转换节点 6 种模式下拉切换
- ✅ 合并节点 3 种模式（叠加/堆叠/覆盖）
- ✅ 全局 Token 节点展示精选 Token
- ✅ 类型不匹配端口阻止连接 + 红色闪烁

- [ ] **Step 8.4: 验证快捷键和保存/加载**

预期：
- ✅ Ctrl+S → 浏览器下载 `.json` 文件
- ✅ Ctrl+O → 弹出文件选择器 → 选择之前保存的 `.json` → 图恢复
- ✅ Delete 删除节点、Ctrl+Z 撤销
- ✅ R 重置视图
- ✅ 📋 复制按钮 → 复制预览 HTML 到剪贴板

- [ ] **Step 8.5: 验证浮层集成**

访问 `http://localhost:3000/infinite-canvas-demo.html`

预期：
- ✅ 控制栏有「🔌 节点」蓝色按钮
- ✅ 点击后全屏浮层 + 分屏编辑器
- ✅ 浮层中完整功能正常使用
- ✅ ✕ / ESC / 遮罩点击 → 关闭
- ✅ 背景画布展示卡片不受影响

- [ ] **Step 8.6: 验证 Token 基础设施**

```javascript
// 浏览器控制台:
TokenStore.get('--color-primary-500')  // → "#3B82F6"（或实际值）
TokenRef.resolve('@color-primary-500') // → "#3B82F6"
TokenStore.getFavorites()              // → { color: [...], typography: [...], spacing: [...], radius: [...] }
TokenLock.init('node-1', { color: '--color-primary-500' })
TokenLock.getValue('node-1', 'color')  // → "#3B82F6"
TokenLock.setCustom('node-1', 'color', '#FF0000')
TokenLock.isLocked('node-1', 'color')  // → false
TokenLock.resetToToken('node-1', 'color') // → 重新锁定，返回当前 Token 值
```

- [ ] **Step 8.7: 提交 Phase 1**

```bash
cd ~/Desktop/sill
git add site/node-editor.html site/js/node-engine.js site/js/node-token.js \
      site/js/node-token-ref.js site/js/node-token-lock.js site/css/node-editor.css
git add site/infinite-canvas-demo.html site/css/canvas-demo.css
git commit -m "feat: add node editor phase 1 — 7 nodes + split preview + @token ref + save/load

- Webflow/Framer style split layout: left canvas, right preview panel
- 7 node types: ColorBlock / Text / Image / Convert / Merge / GlobalToken / Output
- Token infrastructure: reader, @xxx reference resolver, lock/unlock state manager
- Right-click grouping: 基础组件 / 工具 / 全局控制
- Type-mismatch prevention with red flash feedback
- Error state display on nodes and preview panel
- 11 keyboard shortcuts + Save/Load .json project files
- Floating overlay integration on existing canvas page
- Minimal styling, theme to be done in final phase"
```

---

## Phase 1 完成标志

```
┌──────────────────────────────────────┬──────────────────────┐
│  🔌 Node Editor                      │  ● 实时预览          │
│  ┌────────────┐  ┌──────────────┐    │  ┌────────────────┐ │
│  │ 色块 ○→○   │  │ 文字 ○→○     │    │  │                │ │
│  │ 色值 #...  │  │ 字体/字号... │    │  │  渲染结果       │ │
│  └────────────┘  └──────────────┘    │  │                │ │
│  ┌────────────┐  ┌──────────────┐    │  └────────────────┘ │
│  │ 图片 ○→○   │  │ 转换 ○→○     │    │  [📋 复制]        │
│  │ URL        │  │ text→css ▼  │    │                    │
│  └────────────┘  └──────────────┘    │                    │
│  ┌────────────┐  ┌──────────────┐    │                    │
│  │ 合并 ○→○   │  │ 全局 Token   │    │                    │
│  │ A B C      │  │ 精选集...    │    │                    │
│  └────────────┘  └──────────────┘    │                    │
│  ┌────────────┐                       │                    │
│  │ 输出 ○→    │                       │                    │
│  └────────────┘                       │                    │
│  [−] [100%] [+] [⌂]                 │                    │
│  Ctrl+S=保存  Ctrl+O=加载            │                    │
└──────────────────────────────────────┴──────────────────────┘

✅ 7 个节点可添加/连线/配置
✅ 分屏布局：左画布右实时预览
✅ @token 引用解析 (TokenRef.resolve)
✅ 🔗 锁定/解锁/重置 (TokenLock)
✅ 类型不匹配阻止 + 红色闪烁
✅ 节点错误状态 UI
✅ 11 个快捷键 (Ctrl+S/Ctrl+O/Ctrl+Z/Delete/R/ESC…)
✅ 保存/加载 .json 项目文件
✅ 6 种转换模式下拉选择
✅ 3 种合并模式（叠加/堆叠/覆盖）
✅ 精选 Token 显示（全局 Token 节点）
✅ 浮层弹窗集成到画布页面
✅ 基础 CSS 布局（主题最后适配）
