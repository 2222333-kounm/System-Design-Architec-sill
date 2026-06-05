/* ========================================
   按钮节点 — 交互式按钮
   输入: input | 输出: interactive
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[ButtonNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  填充映射表
  // =====================

  var PADDING_MAP = {
    xs: '4px 8px',
    sm: '8px 16px',
    md: '12px 24px',
    lg: '16px 32px',
    xl: '20px 40px'
  };

  // =====================
  //  按钮节点定义
  // =====================

  function ButtonNode() {
    this.addInput('input', 'text');
    this.addOutput('interactive', 'interactive');

    this.properties = {
      text: '立即购买',
      color: '#0071E3',
      hoverColor: '#0077ED',
      activeColor: '#0068D9',
      textColor: '#FFFFFF',
      borderRadius: 980,
      padding: 'sm',
      fontSize: 14
    };

    // 从 TokenStore 读取默认值
    var ts = window.TokenStore;
    if (ts) {
      var primary = ts.get('--color-primary-500');
      if (primary) this.properties.color = primary;
    }

    var that = this;

    // 按钮文本
    this.addWidget('text', '文本', this.properties.text, function(v) {
      that.properties.text = v;
      that._markDirty();
    });

    // 背景色
    this.addWidget('color', '背景色', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    // 悬停色
    this.addWidget('color', '悬停色', this.properties.hoverColor, function(v) {
      that.properties.hoverColor = v;
      that._markDirty();
    });

    // 激活色
    this.addWidget('color', '激活色', this.properties.activeColor, function(v) {
      that.properties.activeColor = v;
      that._markDirty();
    });

    // 文字色
    this.addWidget('color', '文字色', this.properties.textColor, function(v) {
      that.properties.textColor = v;
      that._markDirty();
    });

    // 圆角
    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v;
      that._markDirty();
    }, { min: 0, max: 9999, step: 1 });

    // 填充
    this.addWidget('combo', '填充', this.properties.padding, function(v) {
      that.properties.padding = v;
      that._markDirty();
    }, {
      values: ['xs', 'sm', 'md', 'lg', 'xl']
    });

    // 字号
    this.addWidget('number', '字号', this.properties.fontSize, function(v) {
      that.properties.fontSize = v;
      that._markDirty();
    }, { min: 8, max: 40, step: 1 });

    // 节点尺寸
    this.previewY = 280;
    this.size = [320, 380];
  }

  ButtonNode.title = '🔘 按钮';
  ButtonNode.desc = '交互按钮 · 文本/背景色/悬停色/激活色/圆角/填充/字号';

  ButtonNode.prototype = Object.create(NodeBase.prototype);
  ButtonNode.prototype.constructor = ButtonNode;

  /**
   * 节点执行 — 计算输出数据
   */
  ButtonNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了文本，则同步更新
    if (input && typeof input === 'string') {
      this.properties.text = input;
    } else if (input && input.text) {
      this.properties.text = input.text;
    }

    // 解析 Token 引用
    var resolvedColor = this.properties.color;
    var resolvedHover = this.properties.hoverColor;
    var resolvedActive = this.properties.activeColor;
    var resolvedTextColor = this.properties.textColor;
    var ts = window.TokenRef;
    if (ts) {
      if (typeof resolvedColor === 'string') resolvedColor = ts.resolve(resolvedColor);
      if (typeof resolvedHover === 'string') resolvedHover = ts.resolve(resolvedHover);
      if (typeof resolvedActive === 'string') resolvedActive = ts.resolve(resolvedActive);
      if (typeof resolvedTextColor === 'string') resolvedTextColor = ts.resolve(resolvedTextColor);
    }

    var padding = PADDING_MAP[this.properties.padding] || PADDING_MAP.sm;

    this._lastOutput = this.buildOutput('interactive', {
      display: 'inline-block',
      padding: padding,
      background: resolvedColor,
      color: resolvedTextColor,
      borderRadius: this.properties.borderRadius + 'px',
      border: 'none',
      cursor: 'pointer',
      fontSize: this.properties.fontSize + 'px'
    }, {
      kind: 'button',
      text: this.properties.text,
      hover: { background: resolvedHover },
      active: { background: resolvedActive }
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（按钮样式预览）
   */
  ButtonNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 60;

    // 按钮预览背景区域
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // 按钮样式
    var padding = PADDING_MAP[this.properties.padding] || PADDING_MAP.sm;
    var paddingParts = padding.split(' ');
    var padY = parseInt(paddingParts[0], 10) || 8;
    var padX = paddingParts.length > 1 ? parseInt(paddingParts[1], 10) : parseInt(paddingParts[0], 10);

    var btnText = this.properties.text || '按钮';
    var fontSize = Math.min(this.properties.fontSize, 20);

    ctx.font = fontSize + 'px PingFang SC, sans-serif';
    var textMetrics = ctx.measureText(btnText);
    var textW = textMetrics.width;
    var textH = fontSize;

    // 按钮尺寸（预览区域内居中）
    var btnW = Math.min(textW + padX * 2, w - 20);
    var btnH = Math.min(textH + padY * 2, h - 12);
    var btnX = x + (w - btnW) / 2;
    var btnY = y + (h - btnH) / 2;

    // 绘制按钮背景
    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, Math.min(this.properties.borderRadius, btnW / 2, btnH / 2));
    ctx.fill();

    // 绘制按钮文字
    ctx.fillStyle = this.properties.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btnText, btnX + btnW / 2, btnY + btnH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // 底部属性标注
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var info = '圆角 ' + this.properties.borderRadius + 'px · ' +
               '填充 ' + this.properties.padding + ' · ' +
               '字号 ' + this.properties.fontSize + 'px';
    ctx.fillText(info, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/button', ButtonNode);

  console.log('[ButtonNode] 按钮节点已注册');
})();
