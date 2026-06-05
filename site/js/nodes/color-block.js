/* ========================================
   色块节点 — 纯色/渐变背景
   输入: color | 输出: color-block
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[ColorBlock] NodeBase 未加载');
    return;
  }

  // =====================
  //  色块节点定义
  // =====================

  function ColorBlockNode() {
    this.addInput('color in', 'color');
    this.addOutput('color →', 'color');

    this.properties = {
      color: '#3B82F6',
      width: 320,
      widthUnit: 'px',
      height: 120,
      heightUnit: 'px',
      borderRadius: 12,
      opacity: 100
    };

    // 从 TokenStore 读取默认主色
    var ts = window.TokenStore;
    if (ts) {
      var primary = ts.get('--color-primary-500');
      if (primary) this.properties.color = primary;
    }

    var that = this;

    // 色值控件
    this.addWidget('color', '色值', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    // 宽度
    this.addWidget('number', '宽度', this.properties.width, function(v) {
      that.properties.width = v;
      that._markDirty();
    }, { min: 40, max: 800, step: 1 });

    // 宽度单位
    this.addWidget('combo', '宽度单位', this.properties.widthUnit, function(v) {
      that.properties.widthUnit = v;
      that._markDirty();
    }, { values: ['px', '%', 'vw'] });

    // 高度
    this.addWidget('number', '高度', this.properties.height, function(v) {
      that.properties.height = v;
      that._markDirty();
    }, { min: 20, max: 600, step: 1 });

    // 高度单位
    this.addWidget('combo', '高度单位', this.properties.heightUnit, function(v) {
      that.properties.heightUnit = v;
      that._markDirty();
    }, { values: ['px', '%', 'vh'] });

    // 圆角
    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v;
      that._markDirty();
    }, { min: 0, max: 9999, step: 1 });

    // 不透明度
    this.addWidget('slider', '不透明度', this.properties.opacity, function(v) {
      that.properties.opacity = v;
      that._markDirty();
    }, { min: 0, max: 100 });

    // 节点尺寸
    this.previewY = 180;
    this.size = [320, 260];
  }

  ColorBlockNode.title = '🎨 色块';
  ColorBlockNode.desc = '纯色色块 · 色值/宽高/圆角/不透明度';

  ColorBlockNode.prototype = Object.create(NodeBase.prototype);
  ColorBlockNode.prototype.constructor = ColorBlockNode;

  /**
   * 节点执行 — 计算输出数据
   */
  ColorBlockNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了颜色值，则同步更新
    if (input && input.color) {
      this.properties.color = input.color;
    }

    var opacityVal = this.properties.opacity / 100;

    this._lastOutput = this.buildOutput('color', {
      background: this.properties.color,
      width: this.properties.width + this.properties.widthUnit,
      height: this.properties.height + this.properties.heightUnit,
      'border-radius': this.properties.borderRadius + 'px',
      opacity: String(opacityVal)
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（缩略色块）
   */
  ColorBlockNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 50;

    // 绘制色块
    ctx.globalAlpha = this.properties.opacity / 100;
    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(8, w / 2, h / 2));
    ctx.fill();
    ctx.globalAlpha = 1;

    // 标注文字
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.properties.color + ' · ' + this.properties.width + '×' + this.properties.height + ' · 圆角 ' + this.properties.borderRadius,
      this.size[0] / 2,
      y + h + 16
    );
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/color-block', ColorBlockNode);

  console.log('[ColorBlock] 色块节点已注册');
})();
