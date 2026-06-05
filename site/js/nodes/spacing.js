/* ========================================
   间距节点 — Padding / Margin
   输入: css | 输出: css
   支持 uniform(统一) / individual(独立) 两种控制模式
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[Spacing] NodeBase 未加载');
    return;
  }

  // =====================
  //  间距节点定义
  // =====================

  function SpacingNode() {
    this.addInput('css in', 'css');
    this.addOutput('css →', 'css');

    this.properties = {
      // 类型: padding / margin
      mode: 'padding',
      // 控制: uniform / individual
      control: 'uniform',
      // 统一值（control=uniform 时生效）
      uniformValue: 16,
      // 独立方向值（control=individual 时生效）
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      // 单位
      unit: 'px'
    };

    var that = this;

    // ==================================
    //  控件
    // ==================================

    // 类型: padding / margin
    this.addWidget('combo', '类型', this.properties.mode, function(v) {
      that.properties.mode = v;
      that._markDirty();
    }, { values: ['padding', 'margin'] });

    // 控制: uniform / individual
    this.addWidget('combo', '控制', this.properties.control, function(v) {
      that.properties.control = v;
      that._markDirty();
    }, { values: ['uniform', 'individual'] });

    // 统一值（仅 control=uniform 时生效）
    this.addWidget('number', '统一值', this.properties.uniformValue, function(v) {
      that.properties.uniformValue = v;
      that._markDirty();
    }, { min: 0, max: 200, step: 1 });

    // 独立方向值（仅 control=individual 时生效）
    this.addWidget('number', '上', this.properties.paddingTop, function(v) {
      that.properties.paddingTop = v;
      that._markDirty();
    }, { min: 0, max: 200, step: 1 });

    this.addWidget('number', '右', this.properties.paddingRight, function(v) {
      that.properties.paddingRight = v;
      that._markDirty();
    }, { min: 0, max: 200, step: 1 });

    this.addWidget('number', '下', this.properties.paddingBottom, function(v) {
      that.properties.paddingBottom = v;
      that._markDirty();
    }, { min: 0, max: 200, step: 1 });

    this.addWidget('number', '左', this.properties.paddingLeft, function(v) {
      that.properties.paddingLeft = v;
      that._markDirty();
    }, { min: 0, max: 200, step: 1 });

    // 单位
    this.addWidget('combo', '单位', this.properties.unit, function(v) {
      that.properties.unit = v;
      that._markDirty();
    }, { values: ['px', 'em', '%'] });

    // 节点尺寸
    this.previewY = 230;
    this.size = [320, 280];
  }

  SpacingNode.title = '↔ 间距';
  SpacingNode.desc = '内边距/外边距 · 统一/独立 · px/em/%';

  SpacingNode.prototype = Object.create(NodeBase.prototype);
  SpacingNode.prototype.constructor = SpacingNode;

  // =====================
  //  onExecute — 生成输出
  // =====================

  SpacingNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    var p = this.properties;
    var css = {};
    var extra = {};

    var prefix = p.mode; // 'padding' or 'margin'
    var suffix = p.unit;

    if (p.control === 'uniform') {
      // --- 统一模式 ---
      var v = p.uniformValue;
      css[prefix] = v + suffix;
      extra = {
        mode: p.mode,
        control: 'uniform',
        values: { top: v, right: v, bottom: v, left: v },
        unit: p.unit
      };
    } else {
      // --- 独立模式 ---
      var vt = p.paddingTop;
      var vr = p.paddingRight;
      var vb = p.paddingBottom;
      var vl = p.paddingLeft;

      css[prefix + 'Top'] = vt + suffix;
      css[prefix + 'Right'] = vr + suffix;
      css[prefix + 'Bottom'] = vb + suffix;
      css[prefix + 'Left'] = vl + suffix;

      extra = {
        mode: p.mode,
        control: 'individual',
        values: { top: vt, right: vr, bottom: vb, left: vl },
        unit: p.unit
      };
    }

    // 合并上游额外信息
    if (input && input.extra) {
      for (var k in input.extra) {
        if (input.extra.hasOwnProperty(k) && extra[k] === undefined) {
          extra[k] = input.extra[k];
        }
      }
    }

    this._lastOutput = this.buildOutput('css', css, extra);
    this.setOutputData(0, this._lastOutput);
  };

  // =====================
  //  onDrawBackground — 间距示意图
  // =====================

  SpacingNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var p = this.properties;
    var x = 10;
    var y = this.previewY + 2;
    var w = this.size[0] - 20;
    var h = this.size[1] - y - 8;

    if (h < 16) return;

    // 获取当前间距值
    var top, right, bottom, left;
    if (p.control === 'uniform') {
      top = right = bottom = left = p.uniformValue;
    } else {
      top = p.paddingTop;
      right = p.paddingRight;
      bottom = p.paddingBottom;
      left = p.paddingLeft;
    }

    // 颜色：padding 用蓝色系，margin 用绿色系
    var outerColor = p.mode === 'padding'
      ? { bg: 'rgba(59, 130, 246, 0.10)', border: 'rgba(59, 130, 246, 0.30)', label: '#60A5FA' }
      : { bg: 'rgba(52, 211, 153, 0.10)', border: 'rgba(52, 211, 153, 0.30)', label: '#34D399' };

    // 外框（间距区域）
    var outerX = x;
    var outerY = y;
    var outerW = w;
    var outerH = h;
    var innerPad = 10;

    ctx.fillStyle = outerColor.bg;
    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, 4);
    ctx.fill();
    ctx.strokeStyle = outerColor.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, 4);
    ctx.stroke();

    // 内容框（按比例缩小的内部区域）
    var hasSpacing = (top + right + bottom + left) > 0;
    var innerLeft, innerTop, innerRight, innerBottom;

    if (hasSpacing) {
      // 根据实际间距值按比例分配空间
      var total = top + right + bottom + left;
      var ratioW = (left + right) / Math.max(total, 1);
      var ratioH = (top + bottom) / Math.max(total, 1);
      // 内容区至少占 20%，最多占 70%
      var contentRatioW = Math.max(0.2, Math.min(0.7, 1 - ratioW * 0.6));
      var contentRatioH = Math.max(0.2, Math.min(0.7, 1 - ratioH * 0.6));
      var contentRatio = Math.min(contentRatioW, contentRatioH);

      innerLeft = outerX + outerW * (1 - contentRatio) * (left / Math.max(left + right, 1));
      innerTop = outerY + outerH * (1 - contentRatio) * (top / Math.max(top + bottom, 1));
      innerRight = outerX + outerW - outerW * (1 - contentRatio) * (right / Math.max(left + right, 1));
      innerBottom = outerY + outerH - outerH * (1 - contentRatio) * (bottom / Math.max(top + bottom, 1));
    } else {
      innerLeft = outerX + innerPad;
      innerTop = outerY + innerPad;
      innerRight = outerX + outerW - innerPad;
      innerBottom = outerY + outerH - innerPad;
    }

    var innerW = Math.max(innerRight - innerLeft, 4);
    var innerH2 = Math.max(innerBottom - innerTop, 4);

    // 内容框
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(innerLeft, innerTop, innerW, innerH2, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(innerLeft, innerTop, innerW, innerH2, 3);
    ctx.stroke();

    // content 文字居中
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('content', (innerLeft + innerW / 2), (innerTop + innerH2 / 2));

    // 在间距区域标注数值
    if (hasSpacing && h > 25) {
      ctx.fillStyle = outerColor.label;
      ctx.font = '8px monospace';
      ctx.textBaseline = 'middle';

      // 上方标注
      if (top > 0 && (innerTop - outerY) > 10) {
        ctx.fillText(top + p.unit, outerX + outerW / 2, outerY + (innerTop - outerY) / 2);
      }
      // 下方标注
      if (bottom > 0 && (outerY + outerH - innerBottom) > 10) {
        ctx.fillText(bottom + p.unit, outerX + outerW / 2, innerBottom + (outerY + outerH - innerBottom) / 2);
      }
      // 左侧标注
      if (left > 0 && (innerLeft - outerX) > 14) {
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(outerX + (innerLeft - outerX) / 2, outerY + outerH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(left + p.unit, 0, 0);
        ctx.restore();
      }
      // 右侧标注
      if (right > 0 && (outerX + outerW - innerRight) > 14) {
        ctx.save();
        ctx.translate(innerRight + (outerX + outerW - innerRight) / 2, outerY + outerH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(right + p.unit, 0, 0);
        ctx.restore();
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  // =====================
  //  注册节点类型
  // =====================

  LiteGraph.registerNodeType('sill/spacing', SpacingNode);

  console.log('[Spacing] 间距节点已注册');
})();
