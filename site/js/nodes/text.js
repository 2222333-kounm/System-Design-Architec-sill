/* ========================================
   文字节点 — 多行文本
   输入: input | 输出: text
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[TextNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  文字节点定义
  // =====================

  function TextNode() {
    this.addInput('content in', 'any');
    this.addOutput('styled text →', 'text');

    this.properties = {
      content: '这是一段示例文字',
      fontFamily: 'PingFang SC, sans-serif',
      fontSize: 16,
      fontSizeUnit: 'px',
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0,
      color: '#1D1D1F',
      textAlign: 'left'
    };

    // 从 TokenStore 读取默认值
    var ts = window.TokenStore;
    if (ts) {
      var bodySz = ts.get('--font-size-body');
      if (bodySz) this.properties.fontSize = parseFloat(bodySz) || 16;
      var txCol = ts.get('--color-text-primary');
      if (txCol) this.properties.color = txCol;
    }

    var that = this;

    // 内容
    this.addWidget('text', '内容', this.properties.content, function(v) {
      that.properties.content = v;
      that._markDirty();
    });

    // 字体
    this.addWidget('combo', '字体', this.properties.fontFamily, function(v) {
      that.properties.fontFamily = v;
      that._markDirty();
    }, {
      values: [
        'PingFang SC, sans-serif',
        'SF Pro Display, sans-serif',
        'Inter, sans-serif',
        'Georgia, serif',
        'monospace'
      ]
    });

    // 字号
    this.addWidget('number', '字号', this.properties.fontSize, function(v) {
      that.properties.fontSize = v;
      that._markDirty();
    }, { min: 8, max: 120, step: 1 });

    // 字号单位
    this.addWidget('combo', '字号单位', this.properties.fontSizeUnit, function(v) {
      that.properties.fontSizeUnit = v;
      that._markDirty();
    }, { values: ['px', 'em', 'rem'] });

    // 字重
    this.addWidget('combo', '字重', this.properties.fontWeight, function(v) {
      that.properties.fontWeight = v;
      that._markDirty();
    }, {
      values: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
    });

    // 行高
    this.addWidget('number', '行高', this.properties.lineHeight, function(v) {
      that.properties.lineHeight = v;
      that._markDirty();
    }, { min: 0.5, max: 3, step: 0.1 });

    // 字距
    this.addWidget('number', '字距', this.properties.letterSpacing, function(v) {
      that.properties.letterSpacing = v;
      that._markDirty();
    }, { min: -10, max: 20, step: 0.5 });

    // 颜色
    this.addWidget('color', '颜色', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    // 对齐
    this.addWidget('combo', '对齐', this.properties.textAlign, function(v) {
      that.properties.textAlign = v;
      that._markDirty();
    }, { values: ['left', 'center', 'right'] });

    // 节点尺寸
    this.previewY = 200;
    this.size = [320, 400];
  }

  TextNode.title = '📝 文字';
  TextNode.desc = '多行文本 · 字体/字号/字重/行高/字距/颜色/对齐';

  TextNode.prototype = Object.create(NodeBase.prototype);
  TextNode.prototype.constructor = TextNode;

  /**
   * 节点执行 — 计算输出数据
   */
  TextNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了字符串内容，则同步更新
    if (input && typeof input === 'string') {
      this.properties.content = input;
    }

    // 解析 Token 引用（如 var(--color-text-primary)）
    var resolvedColor = this.properties.color;
    if (window.TokenRef && typeof resolvedColor === 'string') {
      resolvedColor = window.TokenRef.resolve(resolvedColor);
    }

    this._lastOutput = this.buildOutput('text', {
      fontFamily: this.properties.fontFamily,
      fontSize: this.properties.fontSize + this.properties.fontSizeUnit,
      fontWeight: this.properties.fontWeight,
      lineHeight: String(this.properties.lineHeight),
      letterSpacing: this.properties.letterSpacing + 'em',
      color: resolvedColor,
      textAlign: this.properties.textAlign
    }, {
      content: this.properties.content
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（文字预览区域）
   */
  TextNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;

    // 预览区域背景
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, 80, 6);
    ctx.fill();

    // 准备文字内容
    var content = this.properties.content || '(空)';
    var displayText = content.length > 60
      ? content.substring(0, 57) + '...'
      : content;

    // 计算绘制尺寸（预览最大 24px）
    var fontSize = Math.min(this.properties.fontSize, 24);
    ctx.font = this.properties.fontWeight + ' ' + fontSize + 'px ' + this.properties.fontFamily;
    ctx.fillStyle = this.properties.color;

    // 对齐
    var textX;
    var align = this.properties.textAlign;
    if (align === 'center') {
      ctx.textAlign = 'center';
      textX = this.size[0] / 2;
    } else if (align === 'right') {
      ctx.textAlign = 'right';
      textX = x + w - 10;
    } else {
      ctx.textAlign = 'left';
      textX = x + 10;
    }

    // 简单换行（最多 2 行）
    var lines = [];
    var lineH = fontSize * this.properties.lineHeight;
    var maxWidth = w - 20;
    var currentLine = '';

    for (var i = 0; i < displayText.length; i++) {
      var testLine = currentLine + displayText[i];
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = displayText[i];
        if (lines.length >= 2) break;
      } else {
        currentLine = testLine;
      }
    }
    if (lines.length < 2 && currentLine.length > 0) lines.push(currentLine);

    // 绘制每行文字
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], textX, y + 24 + j * lineH);
    }

    // 恢复左对齐
    ctx.textAlign = 'left';

    // 属性标注
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.properties.fontSize + 'px · ' + this.properties.fontWeight + ' · ' + this.properties.fontFamily.split(',')[0],
      this.size[0] / 2,
      y + 80 + 14
    );
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/text', TextNode);

  console.log('[TextNode] 文字节点已注册');
})();
