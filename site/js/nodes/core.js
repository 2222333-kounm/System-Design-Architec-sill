/* ========================================
   节点基类 — 所有节点继承此基类
   提供统一输出格式 { type, css, extra }
   ======================================== */

;(function() {
  'use strict';

  /**
   * 节点基类
   * 每个具体节点继承此基类并重写 onExecute
   */
  var NodeBase = function(title, params) {
    this.properties = params || {};
    this._lastOutput = null;
    this.size = [320, 200];
  };

  /**
   * 标记需要重绘，触发 graph.onAfterChange
   */
  NodeBase.prototype._markDirty = function() {
    this.setDirtyCanvas(true, true);
    if (this.graph && this.graph.onAfterChange) {
      this.graph.onAfterChange(this.graph);
    }
  };

  /**
   * 构建统一输出格式
   * @param {string} type - 数据类型标识 (color/text/image/css/interactive...)
   * @param {Object} css - CSS 属性集合（仅布局相关）
   * @param {Object} extra - 非布局特有数据
   * @returns {Object} { type, css, extra }
   */
  NodeBase.prototype.buildOutput = function(type, css, extra) {
    var output = { type: type || 'unknown' };
    if (css && typeof css === 'object' && Object.keys(css).length > 0) {
      output.css = css;
    }
    if (extra && typeof extra === 'object' && Object.keys(extra).length > 0) {
      output.extra = extra;
    }
    return output;
  };

  /**
   * 从输入端口获取数据
   * @param {number} slot - 端口索引
   * @returns {*}
   */
  NodeBase.prototype.getInput = function(slot) {
    return this.getInputData(slot);
  };

  /**
   * 设置输出数据（自动包装）
   * @param {number} slot - 端口索引
   * @param {*} data - 输出数据
   */
  NodeBase.prototype.setOutput = function(slot, data) {
    this.setOutputData(slot, data);
  };

  window.NodeBase = NodeBase;

  console.log('[NodeBase] 节点基类已加载');
})();
