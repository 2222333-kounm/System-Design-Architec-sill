/* ========================================
   蒙版节点 — 矩形/圆形/渐变蒙版
   输入: input | 输出: masked
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[MaskNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  蒙版节点定义
  // =====================

  function MaskNode() {
    this.addInput('img in', 'image');
    this.addOutput('masked →', 'image');

    this.properties = {
      shape: '矩形',
      feather: 0,
      invert: false,
      borderRadius: 0
    };

    var that = this;

    // 形状
    this.addWidget('combo', '形状', this.properties.shape, function(v) {
      that.properties.shape = v;
      that._markDirty();
    }, { values: ['矩形', '圆形', '渐变'] });

    // 羽化 (模糊过渡范围)
    this.addWidget('number', '羽化', this.properties.feather, function(v) {
      that.properties.feather = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    // 反转
    this.addWidget('toggle', '反转', this.properties.invert, function(v) {
      that.properties.invert = v;
      that._markDirty();
    });

    // 圆角 (仅矩形适用)
    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    // 节点尺寸
    this.previewY = 200;
    this.size = [320, 240];
  }

  MaskNode.title = '🎭 蒙版';
  MaskNode.desc = '矩形/圆形/渐变蒙版 · 羽化/反转/圆角';

  MaskNode.prototype = Object.create(NodeBase.prototype);
  MaskNode.prototype.constructor = MaskNode;

  /**
   * 生成蒙版 CSS
   */
  MaskNode.prototype._buildMaskCSS = function() {
    var shape = this.properties.shape;
    var borderRadius = this.properties.borderRadius;
    var feather = this.properties.feather;
    var invert = this.properties.invert;
    var css = {};

    if (shape === '矩形') {
      if (!invert) {
        // 正向：clip-path 裁剪到圆角矩形
        css.clipPath = 'inset(0 round ' + borderRadius + 'px)';
      }
      // 反向矩形：不输出简单 clip-path，renderer 通过 extra.invert 处理

    } else if (shape === '圆形') {
      if (!invert) {
        css.clipPath = 'circle(50%)';
      }
      // 反向圆形：同上

    } else if (shape === '渐变') {
      var p1 = Math.max(0, 50 - feather / 2);
      var p2 = Math.min(100, 50 + feather / 2);

      var c1, c2;
      if (invert) {
        // 反向：左可见 → 右隐藏
        c1 = 'black';
        c2 = 'transparent';
      } else {
        // 正向：左隐藏 → 右可见
        c1 = 'transparent';
        c2 = 'black';
      }

      // feather=0 时硬边过渡，feather>0 时渐隐过渡
      if (p1 === p2) {
        css.maskImage = 'linear-gradient(to right, ' + c1 + ' ' + p1 + '%, ' + c2 + ' ' + p2 + '%)';
      } else {
        css.maskImage = 'linear-gradient(to right, ' + c1 + ' ' + p1 + '%, ' + c2 + ' ' + p2 + '%)';
      }
    }

    return css;
  };

  /**
   * 节点执行 — 计算输出数据
   */
  MaskNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    var extra = {
      shape: this.properties.shape,
      borderRadius: this.properties.borderRadius,
      feather: this.properties.feather,
      invert: this.properties.invert
    };

    var css = this._buildMaskCSS();

    // 合并上游 CSS（当前蒙版属性覆盖上游同名属性）
    if (input && input.css) {
      var merged = {};
      for (var key in input.css) {
        if (input.css.hasOwnProperty(key)) {
          merged[key] = input.css[key];
        }
      }
      for (var key in css) {
        if (css.hasOwnProperty(key)) {
          merged[key] = css[key];
        }
      }
      this._lastOutput = this.buildOutput('image', merged, extra);
    } else {
      this._lastOutput = this.buildOutput('image', css, extra);
    }

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览 — 蒙版形状可视化
   */
  MaskNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var cx = this.size[0] / 2;
    var cy = this.previewY + 35;
    var shape = this.properties.shape;
    var invert = this.properties.invert;
    var feather = this.properties.feather;
    var borderRadius = this.properties.borderRadius;

    // 预览区域尺寸
    var previewSize = 110;
    var x = cx - previewSize / 2;
    var y = cy - previewSize / 2;

    // — 背景：彩色渐变网格，表示被蒙版的内容 —
    var bgGrad = ctx.createLinearGradient(x, y, x + previewSize, y + previewSize);
    bgGrad.addColorStop(0, '#6366f1');
    bgGrad.addColorStop(0.4, '#8b5cf6');
    bgGrad.addColorStop(0.7, '#ec4899');
    bgGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(x, y, previewSize, previewSize);

    // — 叠加半透明网格以增强视觉效果 —
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (var gx = x; gx < x + previewSize; gx += 10) {
      for (var gy = y; gy < y + previewSize; gy += 10) {
        if ((Math.floor((gx - x) / 10) + Math.floor((gy - y) / 10)) % 2 === 0) {
          ctx.fillRect(gx, gy, 10, 10);
        }
      }
    }

    // — 绘制蒙版形状 —
    ctx.save();

    if (shape === '矩形') {
      var r = Math.min(borderRadius, previewSize / 2);
      if (!invert) {
        // 正向：裁剪到圆角矩形
        ctx.beginPath();
        ctx.roundRect(x, y, previewSize, previewSize, r);
        ctx.clip();
        // 裁剪区域内加深半透色
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y, previewSize, previewSize);
      } else {
        // 反向：挖空中心圆角矩形
        ctx.beginPath();
        ctx.rect(0, 0, this.size[0], this.size[1]);
        ctx.roundRect(x + 8, y + 8, previewSize - 16, previewSize - 16, Math.max(0, r - 8));
        ctx.clip('evenodd');
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, this.size[0], this.size[1]);
      }

    } else if (shape === '圆形') {
      var radius = previewSize / 2;
      if (!invert) {
        // 正向：裁剪到圆形
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y, previewSize, previewSize);
      } else {
        // 反向：挖空中心圆形
        ctx.beginPath();
        ctx.rect(0, 0, this.size[0], this.size[1]);
        ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
        ctx.clip('evenodd');
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, this.size[0], this.size[1]);
      }

    } else if (shape === '渐变') {
      // 渐变条预览
      var barW = previewSize - 24;
      var barH = 24;
      var barX = cx - barW / 2;
      var barY = cy - barH / 2;

      // 羽化参数
      var p1 = Math.max(0, 50 - feather / 2);
      var p2 = Math.min(100, 50 + feather / 2);

      var maskGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      if (!invert) {
        maskGrad.addColorStop(0, 'transparent');
        maskGrad.addColorStop(p1 / 100, 'transparent');
        maskGrad.addColorStop(p2 / 100, 'rgba(0,0,0,0.6)');
        maskGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
      } else {
        maskGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        maskGrad.addColorStop(p1 / 100, 'rgba(0,0,0,0.6)');
        maskGrad.addColorStop(p2 / 100, 'transparent');
        maskGrad.addColorStop(1, 'transparent');
      }

      // 渐变条背景（深色底）
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.fill();

      // 渐变条
      ctx.fillStyle = maskGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.fill();

      // 渐变条边框
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.stroke();

      // 方向箭头标记
      ctx.fillStyle = '#6B7280';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      var arrow = invert ? '←' : '→';
      ctx.fillText(arrow, cx, barY + barH + 18);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // — 形状轮廓线（在蒙版上叠加） —
    ctx.save();
    if (!invert) {
      ctx.strokeStyle = '#10B981';
    } else {
      ctx.strokeStyle = '#EF4444';
    }
    ctx.lineWidth = 2;
    ctx.setLineDash(invert ? [5, 3] : []);

    if (shape === '矩形') {
      ctx.beginPath();
      ctx.roundRect(x, y, previewSize, previewSize, Math.min(borderRadius, previewSize / 2));
      ctx.stroke();
    } else if (shape === '圆形') {
      ctx.beginPath();
      ctx.arc(cx, cy, previewSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // — 底部信息文字 —
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    var info = shape;
    if (shape === '矩形') {
      info += ' · 圆角 ' + borderRadius;
    }
    info += ' · 羽化 ' + feather;
    if (invert) info += ' · 反转';

    ctx.fillText(info, cx, this.previewY + previewSize + 18);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/mask', MaskNode);

  console.log('[MaskNode] 蒙版节点已注册');
})();
