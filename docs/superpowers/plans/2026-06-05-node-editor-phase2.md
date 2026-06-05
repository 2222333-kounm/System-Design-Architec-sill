# 节点编辑器 Phase 2 — 新增 3 个节点

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有节点编辑器中新增 3 个节点类型（视频/按钮/图标），更新右键菜单分组。

**Architecture:** 在 `site/js/node-engine.js` 中追加 3 个节点注册代码（视频节点放在图片节点之后，按钮和图标节点放在合并节点之后、全局 Token 节点之前），更新右键分组映射。Phase 1 已有所有基础设施（TokenStore、TokenRef、端口类型），新增节点直接复用。

**Tech Stack:** litegraph.js、原生 JavaScript

**依赖前置条件：** Phase 1 已完成，所有 Token 基础设施和端口系统就绪。

---

## 文件结构

### 修改文件

| 文件 | 修改点 | 行数增加 |
|------|--------|---------|
| `site/js/node-engine.js` | 插入 3 个新节点定义 + 更新右键分组 | ~+200 |

### 无新建文件

所有 3 个节点使用现有基础设施（端口类型、Token 引用、数据格式）。

---

## Task 1: 在 node-engine.js 中插入视频节点

**Files:**
- Modify: `site/js/node-engine.js`

- [ ] **Step 1.1: 在图片节点之后插入视频节点**

在图片节点的 `registerNodeType`（第 293 行）和文字节点构造函数之间插入视频节点。具体位置在：

```javascript
  LiteGraph.registerNodeType('sill/image', ImageNode);

  // =====================
  //  ③ 视频节点（Phase 2 新增）
  // =====================

  function VideoNode() {
    this.addInput('input', PORT_TYPES.ANY);
    this.addOutput('video', PORT_TYPES.IMAGE);
    this.properties = {
      url: '',
      autoplay: true,
      loop: true,
      muted: false,
      controls: true
    };
    this._fileName = '';

    var that = this;
    this.addWidget('text', '视频 URL', this.properties.url, function(v) {
      that.properties.url = v; that._markDirty();
    });
    this.addWidget('toggle', '自动播放', this.properties.autoplay, function(v) {
      that.properties.autoplay = v; that._markDirty();
    });
    this.addWidget('toggle', '循环', this.properties.loop, function(v) {
      that.properties.loop = v; that._markDirty();
    });
    this.addWidget('toggle', '静音', this.properties.muted, function(v) {
      that.properties.muted = v; that._markDirty();
    });
    this.addWidget('toggle', '控件', this.properties.controls, function(v) {
      that.properties.controls = v; that._markDirty();
    });

    this.size = [320, 220];
  }

  VideoNode.title = '视频';
  VideoNode.desc = '上传/引用视频 · 自动播放/循环/静音/控件';

  VideoNode.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    this.graph?.onAfterChange?.(this.graph);
  };

  VideoNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (input && input.url) this.properties.url = input.url;
    var url = this.properties.url || '';
    this._lastOutput = {
      type: 'image',
      url: url,
      video: true,
      autoplay: this.properties.autoplay,
      loop: this.properties.loop,
      muted: this.properties.muted,
      controls: this.properties.controls,
      css: {}
    };
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/video', VideoNode);
```

- [ ] **Step 1.2: 验证视频节点注册**

验证方式：在浏览器中打开 node-editor.html → 右键菜单 → Add Node → 基础组件分组下能看到「视频」节点。

---

## Task 2: 在 node-engine.js 中插入按钮节点

**Files:**
- Modify: `site/js/node-engine.js`

- [ ] **Step 2.1: 在合并节点之后插入按钮节点**

在合并节点的 `registerNodeType`（第 387 行）之后、全局 Token 节点构造函数之前插入：

```javascript
  LiteGraph.registerNodeType('sill/merge', MergeNode);

  // =====================
  //  ⑤ 按钮节点（Phase 2 新增）
  // =====================

  function ButtonNode() {
    this.addInput('input', PORT_TYPES.TEXT);
    this.addOutput('interactive', PORT_TYPES.INTERACTIVE);
    this.properties = {
      text: '立即购买',
      color: '#0071E3',
      hoverColor: '#0077ED',
      activeColor: '#0068D9',
      borderRadius: 8,
      padding: 'sm'
    };

    var ts = window.TokenStore;
    if (ts) {
      var primary = ts.get('--color-primary-500');
      if (primary) this.properties.color = primary;
    }

    var that = this;
    this.addWidget('text', '文字', this.properties.text, function(v) {
      that.properties.text = v; that._markDirty();
    });
    this.addWidget('color', '常态色', this.properties.color, function(v) {
      that.properties.color = v; that._markDirty();
    });
    this.addWidget('color', 'Hover色', this.properties.hoverColor, function(v) {
      that.properties.hoverColor = v; that._markDirty();
    });
    this.addWidget('color', 'Active色', this.properties.activeColor, function(v) {
      that.properties.activeColor = v; that._markDirty();
    });
    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v; that._markDirty();
    }, { min: 0, max: 9999, step: 1 });
    this.addWidget('combo', '内边距', this.properties.padding, function(v) {
      that.properties.padding = v; that._markDirty();
    }, { values: ['xs', 'sm', 'md', 'lg', 'xl'] });

    this.size = [320, 280];
  }

  ButtonNode.title = '按钮';
  ButtonNode.desc = '完整按钮 · 三态颜色/圆角/内边距';

  ButtonNode.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    this.graph?.onAfterChange?.(this.graph);
  };

  ButtonNode.prototype._paddingMap = {
    xs: '4px 8px', sm: '8px 16px', md: '12px 24px', lg: '16px 32px', xl: '20px 40px'
  };

  ButtonNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (input && typeof input === 'string') this.properties.text = input;
    this._lastOutput = {
      type: 'interactive',
      kind: 'button',
      text: this.properties.text,
      css: {
        display: 'inline-block',
        padding: this._paddingMap[this.properties.padding] || '8px 16px',
        background: this.properties.color,
        color: '#FFFFFF',
        'border-radius': this.properties.borderRadius + 'px',
        border: 'none',
        cursor: 'pointer',
        'font-size': '14px',
        'font-weight': 500,
        transition: 'background 0.15s, color 0.15s'
      },
      hover: { background: this.properties.hoverColor },
      active: { background: this.properties.activeColor }
    };
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/button', ButtonNode);
```

---

## Task 3: 在 node-engine.js 中插入图标节点

**Files:**
- Modify: `site/js/node-engine.js`

- [ ] **Step 3.1: 在按钮节点之后插入图标节点**

```javascript
  LiteGraph.registerNodeType('sill/button', ButtonNode);

  // =====================
  //  ⑥ 图标节点（Phase 2 新增）
  // =====================

  var ICON_LIST = ['🔍','🔔','⚙️','📁','❤️','⭐','💬','📌','🔗','💾','📤','📥','🔄','🎯','🧩','🔒','🌐','✏️','🗑️','📊'];

  function IconNode() {
    this.addInput('input', PORT_TYPES.ANY);
    this.addOutput('css', PORT_TYPES.CSS);
    this.properties = {
      icon: '🔍',
      size: 24,
      color: '#000000',
      opacity: 100
    };

    var ts = window.TokenStore;
    if (ts) {
      var textColor = ts.get('--color-text-primary');
      if (textColor) this.properties.color = textColor;
    }

    var that = this;
    this.addWidget('combo', '图标', this.properties.icon, function(v) {
      that.properties.icon = v; that._markDirty();
    }, { values: ICON_LIST });
    this.addWidget('number', '大小', this.properties.size, function(v) {
      that.properties.size = v; that._markDirty();
    }, { min: 8, max: 128, step: 1 });
    this.addWidget('color', '颜色', this.properties.color, function(v) {
      that.properties.color = v; that._markDirty();
    });
    this.addWidget('slider', '透明度', this.properties.opacity, function(v) {
      that.properties.opacity = v; that._markDirty();
    }, { min: 0, max: 100 });

    this.size = [320, 200];
  }

  IconNode.title = '图标';
  IconNode.desc = '图标库 · 大小/颜色/透明度';

  IconNode.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    this.graph?.onAfterChange?.(this.graph);
  };

  IconNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    if (input && typeof input === 'string') this.properties.icon = input;
    this._lastOutput = {
      type: 'css',
      icon: this.properties.icon,
      css: {
        'font-size': this.properties.size + 'px',
        color: this.properties.color,
        opacity: this.properties.opacity / 100,
        'line-height': 1
      },
      html: '<span style="font-size:' + this.properties.size + 'px;color:' + this.properties.color + ';opacity:' + (this.properties.opacity/100) + '">' + this.properties.icon + '</span>'
    };
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/icon', IconNode);
```

---

## Task 4: 更新右键菜单分组

**Files:**
- Modify: `site/js/node-engine.js`

- [ ] **Step 4.1: 更新 getGroups 方法**

在 `NodeEditor.getGroups` 函数中，将 3 个新节点加入对应分组：

```javascript
  NodeEditor.getGroups = function() {
    return {
      '基础组件': ['sill/color-block', 'sill/text', 'sill/image', 'sill/video', 'sill/icon'],
      '工具': ['sill/convert', 'sill/merge'],
      '全局控制': ['sill/global-token', 'sill/output', 'sill/button']
    };
  };
```

变化：
- 基础组件：新增 `sill/video`、`sill/icon`（4 → 6 个）
- 工具：不变（2 个）
- 全局控制：新增 `sill/button`（2 → 3 个）

---

## Task 5: 端到端验证

- [ ] **Step 5.1: 启动服务器**

```bash
cd ~/Desktop/sill/site && node server.js
```

- [ ] **Step 5.2: 验证 3 个新节点**

访问 `http://localhost:3000/node-editor.html`

预期：
- ✅ 右键菜单 → 基础组件：色块、文字、图片、**视频**、**图标**
- ✅ 右键菜单 → 全局控制：全局 Token、输出、**按钮**
- ✅ 添加视频节点 → 输入视频 URL → 连到输出 → 预览面板显示视频
- ✅ 添加按钮节点 → 修改文字/三态颜色 → 预览显示按钮
- ✅ 添加图标节点 → 选择不同图标 → 预览显示图标
- ✅ 修改任意 widget 参数 → 预览即时更新

- [ ] **Step 5.3: 验证类型匹配**

预期：
- ✅ 视频节点输出 `image` 类型 → 可连接蒙版节点（后续 Phase）
- ✅ 按钮节点输出 `interactive` 类型 → 只能连 interactive 端口
- ✅ 图标节点输出 `css` 类型 → 可连输出/变换/边框/阴影等节点

- [ ] **Step 5.4: 验证与 Phase 1 功能不冲突**

预期：
- ✅ Phase 1 的 7 个节点仍然可用
- ✅ Token 引用、锁定/解锁、保存/加载仍然正常
- ✅ 浮层集成仍然正常

- [ ] **Step 5.5: 提交**

```bash
cd ~/Desktop/sill
git add site/js/node-engine.js
git commit -m "feat: add node editor phase 2 — video/button/icon nodes

- Add VideoNode: URL input, autoplay/loop/muted/controls toggles
- Add ButtonNode: three-state colors, border-radius, padding preset
- Add IconNode: 20-icon picker, size/color/opacity controls
- Update right-click group mappings
- 10 total node types now registered"
```
