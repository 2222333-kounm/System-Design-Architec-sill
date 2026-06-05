/* ========================================
   鼠标跟随节点 — 鼠标移动交互效果
   输入: input(css) | 输出: interactive
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[MouseFollowNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  效果名称映射（预览用）
  // =====================

  var EFFECT_LABELS = {
    '视差': 'Parallax',
    '发光': 'Glow',
    '3D倾斜': '3D Tilt'
  };

  // =====================
  //  鼠标跟随节点定义
  // =====================

  function MouseFollowNode() {
    this.addInput('input', 'css');
    this.addOutput('interactive', 'interactive');

    this.properties = {
      effect: '视差',
      strength: 0.3,
      range: 200,
      easing: 'ease-out'
    };

    var that = this;

    // 效果类型
    this.addWidget('combo', '效果', this.properties.effect, function(v) {
      that.properties.effect = v;
      that._markDirty();
    }, {
      values: ['视差', '发光', '3D倾斜']
    });

    // 强度
    this.addWidget('slider', '强度', this.properties.strength, function(v) {
      that.properties.strength = v;
      that._markDirty();
    }, { min: 0, max: 1, step: 0.05 });

    // 响应范围
    this.addWidget('number', '范围', this.properties.range, function(v) {
      that.properties.range = v;
      that._markDirty();
    }, { min: 50, max: 500, step: 10 });

    // 缓动
    this.addWidget('combo', '缓动', this.properties.easing, function(v) {
      that.properties.easing = v;
      that._markDirty();
    }, {
      values: ['ease-out', 'linear', 'ease-in', 'ease-in-out']
    });

    // 节点尺寸
    this.previewY = 120;
    this.size = [320, 240];
  }

  MouseFollowNode.title = '\u{1F5B2}️ 鼠标跟随';
  MouseFollowNode.desc = '鼠标交互效果 · 视差/发光/3D倾斜 · 强度/范围/缓动';

  MouseFollowNode.prototype = Object.create(NodeBase.prototype);
  MouseFollowNode.prototype.constructor = MouseFollowNode;

  /**
   * 节点执行 — 计算输出数据
   */
  MouseFollowNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了 CSS，进行合并
    var baseCss = {};

    if (input && input.css) {
      for (var key in input.css) {
        if (input.css.hasOwnProperty(key)) {
          baseCss[key] = input.css[key];
        }
      }
    }

    // 基础样式 — 通过 CSS will-change 和 transform-style 启用 GPU 加速
    baseCss.transition = 'transform ' + this.properties.easing;
    baseCss.willChange = 'transform';
    baseCss.transformStyle = 'preserve-3d';
    baseCss.perspective = '1000px';

    this._lastOutput = this.buildOutput('interactive', baseCss, {
      kind: 'mouse-follow',
      effect: this.properties.effect,
      strength: this.properties.strength,
      range: this.properties.range,
      easing: this.properties.easing
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（效果示意 + 鼠标光标）
   */
  MouseFollowNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 90;

    // 预览背景区域
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // 绘制效果预览卡片（中心区域）
    var cx = this.size[0] / 2;
    var cy = y + h / 2;

    // 根据效果选择对应的颜色/表现
    var effectColor, effectLabel;
    switch (this.properties.effect) {
      case '发光':
        effectColor = '#FF9500';
        effectLabel = 'Glow';
        break;
      case '3D倾斜':
        effectColor = '#007AFF';
        effectLabel = '3D Tilt';
        break;
      default: // 视差
        effectColor = '#34C759';
        effectLabel = 'Parallax';
        break;
    }

    // 绘制一个带效果色的圆角方块（示意目标元素）
    var boxSize = 40;
    var boxX = cx - boxSize / 2;
    var boxY = cy - boxSize / 2;

    ctx.save();

    // 如果强度 > 0，绘制发光/视差效果示意
    if (this.properties.strength > 0) {
      if (this.properties.effect === '发光') {
        // 绘制发光光晕
        var glowRadius = 20 + this.properties.strength * 25;
        var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        glow.addColorStop(0, 'rgba(255, 149, 0, 0.3)');
        glow.addColorStop(1, 'rgba(255, 149, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.properties.effect === '3D倾斜') {
        // 绘制 3D 倾斜示意线框
        ctx.strokeStyle = 'rgba(0, 122, 255, 0.15)';
        ctx.lineWidth = 1;
        for (var i = 0; i < 3; i++) {
          var offset = (i + 1) * 12 * this.properties.strength;
          ctx.beginPath();
          ctx.roundRect(boxX - offset * 0.3, boxY + offset * 0.15, boxSize, boxSize, 4);
          ctx.stroke();
        }
      } else {
        // 视差 — 绘制偏移指示箭头
        var arrowLen = 10 + this.properties.strength * 20;
        ctx.strokeStyle = 'rgba(52, 199, 89, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + 28, cy - 5);
        ctx.lineTo(cx + 28 + arrowLen, cy - 5);
        ctx.lineTo(cx + 28 + arrowLen - 5, cy - 10);
        ctx.moveTo(cx + 28 + arrowLen, cy - 5);
        ctx.lineTo(cx + 28 + arrowLen - 5, cy);
        ctx.stroke();
      }
    }

    // 绘制主方块（带效果色）
    ctx.fillStyle = effectColor;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 6);
    ctx.fill();

    // 在方块上绘制效果文字标签
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(effectLabel, cx, cy);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.restore();

    // 绘制鼠标光标指示器（右上角）
    var cursorX = x + w - 32;
    var cursorY = y + 14;

    ctx.save();
    ctx.translate(cursorX, cursorY);

    // 鼠标光标形状（简化版箭头）
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, 0);
    ctx.lineTo(10, 4);
    ctx.lineTo(14, 8);
    ctx.lineTo(10, 8);
    ctx.lineTo(6, 4);
    ctx.lineTo(0, 10);
    ctx.closePath();
    ctx.fill();

    // 小圆点（指示运动方向）
    ctx.fillStyle = effectColor;
    ctx.beginPath();
    ctx.arc(12 + this.properties.strength * 8, -4 - this.properties.strength * 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 底部属性标注
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var info = this.properties.effect + ' · ' +
               '强度 ' + this.properties.strength.toFixed(2) + ' · ' +
               '范围 ' + this.properties.range + 'px · ' +
               this.properties.easing;
    ctx.fillText(info, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/mouse-follow', MouseFollowNode);

  console.log('[MouseFollowNode] 鼠标跟随节点已注册');
})();
