/* ========================================
   变换节点 — CSS 变换/不透明度/圆角/变换原点
   输入: input | 输出: css
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[Transform] NodeBase 未加载');
    return;
  }

  // =====================
  //  变换节点定义
  // =====================

  function TransformNode() {
    this.addInput('css in', 'css');
    this.addOutput('css →', 'css');

    this.properties = {
      scale: 1,
      rotation: 0,
      opacity: 100,
      borderRadius: 0,
      transformOrigin: 'center'
    };

    var that = this;

    // 缩放
    this.addWidget('number', '缩放', this.properties.scale, function(v) {
      that.properties.scale = v;
      that._markDirty();
    }, { min: 0.1, max: 5, step: 0.1 });

    // 旋转
    this.addWidget('number', '旋转', this.properties.rotation, function(v) {
      that.properties.rotation = v;
      that._markDirty();
    }, { min: -360, max: 360, step: 1 });

    // 不透明度
    this.addWidget('slider', '不透明度', this.properties.opacity, function(v) {
      that.properties.opacity = v;
      that._markDirty();
    }, { min: 0, max: 100 });

    // 圆角
    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v;
      that._markDirty();
    }, { min: 0, max: 9999, step: 1 });

    // 变换原点（下拉列表）
    this.addWidget('combo', '变换原点', this.properties.transformOrigin, function(v) {
      that.properties.transformOrigin = v;
      that._markDirty();
    }, {
      values: ['center', 'top left', 'top right', 'bottom left', 'bottom right', 'custom']
    });

    // 节点尺寸
    this.previewY = 200;
    this.size = [320, 280];
  }

  TransformNode.title = '🔄 变换';
  TransformNode.desc = 'CSS 变换 · 缩放/旋转/不透明度/圆角/变换原点';

  TransformNode.prototype = Object.create(NodeBase.prototype);
  TransformNode.prototype.constructor = TransformNode;

  /**
   * 节点执行 — 计算输出 CSS 数据
   */
  TransformNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    var scale = this.properties.scale;
    var rotation = this.properties.rotation;
    var opacityVal = this.properties.opacity / 100;
    var borderRadius = this.properties.borderRadius;
    var transformOrigin = this.properties.transformOrigin;

    var transformStr = 'scale(' + scale + ') rotate(' + rotation + 'deg)';

    var cssOutput = {
      transform: transformStr,
      opacity: String(opacityVal),
      borderRadius: borderRadius + 'px',
      transformOrigin: transformOrigin
    };

    // 如果上游有 CSS 数据，合并（当前变换属性覆盖上游同名属性）
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
      this._lastOutput = this.buildOutput('css', merged);
    } else {
      this._lastOutput = this.buildOutput('css', cssOutput);
    }

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览 — 缩放/旋转后的方形预览
   */
  TransformNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var cx = this.size[0] / 2;
    var cy = this.previewY + 30;

    // 基准尺寸
    var baseSize = 50;
    var scale = this.properties.scale;
    var rotation = this.properties.rotation;
    var opacity = this.properties.opacity / 100;

    // 根据缩放调整绘制尺寸，限制最大 120px 以免溢出
    var drawSize = Math.min(baseSize * scale, 120);

    // 保存画布状态
    ctx.save();

    // 移动到预览中心
    ctx.translate(cx, cy);

    // 应用旋转
    ctx.rotate(rotation * Math.PI / 180);

    // 应用不透明度
    ctx.globalAlpha = opacity;

    // 绘制变换后的方形
    var half = drawSize / 2;
    ctx.fillStyle = '#8B5CF6';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(-half, -half, drawSize, drawSize, Math.min(this.properties.borderRadius, drawSize / 2));
    ctx.fill();

    // 恢复画布状态（清除阴影/变换）
    ctx.restore();

    // 信息文字
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      '缩放 ' + scale.toFixed(1) + ' · 旋转 ' + rotation + '° · 不透明度 ' + this.properties.opacity + '%',
      this.size[0] / 2,
      this.previewY + 80
    );
    ctx.fillText(
      '圆角 ' + this.properties.borderRadius + ' · 原点 ' + this.properties.transformOrigin,
      this.size[0] / 2,
      this.previewY + 94
    );
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/transform', TransformNode);

  console.log('[Transform] 变换节点已注册');
})();
