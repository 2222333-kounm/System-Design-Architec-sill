/* ========================================
   合并节点 — 多输入 CSS 合并/堆叠/覆盖
   输入: A (css), B (css), C (css) | 输出: merged (css)
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[Merge] NodeBase 未加载');
    return;
  }

  // =====================
  //  合并节点定义
  // =====================

  function MergeNode() {
    this.addInput('A', 'css');
    this.addInput('B', 'css');
    this.addInput('C', 'css');
    this.addOutput('merged', 'css');

    this.properties = {
      mode: '叠加'
    };

    var that = this;

    // 合并模式（下拉列表）
    this.addWidget('combo', '模式', this.properties.mode, function(v) {
      that.properties.mode = v;
      that._markDirty();
    }, {
      values: ['叠加', '堆叠', '覆盖']
    });

    // 节点尺寸
    this.previewY = 60;
    this.size = [280, 160];
  }

  MergeNode.title = '🗂️ 合并';
  MergeNode.desc = '多输入 CSS 合并 · 叠加/堆叠/覆盖';

  MergeNode.prototype = Object.create(NodeBase.prototype);
  MergeNode.prototype.constructor = MergeNode;

  /**
   * 节点执行 — 根据模式合并多个 CSS 输入
   */
  MergeNode.prototype.onExecute = function() {
    var inputA = this.getInputData(0);
    var inputB = this.getInputData(1);
    var inputC = this.getInputData(2);
    var mode = this.properties.mode;

    switch (mode) {
      case '叠加':
        this._lastOutput = this._mergeOverlay(inputA, inputB, inputC);
        break;
      case '堆叠':
        this._lastOutput = this._mergeStack(inputA, inputB, inputC);
        break;
      case '覆盖':
        this._lastOutput = this._mergeOverride(inputA, inputB, inputC);
        break;
      default:
        this._lastOutput = this.buildOutput('error', null, { message: '未知合并模式: ' + mode });
    }

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 叠加模式 — 合并所有非空输入的 CSS 属性（后面的覆盖前面的同名属性）
   */
  MergeNode.prototype._mergeOverlay = function(inputA, inputB, inputC) {
    var mergedCss = {};
    var sources = [];

    var inputs = [inputA, inputB, inputC];
    var labels = ['A', 'B', 'C'];

    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i] && inputs[i].css) {
        sources.push(labels[i]);
        for (var key in inputs[i].css) {
          if (inputs[i].css.hasOwnProperty(key)) {
            mergedCss[key] = inputs[i].css[key];
          }
        }
      }
    }

    return this.buildOutput('merged', mergedCss, {
      mode: '叠加',
      sources: sources,
      mergedCount: sources.length
    });
  };

  /**
   * 堆叠模式 — 每个输入作为子元素层叠（position: relative）
   */
  MergeNode.prototype._mergeStack = function(inputA, inputB, inputC) {
    var children = [];
    var sources = [];

    var inputs = [inputA, inputB, inputC];
    var labels = ['A', 'B', 'C'];

    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i]) {
        sources.push(labels[i]);
        children.push(inputs[i]);
      }
    }

    var output = this.buildOutput('merged', { position: 'relative' }, {
      mode: '堆叠',
      sources: sources,
      mergedCount: sources.length
    });
    output.children = children;

    return output;
  };

  /**
   * 覆盖模式 — 只保留最后一个有数据的输入
   */
  MergeNode.prototype._mergeOverride = function(inputA, inputB, inputC) {
    var lastInput = null;
    var source = null;
    var labels = ['A', 'B', 'C'];

    var inputs = [inputA, inputB, inputC];
    for (var i = inputs.length - 1; i >= 0; i--) {
      if (inputs[i]) {
        lastInput = inputs[i];
        source = labels[i];
        break;
      }
    }

    if (!lastInput) {
      return this.buildOutput('merged', null, {
        mode: '覆盖',
        source: null,
        mergedCount: 0
      });
    }

    var css = lastInput.css || {};
    return this.buildOutput('merged', css, {
      mode: '覆盖',
      source: source,
      mergedCount: 1
    });
  };

  /**
   * 节点内绘制预览 — 显示各端口连接状态
   */
  MergeNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var boxW = this.size[0] - 20;
    var x = 10;
    var y = this.previewY;

    // 绘制端口的连接状态指示条
    var labels = ['A', 'B', 'C'];
    var colors = ['#10B981', '#3B82F6', '#8B5CF6'];
    var barCount = labels.length;
    var barGap = 4;
    var barW = (boxW - (barCount - 1) * barGap) / barCount;
    var barH = 16;

    for (var i = 0; i < barCount; i++) {
      var connected = this.isInputConnected(i);
      var bx = x + i * (barW + barGap);

      // 背景条
      ctx.fillStyle = connected ? colors[i] : '#E5E7EB';
      ctx.globalAlpha = connected ? 0.85 : 0.5;
      ctx.beginPath();
      ctx.roundRect(bx, y, barW, barH, 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      // 端口标签
      ctx.fillStyle = connected ? '#FFFFFF' : '#9CA3AF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], bx + barW / 2, y + barH / 2);
    }

    // 模式文字
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      '模式: ' + this.properties.mode,
      this.size[0] / 2,
      y + barH + 20
    );

    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/merge', MergeNode);

  console.log('[Merge] 合并节点已注册');
})();
