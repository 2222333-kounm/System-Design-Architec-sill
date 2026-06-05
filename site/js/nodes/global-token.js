/* ========================================
   全局 Token 节点 — 读取所有 CSS Token
   输入: 无 | 输出: tokens
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[GlobalToken] NodeBase 未加载');
    return;
  }

  // =====================
  //  全局 Token 节点定义
  // =====================

  function GlobalTokenNode() {
    // 无输入端口 — 这是一个源节点
    this.addOutput('tokens →', 'css');

    this.properties = {};

    // 从 TokenStore 获取类别信息
    var ts = window.TokenStore;
    if (ts) {
      this.properties.tokenCount = ts.keys().length;
    }

    // 节点尺寸
    this.size = [320, 220];
  }

  GlobalTokenNode.title = '\u{1F310} 全局 Token';
  GlobalTokenNode.desc = '自动读取所有 CSS Token';

  GlobalTokenNode.prototype = Object.create(NodeBase.prototype);
  GlobalTokenNode.prototype.constructor = GlobalTokenNode;

  /**
   * 节点执行 — 收集所有 Token 并输出
   */
  GlobalTokenNode.prototype.onExecute = function() {
    var ts = window.TokenStore;
    if (!ts) {
      this._lastOutput = this.buildOutput('tokens', {}, {
        count: 0,
        categories: [],
        favorites: {}
      });
      this.setOutputData(0, this._lastOutput);
      return;
    }

    // 获取所有 Token key-value
    var keys = ts.keys();
    var css = {};
    for (var i = 0; i < keys.length; i++) {
      css[keys[i]] = ts.get(keys[i]);
    }

    // 分类统计
    var categories = [];
    var categoryMap = {};
    for (var j = 0; j < keys.length; j++) {
      var parts = keys[j].split('-');
      var prefix = parts[1]; // 'color', 'font', 'spacing', 'radius', 'border'...
      if (prefix === 'font') prefix = 'typography';
      if (prefix === 'border') prefix = 'border';
      if (!categoryMap[prefix]) {
        categoryMap[prefix] = true;
        categories.push(prefix);
      }
    }

    // 获取收藏 Token
    var favorites = {};
    try {
      favorites = ts.getFavorites();
    } catch(e) {
      favorites = {};
    }

    this._lastOutput = this.buildOutput('tokens', css, {
      count: keys.length,
      categories: categories.sort(),
      favorites: favorites
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览 — 显示收藏 Token
   */
  GlobalTokenNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var ts = window.TokenStore;
    if (!ts) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TokenStore 未加载', this.size[0] / 2, this.size[1] / 2 + 20);
      ctx.textAlign = 'left';
      return;
    }

    var keys = ts.keys();
    var x = 10;
    var y = 46;
    var lineH = 16;

    // 统计摘要
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.fillText('\u{1F4CA} 共 ' + keys.length + ' 个 Token', x, y);
    y += lineH + 4;

    // 获取收藏并显示
    var favorites;
    try {
      favorites = ts.getFavorites();
    } catch(e) {
      favorites = {};
    }

    var catNames = {
      color: '\u{1F3A8} 颜色',
      typography: '\u{1F4DD} 字体',
      spacing: '\u{2194}️ 间距',
      radius: '\u{25EF} 圆角',
      border: '\u{25A1} 边框'
    };

    var drawnCount = 0;
    var maxLines = 8;

    Object.keys(favorites).forEach(function(cat) {
      if (drawnCount >= maxLines) return;
      var tokens = favorites[cat];
      if (!tokens || tokens.length === 0) return;

      // 类别标题
      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(catNames[cat] || cat, x, y);
      y += lineH;
      drawnCount++;

      // 显示前 2 个 Token 值
      var showCount = Math.min(tokens.length, 2);
      for (var t = 0; t < showCount; t++) {
        if (drawnCount >= maxLines) return;
        var name = tokens[t];
        var value = ts.get(name) || '';
        ctx.fillStyle = '#D1D5DB';
        ctx.font = '10px monospace';
        var label = name + ': ' + value;
        if (ctx.measureText(label).width > this.size[0] - 20) {
          label = name + ': ' + value.substring(0, 12) + '…';
        }
        ctx.fillText('· ' + label, x + 8, y);
        y += lineH;
        drawnCount++;
      }
    });

    // 剩余数量提示
    var remaining = keys.length;
    Object.keys(favorites).forEach(function(cat) {
      if (favorites[cat]) remaining -= favorites[cat].length;
    });
    if (remaining > 0 && drawnCount < maxLines) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px monospace';
      ctx.fillText('… 还有 ' + remaining + ' 个 Token', x, y);
    }
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/global-token', GlobalTokenNode);

  console.log('[GlobalToken] 全局 Token 节点已注册');
})();
