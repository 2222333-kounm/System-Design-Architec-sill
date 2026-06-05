/* ========================================
   图标节点 — Emoji 图标选择/预览
   输入: input | 输出: css
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[IconNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  图标列表（20 个常用图标）
  // =====================

  var ICON_LIST = ['🔍','🔔','⚙️','📁','❤️','⭐','💬','📌','🔗','💾','📤','📥','🔄','🎯','🧩','🔒','🌐','✏️','🗑️','📊'];

  // =====================
  //  图标节点定义
  // =====================

  function IconNode() {
    this.addInput('any in', 'any');
    this.addOutput('css →', 'css');

    this.properties = {
      icon: '❤️',
      size: 24,
      color: '#000000',
      opacity: 100
    };

    var that = this;

    // 图标选择（下拉列表）
    this.addWidget('combo', '图标', this.properties.icon, function(v) {
      that.properties.icon = v;
      that._markDirty();
    }, {
      values: ICON_LIST
    });

    // 字号
    this.addWidget('number', '字号', this.properties.size, function(v) {
      that.properties.size = v;
      that._markDirty();
    }, { min: 8, max: 128, step: 1 });

    // 颜色
    this.addWidget('color', '颜色', this.properties.color, function(v) {
      that.properties.color = v;
      that._markDirty();
    });

    // 不透明度
    this.addWidget('slider', '不透明度', this.properties.opacity, function(v) {
      that.properties.opacity = v;
      that._markDirty();
    }, { min: 0, max: 100 });

    // 节点尺寸
    this.previewY = 180;
    this.size = [320, 260];
  }

  IconNode.title = '\u{1F523} 图标';
  IconNode.desc = 'Emoji 图标 · 图标选择/字号/颜色/不透明度';

  IconNode.prototype = Object.create(NodeBase.prototype);
  IconNode.prototype.constructor = IconNode;

  /**
   * 节点执行 — 计算输出数据
   */
  IconNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了图标，则同步更新
    if (input && typeof input === 'string') {
      if (ICON_LIST.indexOf(input) !== -1) {
        this.properties.icon = input;
      }
    } else if (input && input.icon) {
      if (ICON_LIST.indexOf(input.icon) !== -1) {
        this.properties.icon = input.icon;
      }
    }

    var iconChar = this.properties.icon || '❤️';
    var fontSize = this.properties.size;
    var color = this.properties.color;
    var opacityVal = this.properties.opacity / 100;

    this._lastOutput = this.buildOutput('css', {
      fontSize: fontSize + 'px',
      color: color,
      opacity: String(opacityVal),
      lineHeight: '1'
    }, {
      icon: iconChar,
      html: '<span style="font-size:' + fontSize + 'px;color:' + color + ';opacity:' + opacityVal + '">' + iconChar + '</span>'
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（大图标展示）
   */
  IconNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 60;

    // 预览背景区域
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // 绘制大图标居中
    var iconChar = this.properties.icon || '❤️';
    var fontSize = 48;
    var opacityVal = this.properties.opacity / 100;

    ctx.globalAlpha = opacityVal;
    ctx.font = fontSize + 'px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconChar, this.size[0] / 2, y + h / 2 + 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 1;

    // 底部属性标注
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var info = this.properties.icon + ' · ' +
               '字号 ' + this.properties.size + 'px · ' +
               this.properties.color + ' · ' +
               '不透明度 ' + this.properties.opacity + '%';
    ctx.fillText(info, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/icon', IconNode);

  console.log('[IconNode] 图标节点已注册');
})();
