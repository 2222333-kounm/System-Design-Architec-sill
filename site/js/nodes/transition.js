/* ========================================
   转场节点 — 交互转场动画（hover/click）
   输入: input(css) | 输出: interactive
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[TransitionNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  转场类型对应英文标签（预览用）
  // =====================

  var TRANSFORM_LABELS = {
    '缩放': 'Scale',
    '位移': 'Translate',
    '淡入': 'Fade',
    '旋转': 'Rotate'
  };

  // =====================
  //  转场节点定义
  // =====================

  function TransitionNode() {
    this.addInput('input', 'css');
    this.addOutput('interactive', 'interactive');

    this.properties = {
      trigger: 'hover',
      transformType: '缩放',
      targetValue: 1.2,
      duration: 0.3,
      delay: 0,
      easing: 'ease-out'
    };

    var that = this;

    // 触发方式
    this.addWidget('combo', '触发', this.properties.trigger, function(v) {
      that.properties.trigger = v;
      that._markDirty();
    }, {
      values: ['hover', 'click']
    });

    // 变换类型
    this.addWidget('combo', '变换类型', this.properties.transformType, function(v) {
      that.properties.transformType = v;
      that._markDirty();
    }, {
      values: ['缩放', '位移', '淡入', '旋转']
    });

    // 目标值
    this.addWidget('number', '目标值', this.properties.targetValue, function(v) {
      that.properties.targetValue = v;
      that._markDirty();
    }, { min: 0.1, max: 5, step: 0.1 });

    // 持续时间
    this.addWidget('number', '时长', this.properties.duration, function(v) {
      that.properties.duration = v;
      that._markDirty();
    }, { min: 0.1, max: 5, step: 0.1 });

    // 延迟
    this.addWidget('number', '延迟', this.properties.delay, function(v) {
      that.properties.delay = v;
      that._markDirty();
    }, { min: 0, max: 5, step: 0.1 });

    // 缓动
    this.addWidget('combo', '缓动', this.properties.easing, function(v) {
      that.properties.easing = v;
      that._markDirty();
    }, {
      values: ['ease-out', 'ease-in', 'ease-in-out', 'linear', 'cubic-bezier(0.25,0.1,0.25,1)']
    });

    // 节点尺寸
    this.previewY = 205;
    this.size = [320, 300];
  }

  TransitionNode.title = '✨ 转场';
  TransitionNode.desc = '交互转场动画 · hover/click触发 · 缩放/位移/淡入/旋转';

  TransitionNode.prototype = Object.create(NodeBase.prototype);
  TransitionNode.prototype.constructor = TransitionNode;

  /**
   * 节点执行 — 计算输出数据
   */
  TransitionNode.prototype.onExecute = function() {
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

    // 构建 transition CSS 属性
    var transitionValue = 'all ' + this.properties.duration.toFixed(1) + 's ' + this.properties.easing;
    if (this.properties.delay > 0) {
      transitionValue += ' ' + this.properties.delay.toFixed(1) + 's';
    }
    baseCss.transition = transitionValue;

    this._lastOutput = this.buildOutput('interactive', baseCss, {
      kind: 'transition',
      trigger: this.properties.trigger,
      transformType: this.properties.transformType,
      targetValue: this.properties.targetValue,
      duration: this.properties.duration,
      delay: this.properties.delay,
      easing: this.properties.easing
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览 — 转场前/后双状态示意 + 箭头
   */
  TransitionNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 70;

    // 预览背景区域
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    var cx = this.size[0] / 2;
    var cy = y + h / 2;

    var transformType = this.properties.transformType;
    var targetValue = this.properties.targetValue;
    var boxSize = 28;

    // 左侧：变换前（默认状态）
    var leftX = cx - 70 - boxSize / 2;
    var leftY = cy - boxSize / 2;

    ctx.save();

    // 左侧方块 — 默认状态
    ctx.fillStyle = '#8B5CF6';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.roundRect(leftX, leftY, boxSize, boxSize, 4);
    ctx.fill();

    // 右侧：变换后（触发状态）
    var rightX = cx + 70 - boxSize / 2;
    var rightY = cy - boxSize / 2;

    // 根据变换类型绘制右侧方块
    ctx.fillStyle = '#8B5CF6';
    ctx.globalAlpha = 1;

    // 应用变换效果示意
    ctx.save();
    ctx.translate(rightX + boxSize / 2, rightY + boxSize / 2);

    switch (transformType) {
      case '缩放':
        // 按 targetValue 缩放
        var s = Math.min(Math.max(targetValue, 0.3), 2.5);
        ctx.scale(s, s);
        break;
      case '位移':
        // 向右下位移
        var offset = Math.min(targetValue * 8, 30);
        ctx.translate(offset, offset * 0.5);
        break;
      case '淡入':
        // 不绘制右侧方块（透明），改为绘制虚线轮廓
        ctx.restore();
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.roundRect(rightX, rightY, boxSize, boxSize, 4);
        ctx.stroke();
        // 同时绘制半透明实心（表示半透明状态）
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#8B5CF6';
        ctx.beginPath();
        ctx.roundRect(rightX, rightY, boxSize, boxSize, 4);
        ctx.fill();
        ctx.restore();
        // 跳过后面的方块绘制
        ctx.save();
        ctx.globalAlpha = 0;
        break;
      case '旋转':
        var angle = Math.min(targetValue * 30, 180);
        ctx.rotate(angle * Math.PI / 180);
        break;
    }

    // 绘制变换后的方块
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, 4);
    ctx.fill();

    // 在方块上显示变换类型标签首字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var label = TRANSFORM_LABELS[transformType] || transformType;
    ctx.fillText(label.charAt(0), 0, 0);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.restore();

    // 绘制中间的箭头（->）
    ctx.save();
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy);
    ctx.lineTo(cx + 30, cy);
    ctx.moveTo(cx + 25, cy - 5);
    ctx.lineTo(cx + 30, cy);
    ctx.lineTo(cx + 25, cy + 5);
    ctx.stroke();

    // 在箭头上方标注触发方式
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    var triggerLabel = this.properties.trigger === 'hover' ? 'Hover' : 'Click';
    ctx.fillText(triggerLabel, cx, cy - 14);
    ctx.textAlign = 'left';

    ctx.restore();

    // 底部参数信息
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var info = TRANSFORM_LABELS[transformType] + ' ' + targetValue.toFixed(1) +
               ' · ' + this.properties.duration.toFixed(1) + 's' +
               ' · delay ' + this.properties.delay.toFixed(1) + 's' +
               ' · ' + this.properties.easing;
    ctx.fillText(info, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/transition', TransitionNode);

  console.log('[TransitionNode] 转场节点已注册');
})();
