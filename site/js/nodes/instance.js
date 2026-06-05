/* ========================================
   组件实例节点 — 引用已保存的组件并注入插槽数据
   输入: input  | 输出: instance
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[InstanceNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  占位组件列表
  // =====================

  var COMPONENT_LIST = [
    'nav-bar',
    'hero-section',
    'card-grid',
    'footer-bar',
    'sidebar-menu',
    'modal-dialog',
    'tabs-container',
    'accordion-group'
  ];

  // =====================
  //  组件实例节点定义
  // =====================

  function InstanceNode() {
    this.addInput('slot in', 'any');
    this.addOutput('instance →', 'instance');

    this.properties = {
      componentRef: 'nav-bar',
      instanceName: '组件实例',
      slots: ''
    };

    var that = this;

    // 组件引用（下拉列表）
    this.addWidget('combo', '组件', this.properties.componentRef, function(v) {
      that.properties.componentRef = v;
      that._markDirty();
    }, {
      values: COMPONENT_LIST
    });

    // 实例名称
    this.addWidget('text', '实例名', this.properties.instanceName, function(v) {
      that.properties.instanceName = v;
      that._markDirty();
    });

    // 插槽数据（简化表示：key=value,key=value）
    this.addWidget('text', '插槽', this.properties.slots, function(v) {
      that.properties.slots = v;
      that._markDirty();
    });

    // 节点尺寸
    this.previewY = 200;
    this.size = [320, 260];
  }

  InstanceNode.title = '♻ 组件实例';
  InstanceNode.desc = '引用组件 · 组件选择/实例名/插槽数据';

  InstanceNode.prototype = Object.create(NodeBase.prototype);
  InstanceNode.prototype.constructor = InstanceNode;

  /**
   * 解析插槽字符串 "key=value,key=value" 为对象
   */
  function parseSlots(slotStr) {
    var slots = {};
    if (!slotStr || typeof slotStr !== 'string') return slots;
    var pairs = slotStr.split(',');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].trim();
      if (!pair) continue;
      var eqIdx = pair.indexOf('=');
      if (eqIdx === -1) {
        slots[pair] = '';
      } else {
        var key = pair.substring(0, eqIdx).trim();
        var val = pair.substring(eqIdx + 1).trim();
        if (key) slots[key] = val;
      }
    }
    return slots;
  }

  /**
   * 节点执行 — 计算输出数据
   */
  InstanceNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了 slot 数据，尝试合并
    var mergedSlots = parseSlots(this.properties.slots);
    if (input && typeof input === 'object') {
      if (input.slots && typeof input.slots === 'object') {
        // 上游插槽覆盖/补充本地设置
        for (var key in input.slots) {
          if (input.slots.hasOwnProperty(key)) {
            mergedSlots[key] = input.slots[key];
          }
        }
      }
    }

    this._lastOutput = this.buildOutput('instance', {}, {
      componentRef: this.properties.componentRef || 'unknown',
      instanceName: this.properties.instanceName || '组件实例',
      slots: mergedSlots,
      overrides: {}
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（组件引用信息展示）
   */
  InstanceNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 48;

    // 预览背景区域
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // 绘制组件引用名称（居中大号显示）
    var refName = this.properties.componentRef || 'unknown';
    var instanceName = this.properties.instanceName || '';

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(refName, this.size[0] / 2, y + h / 2 - 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // 底部属性标注
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    var slotCount = 0;
    if (this.properties.slots) {
      var pairs = this.properties.slots.split(',');
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].trim()) slotCount++;
      }
    }

    var info = '实例: ' + (instanceName || '(未命名)') + ' · 插槽: ' + slotCount + '个';
    ctx.fillText(info, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/instance', InstanceNode);

  console.log('[InstanceNode] 组件实例节点已注册');
})();
