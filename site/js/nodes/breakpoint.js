/* ========================================
   断点节点 — Responsive Breakpoint
   输入: css | 输出: responsive
   将基础样式包裹在媒体查询中，实现响应式断点
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[Breakpoint] NodeBase 未加载');
    return;
  }

  // =====================
  //  断点预设
  // =====================

  var BREAKPOINTS = {
    mobile:  { name: 'mobile',  width: 734,  defaultCondition: 'max-width' },
    tablet:  { name: 'tablet',  width: 1068, defaultCondition: 'max-width' },
    desktop: { name: 'desktop', width: 1069, defaultCondition: 'min-width' },
    custom:  { name: 'custom',  width: 1024, defaultCondition: 'min-width' }
  };

  // =====================
  //  断点节点定义
  // =====================

  function BreakpointNode() {
    this.addInput('css in', 'css');
    this.addOutput('responsive →', 'responsive');

    this.properties = {
      breakpoint: 'mobile',
      condition: 'max-width',
      customWidth: 1024,
      overrides: ''
    };

    var that = this;

    // ==================================
    //  控件
    // ==================================

    // 断点类型
    this.addWidget('combo', '断点', this.properties.breakpoint, function(v) {
      that.properties.breakpoint = v;

      // 切换断点时自动更新 condition 和 width 预设
      var bp = BREAKPOINTS[v] || BREAKPOINTS.mobile;
      that.properties.condition = bp.defaultCondition;

      that._markDirty();
    }, { values: ['mobile', 'tablet', 'desktop', 'custom'] });

    // 条件: max-width / min-width
    this.addWidget('combo', '条件', this.properties.condition, function(v) {
      that.properties.condition = v;
      that._markDirty();
    }, { values: ['max-width', 'min-width'] });

    // 自定义宽度（仅 custom 模式生效）
    this.addWidget('number', '自定义宽度', this.properties.customWidth, function(v) {
      that.properties.customWidth = Math.max(0, Math.min(2000, Math.round(v)));
      that._markDirty();
    }, { min: 0, max: 2000, step: 1 });

    // 覆盖样式 (key:value 格式，每行一个)
    this.addWidget('text', '覆盖样式', this.properties.overrides, function(v) {
      that.properties.overrides = v;
      that._markDirty();
    });

    // 节点尺寸
    this.previewY = 170;
    this.size = [320, 300];
  }

  BreakpointNode.title = '📱 断点';
  BreakpointNode.desc = '响应式断点 · 媒体查询 · 样式覆盖';

  BreakpointNode.prototype = Object.create(NodeBase.prototype);
  BreakpointNode.prototype.constructor = BreakpointNode;

  // =====================
  //  解析覆盖样式
  // =====================

  /**
   * 解析 key:value 文本为对象
   * @param {string} text - 每行一个 key:value
   * @returns {Object}
   */
  BreakpointNode.prototype._parseOverrides = function(text) {
    var result = {};
    if (!text || typeof text !== 'string') return result;

    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      var colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      var key = line.substring(0, colonIdx).trim();
      var value = line.substring(colonIdx + 1).trim();

      if (key && value) {
        result[key] = value;
      }
    }

    return result;
  };

  // =====================
  //  获取断点配置
  // =====================

  /**
   * 根据当前属性获取断点信息
   * @returns {{ name: string, width: number, condition: string }}
   */
  BreakpointNode.prototype._getBreakpointInfo = function() {
    var p = this.properties;
    var bp = BREAKPOINTS[p.breakpoint] || BREAKPOINTS.mobile;

    return {
      name: bp.name,
      width: p.breakpoint === 'custom' ? p.customWidth : bp.width,
      condition: p.condition
    };
  };

  // =====================
  //  onExecute — 生成输出
  // =====================

  BreakpointNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    var p = this.properties;

    // 获取断点信息
    var bpInfo = this._getBreakpointInfo();

    // 构建 media query
    var mediaQuery = '(' + bpInfo.condition + ': ' + bpInfo.width + 'px)';

    // 解析覆盖样式
    var overrides = this._parseOverrides(p.overrides);

    // 合并基础样式 + 覆盖样式
    var mergedCss = {};

    if (input && input.css) {
      for (var k in input.css) {
        if (input.css.hasOwnProperty(k)) {
          mergedCss[k] = input.css[k];
        }
      }
    }

    // 覆盖样式优先级更高
    for (var ok in overrides) {
      if (overrides.hasOwnProperty(ok)) {
        mergedCss[ok] = overrides[ok];
      }
    }

    // 构建 extra
    var extra = {
      mediaQuery: mediaQuery,
      breakpoint: {
        name: bpInfo.name,
        width: bpInfo.width,
        condition: bpInfo.condition
      },
      overrides: overrides
    };

    // 合并上游额外信息
    if (input && input.extra) {
      for (var ek in input.extra) {
        if (input.extra.hasOwnProperty(ek) && extra[ek] === undefined) {
          extra[ek] = input.extra[ek];
        }
      }
    }

    this._lastOutput = this.buildOutput('responsive', mergedCss, extra);
    this.setOutputData(0, this._lastOutput);
  };

  // =====================
  //  onDrawBackground — 断点示意图
  // =====================

  BreakpointNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY + 2;
    var w = this.size[0] - 20;
    var h = this.size[1] - y - 8;

    if (h < 30) return;

    var bpInfo = this._getBreakpointInfo();
    var bpConfig = BREAKPOINTS[bpInfo.name] || BREAKPOINTS.mobile;

    // --- 背景条（全宽标尺） ---
    var barY = y + 6;
    var barH = 20;
    var barW = w;

    // 标尺背景
    var gradient = ctx.createLinearGradient(x, barY, x + barW, barY);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.15)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, barY, barW, barH, 10);
    ctx.fill();

    // 标尺边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, barY, barW, barH, 10);
    ctx.stroke();

    // --- 断点标记 ---
    var mobileWidth = BREAKPOINTS.mobile.width;
    var tabletWidth = BREAKPOINTS.tablet.width;
    var desktopWidth = BREAKPOINTS.desktop.width;
    var maxWidth = 2000;

    // 计算相对位置
    var mobileRatio = mobileWidth / maxWidth;
    var tabletRatio = tabletWidth / maxWidth;
    var desktopRatio = desktopWidth / maxWidth;

    var mobileX = x + barW * mobileRatio;
    var tabletX = x + barW * tabletRatio;
    var desktopLabelX = x + barW * 0.92;

    // 当前断点的位置（近似）
    var currentRatio = Math.min(bpInfo.width / maxWidth, 1);
    var currentX = x + barW * currentRatio;

    // --- 绘制箭头从当前断点到移动端 ---
    // 箭头线（表示 responsive cascade）
    var arrowY = barY + barH + 4;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(currentX, arrowY);
    ctx.lineTo(x + 10, arrowY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 箭头头（指向左侧 — 表示缩小到移动端）
    var arrowHeadY = arrowY;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x + 10, arrowHeadY);
    ctx.lineTo(x + 16, arrowHeadY - 4);
    ctx.lineTo(x + 16, arrowHeadY + 4);
    ctx.closePath();
    ctx.fill();

    // --- 断点竖线 ---
    var markTop = barY - 2;
    var markBottom = barY + barH + 2;

    // mobile 竖线
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mobileX, markTop);
    ctx.lineTo(mobileX, markBottom);
    ctx.stroke();

    // tablet 竖线
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.beginPath();
    ctx.moveTo(tabletX, markTop);
    ctx.lineTo(tabletX, markBottom);
    ctx.stroke();

    // desktop 竖线（右侧标注）
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(desktopLabelX, markTop);
    ctx.lineTo(desktopLabelX, markBottom);
    ctx.stroke();

    // --- 当前断点高亮 ---
    var hlColor = 'rgba(139, 92, 246, 0.25)';
    if (bpInfo.name === 'mobile') hlColor = 'rgba(59, 130, 246, 0.25)';
    else if (bpInfo.name === 'tablet') hlColor = 'rgba(16, 185, 129, 0.25)';
    else if (bpInfo.name === 'desktop') hlColor = 'rgba(245, 158, 11, 0.25)';
    else hlColor = 'rgba(139, 92, 246, 0.25)';

    // 当前断点区域高亮（沿着标尺）
    ctx.fillStyle = hlColor;
    ctx.beginPath();
    ctx.roundRect(currentX - 3, barY, 6, barH, 3);
    ctx.fill();

    // --- 标签 ---
    ctx.textBaseline = 'bottom';
    ctx.font = '9px monospace';

    // mobile 标签
    ctx.fillStyle = '#60A5FA';
    ctx.textAlign = 'center';
    ctx.fillText('mobile: 734', mobileX, markTop - 2);

    // tablet 标签
    ctx.fillStyle = '#34D399';
    ctx.fillText('tablet: 1068', tabletX, markTop - 2);

    // desktop 标签
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('desktop: 1069', desktopLabelX, markTop - 2);

    // --- 当前断点信息 ---
    var infoY = arrowY + 14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '10px sans-serif';

    var label = bpInfo.name === 'custom'
      ? ('custom @ ' + bpInfo.condition + ' ' + bpInfo.width + 'px')
      : (bpInfo.name + ' @ ' + bpInfo.condition + ' ' + bpInfo.width + 'px');

    ctx.fillStyle = '#A78BFA';
    ctx.fillText('▶ ' + label, x + 2, infoY);

    // --- 覆盖样式数量 ---
    var overrides = this._parseOverrides(this.properties.overrides);
    var overrideCount = Object.keys(overrides).length;
    if (overrideCount > 0) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '9px sans-serif';
      ctx.fillText(overrideCount + ' overrides', x + 2, infoY + 14);
    }

    ctx.textBaseline = 'alphabetic';
  };

  // =====================
  //  注册节点类型
  // =====================

  LiteGraph.registerNodeType('sill/breakpoint', BreakpointNode);

  console.log('[Breakpoint] 断点节点已注册');
})();
