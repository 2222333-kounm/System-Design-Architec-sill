/* ========================================
   边框节点 — 边框样式/粗细/颜色/圆角
   输入: input | 输出: css
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[BorderNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  线条类型映射
  // =====================

  var LINE_TYPE_MAP = {
    '实线': 'solid',
    '虚线': 'dashed',
    '点线': 'dotted',
    '双线': 'double'
  };

  // =====================
  //  边框节点定义
  // =====================

  function BorderNode() {
    this.addInput('input', 'css');
    this.addOutput('css', 'css');

    this.properties = {
      lineType: '实线',
      thickness: 2,
      color: '#E5E5E5',
      borderRadius: 8
    };

    var that = this;

    // 线条类型
    this.addWidget('combo', '线条类型', this.properties.lineType, function(v) {
      that.properties.lineType = v;
      that._markDirty();
    }, { values: ['实线', '虚线', '点线', '双线'] });

    // 粗细
    this.addWidget('number', '粗细', this.properties.thickness, function(v) {
      that.properties.thickness = v;
      that._markDirty();
    }, { min: 0, max: 20, step: 1 });

    // 颜色
    this.addWidget('color', '颜色', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    // 圆角
    this.addWidget('number', '圆角', this.properties.borderRadius, function(v) {
      that.properties.borderRadius = v;
      that._markDirty();
    }, { min: 0, max: 9999, step: 1 });

    // 节点尺寸
    this.previewY = 180;
    this.size = [320, 220];
  }

  BorderNode.title = '📦 边框';
  BorderNode.desc = '边框样式 · 实线/虚线/点线/双线 · 粗细/颜色/圆角';

  BorderNode.prototype = Object.create(NodeBase.prototype);
  BorderNode.prototype.constructor = BorderNode;

  /**
   * 节点执行 — 计算输出 CSS 数据
   */
  BorderNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    var lineType = this.properties.lineType;
    var thickness = this.properties.thickness;
    var color = this.properties.color;
    var borderRadius = this.properties.borderRadius;

    var style = LINE_TYPE_MAP[lineType] || 'solid';

    var borderStr = thickness > 0
      ? thickness + 'px ' + style + ' ' + color
      : 'none';

    var cssOutput = {
      border: borderStr,
      borderRadius: borderRadius + 'px'
    };

    var extra = {
      style: style,
      width: thickness,
      color: color
    };

    // 如果上游有 CSS 数据，合并（当前边框属性覆盖上游同名属性）
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
   * 节点内绘制预览 — 边框样式可视化
   */
  BorderNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 20;
    var y = this.previewY + 6;
    var w = this.size[0] - 40;
    var h = this.size[1] - y - 10;

    if (h < 16) return;

    var thickness = this.properties.thickness;
    var color = this.properties.color;
    var borderRadius = this.properties.borderRadius;
    var lineType = this.properties.lineType;
    var style = LINE_TYPE_MAP[lineType] || 'solid';

    // — 绘制边框预览框 —

    // 内框（透明背景，仅显示边框效果）
    var drawX = x;
    var drawY = y;
    var drawW = w;
    var drawH = h;

    // 内部填充（浅色半透明底）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, drawW, drawH, Math.min(borderRadius, drawW / 2, drawH / 2));
    ctx.fill();

    // 边框线
    if (thickness > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.min(thickness, 8); // 预览最大 8px 以免溢出
      if (style === 'dashed') {
        ctx.setLineDash([6, 4]);
      } else if (style === 'dotted') {
        ctx.setLineDash([2, 3]);
      } else if (style === 'double') {
        ctx.setLineDash([]);
        // 双线：绘制两条细线
        ctx.lineWidth = Math.min(Math.max(thickness / 3, 1), 4);
        ctx.beginPath();
        ctx.roundRect(drawX + 3, drawY + 3, drawW - 6, drawH - 6, Math.max(0, Math.min(borderRadius, drawW / 2, drawH / 2) - 3));
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(drawX - 3, drawY - 3, drawW + 6, drawH + 6, Math.min(borderRadius, drawW / 2, drawH / 2) + 3);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        // 双线特殊标注
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('双线', drawX + drawW / 2, drawY + drawH / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        // 属性信息
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        var info = thickness + 'px ' + style + ' ' + color + ' · 圆角 ' + borderRadius + 'px';
        ctx.fillText(info, this.size[0] / 2, y + h + 14);
        ctx.textAlign = 'left';
        return;
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.roundRect(drawX, drawY, drawW, drawH, Math.min(borderRadius, drawW / 2, drawH / 2));
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // thickness=0 显示虚线轮廓
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, drawW, drawH, Math.min(borderRadius, drawW / 2, drawH / 2));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('无边框', drawX + drawW / 2, drawY + drawH / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // 属性信息
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var info = thickness + 'px ' + style + ' ' + color + ' · 圆角 ' + borderRadius + 'px';
    ctx.fillText(info, this.size[0] / 2, y + h + 14);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/border', BorderNode);

  console.log('[BorderNode] 边框节点已注册');
})();
