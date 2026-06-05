/* ========================================
   输出节点 — 最终结果出口
   输入: data | 输出: 无（推送到预览面板）
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[Output] NodeBase 未加载');
    return;
  }

  function OutputNode() {
    this.addInput('data in', 'css');
    this.properties = {};
    this._lastOutput = null;
    this.size = [200, 80];
  }

  OutputNode.title = '📤 输出';
  OutputNode.desc = '连接到预览面板';

  OutputNode.prototype = Object.create(NodeBase.prototype);
  OutputNode.prototype.constructor = OutputNode;

  OutputNode.prototype.onExecute = function() {
    this._lastOutput = this.getInputData(0);
    this.setOutputData(0, this._lastOutput);
  };

  OutputNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    // 提示文字
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(10, 40, this.size[0] - 20, 28, 6);
    ctx.fill();

    ctx.fillStyle = '#4B5563';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('数据已发送到预览面板 →', this.size[0] / 2, 58);
    ctx.textAlign = 'left';
  };

  LiteGraph.registerNodeType('sill/output', OutputNode);

  console.log('[Output] 输出节点已注册');
})();
