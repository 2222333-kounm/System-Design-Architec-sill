# 编辑器基础框架 + 色块节点 Demo — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**目标：** 搭建完整的编辑器基础框架（布局、引擎、数据流）+ 色块节点作为首个可运行 Demo

**架构：**
- 单页编辑器：左画布 + 右侧最终效果面板 + 可拖拽分隔线
- LiteGraph 作为底层图引擎，在其之上封装统一的数据流层
- 节点基类提供统一的参数/端口/输出格式模板
- 色块节点验证完整链路：拖拽→连线→调参→预览

**技术栈：** LiteGraph.js · 纯前端 HTML/CSS/JS · 无构建工具

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `site/editor.html` | 新建 | 主页面：左画布 + 右预览 + 顶栏 + 分隔线 |
| `site/css/editor.css` | 新建 | 编辑器布局样式（画布/预览/顶栏/分隔线） |
| `site/js/editor-engine.js` | 新建 | LiteGraph 封装 + 拓扑排序 + 循环检测 + 端口匹配 |
| `site/js/nodes/core.js` | 新建 | 节点基类（NodeBase）+ 统一输出格式工具 |
| `site/js/nodes/color-block.js` | 新建 | 色块节点（完整 UI + 参数 + 预览） |
| `site/js/nodes/output.js` | 新建 | 输出节点（推送到右侧面板） |
| `site/js/editor-init.js` | 新建 | 初始化脚本：挂载引擎 + 节点注册 + 快捷键 |

---

### Task 1: 创建 editor.html 基础布局

**Files:**
- Create: `site/editor.html`

布局结构：
```
┌──────────────────────────────────────────────────────────────┐
│ 🔌 Node Editor         状态: X 节点    🤖 AI  📂 💾 │ 顶栏
├──────────────────────────────────┬───────────────────────────┤
│                                  │ ▶ 渲染  ⬇ 导出          │
│          无限画布                 │                          │
│                                  │    最终效果展示           │
│                                  │                          │
│   ┌── ⊕ ─ 100% ─ ⊕ ───┐       │                          │
│   └────────────────────┘       │                          │
│                                  │                          │
├──────────────────────────────────┴───────────────────────────┤
│ 💡 拖拽节点到画布 · 连线 · 右侧实时查看最终效果               │
└──────────────────────────────────────────────────────────────┘
```

- [ ] **Step 1: 创建 editor.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Node Editor · Design System</title>
  <!-- LiteGraph CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/litegraph.js@0.7.0/build/litegraph.css">
  <script src="https://cdn.jsdelivr.net/npm/litegraph.js@0.7.0/build/litegraph.min.js"></script>
  <!-- Editor styles -->
  <link rel="stylesheet" href="css/editor.css">
  <link rel="stylesheet" href="css/tokens.css">
</head>
<body>
  <!-- 顶栏 -->
  <div class="editor-toolbar">
    <div class="toolbar-brand">🔌 <span>Node</span> Editor</div>
    <div class="toolbar-status" id="statusDisplay">就绪</div>
    <div class="toolbar-spacer"></div>
    <button class="toolbar-btn" id="aiScanBtn">🤖 AI</button>
    <button class="toolbar-btn" id="loadBtn">📂 打开</button>
    <button class="toolbar-btn" id="saveBtn">💾 保存</button>
  </div>

  <!-- 主体 -->
  <div class="editor-main">

    <!-- 左：画布 -->
    <div class="editor-canvas-wrap" id="canvasWrap">
      <div class="canvas-float-zoom">
        <button id="zoomOutBtn">−</button>
        <span id="zoomLabel">100%</span>
        <button id="zoomInBtn">+</button>
        <button id="resetViewBtn">⌂</button>
      </div>
    </div>

    <!-- 可拖拽分隔线 -->
    <div class="editor-divider" id="editorDivider"></div>

    <!-- 右：预览面板 -->
    <div class="editor-preview" id="previewPanel">
      <div class="preview-topbar">
        <span class="preview-label">📱 预览</span>
        <button id="copyHtmlBtn" title="复制输出 HTML">📋</button>
      </div>
      <div class="preview-body" id="previewBody">
        <div class="preview-empty">
          <div class="preview-empty-icon">🔌</div>
          <div>连接节点到「输出」即可预览</div>
        </div>
      </div>
      <div class="preview-bottombar">💡 连接节点到输出节点</div>
    </div>

  </div>

  <!-- JS -->
  <script src="js/node-token.js"></script>
  <script src="js/node-token-ref.js"></script>
  <script src="js/node-token-lock.js"></script>
  <script src="js/editor-engine.js"></script>
  <script src="js/nodes/core.js"></script>
  <script src="js/nodes/color-block.js"></script>
  <script src="js/nodes/output.js"></script>
  <script src="js/editor-init.js"></script>
</body>
</html>
```

### Task 2: 创建 css/editor.css

**Files:**
- Create: `site/css/editor.css`

包含：
- 全局布局（顶栏/主体/左画布/右预览）
- 可拖拽分隔线样式（hover 高亮 + cursor 切换）
- 预览面板（顶栏/内容/底栏）
- 画布浮动缩放按钮
- 空状态/错误状态样式

### Task 3: 创建 js/editor-engine.js

**Files:**
- Create: `site/js/editor-engine.js`

核心引擎，封装 LiteGraph，提供：
- `EditorEngine.init(container, options)` — 初始化 LiteGraph
- 拓扑排序自动执行
- 循环依赖检测（连线时检查是否有环）
- 端口类型匹配（color/image/text/css/any 互斥规则）
- `EditorEngine.serialize(graph)` / `deserialize(graph, json)`
- `EditorEngine.bindShortcuts(canvas, graph, options)`
- `EditorEngine._updatePreview(graph, callback)` — 遍历找输出节点

```javascript
/* ========================================
   编辑器引擎 — LiteGraph 封装
   拓扑排序 · 循环检测 · 端口匹配
   ======================================== */

;(function() {
  'use strict';

  var EditorEngine = window.EditorEngine = {};

  var PORT_TYPES = {
    COLOR: 'color',
    IMAGE: 'image',
    TEXT: 'text',
    CSS: 'css',
    NUMBER: 'number',
    ANY: 'any',
    INTERACTIVE: 'interactive'
  };

  // 端口匹配规则: 哪些类型可以连接
  var COMPATIBLE = {};
  COMPATIBLE[PORT_TYPES.COLOR] = [PORT_TYPES.COLOR, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE[PORT_TYPES.IMAGE] = [PORT_TYPES.IMAGE, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE[PORT_TYPES.TEXT] = [PORT_TYPES.TEXT, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE[PORT_TYPES.CSS] = [PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE[PORT_TYPES.INTERACTIVE] = [PORT_TYPES.INTERACTIVE, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE[PORT_TYPES.ANY] = [PORT_TYPES.COLOR, PORT_TYPES.IMAGE, PORT_TYPES.TEXT, PORT_TYPES.CSS, PORT_TYPES.INTERACTIVE, PORT_TYPES.ANY];
  COMPATIBLE[PORT_TYPES.NUMBER] = [PORT_TYPES.NUMBER, PORT_TYPES.ANY];

  EditorEngine.PORT_TYPES = PORT_TYPES;
  EditorEngine.isCompatible = function(fromType, toType) {
    var allowed = COMPATIBLE[fromType] || [];
    return allowed.indexOf(toType) >= 0;
  };

  /**
   * 循环检测: 判断添加这条边是否会形成环
   */
  EditorEngine.wouldCreateCycle = function(graph, fromNode, toNode) {
    // BFS 从 toNode 出发，看是否能回到 fromNode
    var visited = {};
    var queue = [toNode];
    while (queue.length > 0) {
      var current = queue.shift();
      if (current === fromNode) return true;
      var id = current.id;
      if (visited[id]) continue;
      visited[id] = true;
      // 遍历当前节点的所有输出连接
      if (current.outputs) {
        for (var i = 0; i < current.outputs.length; i++) {
          var output = current.outputs[i];
          if (output.links) {
            for (var j = 0; j < output.links.length; j++) {
              var linkId = output.links[j];
              var link = graph.links[linkId];
              if (link) {
                var targetNode = graph.getNodeById(link.target_id);
                if (targetNode && !visited[targetNode.id]) {
                  queue.push(targetNode);
                }
              }
            }
          }
        }
      }
    }
    return false;
  };

  /**
   * 初始化编辑器
   */
  EditorEngine.init = function(container, opts) {
    opts = opts || {};
    if (window.TokenStore) window.TokenStore.refresh();

    var graph = new LGraph();

    var canvasEl;
    if (container.tagName === 'CANVAS') {
      canvasEl = container;
    } else {
      canvasEl = document.createElement('canvas');
      canvasEl.style.width = '100%';
      canvasEl.style.height = '100%';
      canvasEl.style.display = 'block';
      canvasEl.id = 'litegraph-canvas';
      container.appendChild(canvasEl);

      var w = container.clientWidth || window.innerWidth - 420;
      var h = container.clientHeight || window.innerHeight - 44;
      canvasEl.width = Math.max(w, 400);
      canvasEl.height = Math.max(h, 400);
    }

    var canvas = new LGraphCanvas(canvasEl, graph);
    canvas.background_image = '';
    canvas.node_title_color = '#FAFAFA';
    canvas.allow_searchbox = true;
    canvas.setSize(canvasEl.width, canvasEl.height);

    // resize 响应
    window.addEventListener('resize', function() {
      var cw = container.clientWidth;
      var ch = container.clientHeight;
      if (cw > 0 && ch > 0) {
        canvasEl.width = cw;
        canvasEl.height = ch;
        canvas.setSize(cw, ch);
      }
    });

    // 连线前的端口类型检查
    var _origConnect = graph.connect;
    graph.connect = function(a, b, c) {
      // 略——实际检查端口类型兼容性
      return _origConnect.call(this, a, b, c);
    };

    // 连线后的循环检测
    canvas.onConnection = function(node, slot, targetNode, targetSlot) {
      if (EditorEngine.wouldCreateCycle(graph, node, targetNode)) {
        return false; // 禁止连接
      }
      return true;
    };

    // 输出变化通知
    graph.onAfterChange = function() {
      EditorEngine._updatePreview(graph, opts.onOutputChange);
    };

    graph.start();
    return { graph: graph, canvas: canvas };
  };

  /**
   * 更新预览
   */
  EditorEngine._updatePreview = function(graph, callback) {
    var outputNode = null;
    if (!graph || !graph._nodes) return;
    for (var i = 0; i < graph._nodes.length; i++) {
      if (graph._nodes[i].type === 'sill/output') {
        outputNode = graph._nodes[i];
        break;
      }
    }
    if (outputNode) {
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

  // 序列化/反序列化、快捷键绑定等（从现有 node-engine.js 移植）
  // ...

})();
```

### Task 4: 创建 js/nodes/core.js

**Files:**
- Create: `site/js/nodes/core.js`

节点基类 NodeBase，所有节点继承：

```javascript
/* ========================================
   节点基类 — 所有节点继承此基类
   ======================================== */;(function() {
  'use strict';

  var NodeBase = function(title, params) {
    // 统一初始化
    this.properties = params || {};
    this._lastOutput = null;
    this.size = [320, 200];
  };

  NodeBase.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    this.graph?.onAfterChange?.(this.graph);
  };

  // 统一输出格式构建
  NodeBase.prototype.buildOutput = function(type, css, extra) {
    return { type: type, css: css || {}, extra: extra || {} };
  };

  window.NodeBase = NodeBase;
})();
```

### Task 5: 创建 js/nodes/color-block.js

**Files:**
- Create: `site/js/nodes/color-block.js`

色块节点 — 完全按照设计规格：
- 标题栏：左端口 `input (color)` · 🎨 色块 · 右端口 `○ (color)`
- 参数：色值（拾色器滑块）、宽度（40~800）、高度（20~600）、圆角（0~9999）、不透明度（0~100%）
- 底部预览：实时色块 + 参数标注
- 输出格式：`{ type: 'color', css: { background, width, height, borderRadius, opacity } }`

### Task 6: 创建 js/nodes/output.js

**Files:**
- Create: `site/js/nodes/output.js`

输出节点：
- 标题栏：左端口 `data in` · 📤 输出 · (终点)
- 无输出端口
- `onExecute()` 存储输入数据供预览面板读取
- 底部显示当前数据摘要

### Task 7: 创建 js/editor-init.js

**Files:**
- Create: `site/js/editor-init.js`

初始化脚本：
- 获取 DOM 元素
- 调用 `EditorEngine.init()`
- 注册节点（色块 + 输出）
- 绑定保存/加载/复制按钮
- 绑定缩放控件
- 绑定快捷键
- 实现预览更新回调 → 渲染到右侧面板

### Task 8: 验证可运行 Demo

- [ ] 打开 `editor.html`，确认布局正确（左画布 + 右预览）
- [ ] 右键画布 → 弹出菜单，选择色块节点
- [ ] 色块出现在画布上，参数可调
- [ ] 拖拽连线自测：色块 → 输出
- [ ] 修改色块参数 → 右侧预览面板实时更新
- [ ] 循环检测：输出连回色块 → 被阻止
- [ ] 保存/加载 JSON 正常工作
- [ ] 提交到 git

