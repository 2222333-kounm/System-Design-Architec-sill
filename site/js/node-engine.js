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
    var VPLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23374151%22/%3E%3Ctext x=%22160%22 y=%2290%22 text-anchor=%22middle%22 fill=%22%236B7280%22 font-size=%2214%22%3E%26%23x25B6%3B 视频占位%3C/text%3E%3C/svg%3E';
    var url = this.properties.url || VPLACEHOLDER;
    this._lastOutput = {
      type: 'image',
      url: url,
      video: true,
      autoplay: this.properties.autoplay,
      loop: this.properties.loop,
      muted: this.properties.muted,
      controls: this.properties.controls,
      css: {
        width: '100%',
        height: 'auto'
      }
    };
    this.setOutputData(0, this._lastOutput);
  };

  LiteGraph.registerNodeType('sill/video', VideoNode);

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

    this._paddingMap = {
      xs: '4px 8px', sm: '8px 16px', md: '12px 24px', lg: '16px 32px', xl: '20px 40px'
    };

    this.size = [320, 280];
  }

  ButtonNode.title = '按钮';
  ButtonNode.desc = '完整按钮 · 三态颜色/圆角/内边距';

  ButtonNode.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    this.graph?.onAfterChange?.(this.graph);
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

  // =====================
  //  ⑧ 全局 Token 节点
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

  // =====================
  //  右键菜单分组
  // =====================

  NodeEditor.getGroups = function() {
    return {
      '基础组件': ['sill/color-block', 'sill/text', 'sill/image', 'sill/video', 'sill/icon'],
      '工具': ['sill/convert', 'sill/merge'],
      '全局控制': ['sill/global-token', 'sill/output', 'sill/button']
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

})();
