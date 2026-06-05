/* ========================================
   阴影节点 — 投影/内阴影 · 偏移/模糊/扩散/颜色
   输入: input | 输出: css
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[ShadowNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  阴影类型映射
  // =====================

  var SHADOW_TYPE_MAP = {
    '投影': 'outer',
    '内阴影': 'inner'
  };

  // =====================
  //  阴影节点定义
  // =====================

  function ShadowNode() {
    this.addInput('css in', 'css');
    this.addOutput('css →', 'css');

    this.properties = {
      shadowType: '投影',
      offsetX: 0,
      offsetY: 4,
      blur: 10,
      spread: 0,
      color: 'rgba(0,0,0,0.15)'
    };

    var that = this;

    // 阴影类型
    this.addWidget('combo', '类型', this.properties.shadowType, function(v) {
      that.properties.shadowType = v;
      that._markDirty();
    }, { values: ['投影', '内阴影'] });

    // 水平偏移
    this.addWidget('number', '偏移 X', this.properties.offsetX, function(v) {
      that.properties.offsetX = v;
      that._markDirty();
    }, { min: -50, max: 50, step: 1 });

    // 垂直偏移
    this.addWidget('number', '偏移 Y', this.properties.offsetY, function(v) {
      that.properties.offsetY = v;
      that._markDirty();
    }, { min: -50, max: 50, step: 1 });

    // 模糊
    this.addWidget('number', '模糊', this.properties.blur, function(v) {
      that.properties.blur = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    // 扩散
    this.addWidget('number', '扩散', this.properties.spread, function(v) {
      that.properties.spread = v;
      that._markDirty();
    }, { min: 0, max: 50, step: 1 });

    // 颜色
    this.addWidget('color', '颜色', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    // 节点尺寸
    this.previewY = 210;
    this.size = [320, 300];
  }

  ShadowNode.title = '💡 阴影';
  ShadowNode.desc = '投影/内阴影 · 偏移X/Y · 模糊 · 扩散 · 颜色';

  ShadowNode.prototype = Object.create(NodeBase.prototype);
  ShadowNode.prototype.constructor = ShadowNode;

  /**
   * 构建阴影 CSS 字符串
   */
  ShadowNode.prototype._buildShadowCSS = function() {
    var shadowType = this.properties.shadowType;
    var offsetX = this.properties.offsetX;
    var offsetY = this.properties.offsetY;
    var blur = this.properties.blur;
    var spread = this.properties.spread;
    var color = this.properties.color;

    if (shadowType === '内阴影') {
      return 'inset ' + offsetX + 'px ' + offsetY + 'px ' + blur + 'px ' + spread + 'px ' + color;
    }

    return offsetX + 'px ' + offsetY + 'px ' + blur + 'px ' + spread + 'px ' + color;
  };

  /**
   * 节点执行 — 计算输出 CSS 数据
   */
  ShadowNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    var shadowType = this.properties.shadowType;
    var offsetX = this.properties.offsetX;
    var offsetY = this.properties.offsetY;
    var blur = this.properties.blur;
    var spread = this.properties.spread;
    var color = this.properties.color;

    var shadowStr = this._buildShadowCSS();

    var cssOutput = {
      boxShadow: shadowStr
    };

    var extra = {
      type: SHADOW_TYPE_MAP[shadowType] || 'outer',
      offsetX: offsetX,
      offsetY: offsetY,
      blur: blur,
      spread: spread,
      color: color
    };

    // 如果上游有 CSS 数据，合并（当前阴影属性覆盖上游同名属性）
    if (input && input.css) {
      var merged = {};
      for (var key in input.css) {
        if (input.css.hasOwnProperty(key)) {
          merged[key] = input.css[key];
        }
      }
      for (var key in cssOutput) {
        if (cssOutput.hasOwnProperty(key)) {
          merged[key] = cssOutput[key];
        }
      }

      // 合并上游额外信息
      if (input.extra) {
        for (var ek in input.extra) {
          if (input.extra.hasOwnProperty(ek) && extra[ek] === undefined) {
            extra[ek] = input.extra[ek];
          }
        }
      }

      this._lastOutput = this.buildOutput('css', merged, extra);
    } else {
      this._lastOutput = this.buildOutput('css', cssOutput, extra);
    }

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览 — 带阴影的方框可视化
   */
  ShadowNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var cx = this.size[0] / 2;
    var cy = this.previewY + 30;

    var offsetX = this.properties.offsetX;
    var offsetY = this.properties.offsetY;
    var blur = this.properties.blur;
    var spread = this.properties.spread;
    var color = this.properties.color;
    var shadowType = this.properties.shadowType;

    // 预览方块尺寸
    var boxW = 140;
    var boxH = 50;
    var bx = cx - boxW / 2;
    var by = cy - boxH / 2;

    // -- 绘制带阴影的方框 --

    // 限制模糊值在预览中合理显示（最大 30px 避免过于发散）
    var previewBlur = Math.min(blur, 30);
    // 限制扩散在预览中合理显示
    var previewSpread = Math.min(spread, 20);

    if (shadowType === '投影') {
      // 投影：先画阴影，再画方框在之上
      ctx.save();

      // 阴影区域（带模糊的偏移矩形）
      ctx.shadowColor = color;
      ctx.shadowBlur = previewBlur;
      ctx.shadowOffsetX = Math.min(Math.max(offsetX, -30), 30);
      ctx.shadowOffsetY = Math.min(Math.max(offsetY, -30), 30);

      // 如果有扩散，用更大的矩形模拟扩散效果
      var spreadOffset = previewSpread;
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.roundRect(bx - spreadOffset, by - spreadOffset, boxW + spreadOffset * 2, boxH + spreadOffset * 2, 6);
      ctx.fill();

      ctx.restore();

      // 再绘制方框本身（覆盖在阴影之上，但 Canvas shadow 只在下层起效）
      ctx.fillStyle = '#4B5563';
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 6);
      ctx.fill();

    } else {
      // 内阴影：绘制方框，然后在内侧叠加半透明阴影效果
      ctx.save();
      ctx.fillStyle = '#4B5563';
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 6);
      ctx.fill();
      ctx.restore();

      // 内阴影效果：用裁剪区域 + 渐变模拟
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 6);
      ctx.clip();

      // 内阴影模拟：从边缘向内的半透明渐变
      var insetGrad = ctx.createRadialGradient(
        cx - Math.min(Math.max(offsetX, -30), 30),
        cy - Math.min(Math.max(offsetY, -30), 30),
        0,
        cx,
        cy,
        boxW / 2 + boxH / 2
      );
      insetGrad.addColorStop(0, 'rgba(0,0,0,0)');
      insetGrad.addColorStop(0.6, 'rgba(0,0,0,0)');
      // 解析颜色并叠加内阴影
      var insetDark = 'rgba(0,0,0,' + Math.min(0.5, previewBlur / 30 * 0.5) + ')';
      insetGrad.addColorStop(0.85, insetDark);
      insetGrad.addColorStop(1, insetDark);

      ctx.fillStyle = insetGrad;
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.restore();

      // 方框边框（表现边缘）
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 6);
      ctx.stroke();
    }

    // -- 底部信息文字 --
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    var info = shadowType + ' · ' +
      'X:' + offsetX + ' Y:' + offsetY + ' ' +
      '模糊:' + blur + ' 扩散:' + spread + ' ' +
      color;

    ctx.fillText(info, cx, cy + boxH / 2 + 22);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/shadow', ShadowNode);

  console.log('[ShadowNode] 阴影节点已注册');
})();
