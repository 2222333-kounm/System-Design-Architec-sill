/* ========================================
   布局容器节点 — Flex/Grid 布局
   输入: css | 输出: layout
   支持 display 属性在 flex/grid 间切换，
   动态生成对应 CSS 布局属性。
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[LayoutContainer] NodeBase 未加载');
    return;
  }

  // =====================
  //  布局容器节点定义
  // =====================

  function LayoutContainerNode() {
    this.addInput('items in', 'css');
    this.addOutput('layout →', 'layout');

    this.properties = {
      // Mode
      display: 'flex',

      // --- Flex ---
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      gap: 16,
      gapUnit: 'px',
      flexWrap: 'nowrap',
      padding: 0,

      // --- Grid ---
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: 'auto auto',
      rowGap: 16,
      columnGap: 16,
      justifyItems: 'stretch',
      gridJustifyContent: 'start',
      alignContent: 'stretch',
      gridAutoFlow: 'row',
      gridTemplateAreas: ''
    };

    var that = this;

    // ==================================
    //  通用控件
    // ==================================

    // display 模式切换（flex/grid）
    this.addWidget('combo', '模式', this.properties.display, function(v) {
      that.properties.display = v;
      that._markDirty();
    }, { values: ['flex', 'grid'] });

    // ==================================
    //  Flex 控件
    // ==================================

    this.addWidget('combo', '方向', this.properties.flexDirection, function(v) {
      that.properties.flexDirection = v;
      that._markDirty();
    }, { values: ['row', 'column'] });

    this.addWidget('combo', '主轴对齐', this.properties.justifyContent, function(v) {
      that.properties.justifyContent = v;
      that._markDirty();
    }, {
      values: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']
    });

    this.addWidget('combo', '交叉轴对齐', this.properties.alignItems, function(v) {
      that.properties.alignItems = v;
      that._markDirty();
    }, { values: ['stretch', 'center', 'flex-start', 'flex-end'] });

    this.addWidget('number', '间距', this.properties.gap, function(v) {
      that.properties.gap = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    // 间距单位
    this.addWidget('combo', '间距单位', this.properties.gapUnit, function(v) {
      that.properties.gapUnit = v;
      that._markDirty();
    }, { values: ['px', 'em', '%'] });

    this.addWidget('combo', '换行', this.properties.flexWrap, function(v) {
      that.properties.flexWrap = v;
      that._markDirty();
    }, { values: ['nowrap', 'wrap', 'wrap-reverse'] });

    this.addWidget('number', '内边距', this.properties.padding, function(v) {
      that.properties.padding = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    // ==================================
    //  Grid 控件
    // ==================================

    this.addWidget('text', '列模板', this.properties.gridTemplateColumns, function(v) {
      that.properties.gridTemplateColumns = v;
      that._markDirty();
    });

    this.addWidget('text', '行模板', this.properties.gridTemplateRows, function(v) {
      that.properties.gridTemplateRows = v;
      that._markDirty();
    });

    this.addWidget('number', '行间距', this.properties.rowGap, function(v) {
      that.properties.rowGap = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    this.addWidget('number', '列间距', this.properties.columnGap, function(v) {
      that.properties.columnGap = v;
      that._markDirty();
    }, { min: 0, max: 100, step: 1 });

    this.addWidget('combo', '项对齐', this.properties.justifyItems, function(v) {
      that.properties.justifyItems = v;
      that._markDirty();
    }, { values: ['start', 'end', 'center', 'stretch'] });

    this.addWidget('combo', 'grid 主轴对齐', this.properties.gridJustifyContent, function(v) {
      that.properties.gridJustifyContent = v;
      that._markDirty();
    }, {
      values: ['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']
    });

    this.addWidget('combo', 'grid 辅轴对齐', this.properties.alignContent, function(v) {
      that.properties.alignContent = v;
      that._markDirty();
    }, {
      values: ['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']
    });

    this.addWidget('combo', '自动流', this.properties.gridAutoFlow, function(v) {
      that.properties.gridAutoFlow = v;
      that._markDirty();
    }, { values: ['row', 'column', 'dense', 'row dense', 'column dense'] });

    this.addWidget('text', '区域模板', this.properties.gridTemplateAreas, function(v) {
      that.properties.gridTemplateAreas = v;
      that._markDirty();
    });

    // 节点尺寸
    this.previewY = 380;
    this.size = [340, 440];
  }

  LayoutContainerNode.title = '📐 布局容器';
  LayoutContainerNode.desc = 'Flex/Grid 布局 · 方向/对齐/间距/内边距';

  LayoutContainerNode.prototype = Object.create(NodeBase.prototype);
  LayoutContainerNode.prototype.constructor = LayoutContainerNode;

  // =====================
  //  onExecute — 生成输出
  // =====================

  LayoutContainerNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    var p = this.properties;
    var css = {};
    var extra = {};

    if (p.display === 'flex') {
      // --- Flex 模式输出 ---
      css = {
        display: 'flex',
        flexDirection: p.flexDirection,
        justifyContent: p.justifyContent,
        alignItems: p.alignItems,
        gap: p.gap + p.gapUnit,
        flexWrap: p.flexWrap,
        padding: p.padding + p.gapUnit
      };
      extra.mode = 'flex';
    } else {
      // --- Grid 模式输出 ---
      css = {
        display: 'grid',
        gridTemplateColumns: p.gridTemplateColumns,
        gridTemplateRows: p.gridTemplateRows,
        gap: p.rowGap + p.gapUnit,
        rowGap: p.rowGap + p.gapUnit,
        columnGap: p.columnGap + p.gapUnit,
        justifyItems: p.justifyItems,
        alignItems: p.alignItems,
        justifyContent: p.gridJustifyContent,
        alignContent: p.alignContent,
        gridAutoFlow: p.gridAutoFlow
      };

      if (p.gridTemplateAreas && p.gridTemplateAreas.trim()) {
        css.gridTemplateAreas = p.gridTemplateAreas.trim();
      }

      extra.mode = 'grid';
    }

    // 如果上游传入额外信息，合并到 extra
    if (input && input.extra) {
      for (var k in input.extra) {
        if (input.extra.hasOwnProperty(k) && extra[k] === undefined) {
          extra[k] = input.extra[k];
        }
      }
    }

    this._lastOutput = this.buildOutput('layout', css, extra);
    this.setOutputData(0, this._lastOutput);
  };

  // =====================
  //  onDrawBackground — 预览
  // =====================

  LayoutContainerNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var p = this.properties;
    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = this.size[1] - y - 10;

    // 预览区域背景
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // 根据模式绘制不同预览
    if (p.display === 'grid') {
      this._drawGridPreview(ctx, x, y, w, h);
    } else {
      this._drawFlexPreview(ctx, x, y, w, h);
    }
  };

  // ---------- Flex 预览 ----------

  LayoutContainerNode.prototype._drawFlexPreview = function(ctx, x, y, w, h) {
    var isRow = this.properties.flexDirection === 'row';
    var gap = Math.min(this.properties.gap, 16);
    var boxCount = 3;
    var boxSize = 14;

    // 方向标注
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'flex-direction: ' + (isRow ? 'row  →' : 'column  ↓'),
      x + w / 2,
      y - 2
    );
    ctx.textAlign = 'left';

    var colors = ['#3B82F6', '#10B981', '#F59E0B'];

    if (isRow) {
      var totalW = boxCount * boxSize + (boxCount - 1) * gap;
      var startX = x + (w - totalW) / 2;
      var startY = y + (h - boxSize) / 2;

      for (var i = 0; i < boxCount; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.roundRect(startX + i * (boxSize + gap), startY, boxSize, boxSize, 3);
        ctx.fill();
      }
    } else {
      var totalH = boxCount * boxSize + (boxCount - 1) * gap;
      var startX2 = x + (w - boxSize) / 2;
      var startY2 = y + (h - totalH) / 2;

      for (var i2 = 0; i2 < boxCount; i2++) {
        ctx.fillStyle = colors[i2];
        ctx.beginPath();
        ctx.roundRect(startX2, startY2 + i2 * (boxSize + gap), boxSize, boxSize, 3);
        ctx.fill();
      }
    }
  };

  // ---------- Grid 预览 ----------

  LayoutContainerNode.prototype._drawGridPreview = function(ctx, x, y, w, h) {
    var cols = 3;
    var rows = 3;
    var gap = Math.min(this.properties.columnGap, 6);
    var cellSize = Math.min(
      (w - gap * (cols - 1) - 20) / cols,
      (h - gap * (rows - 1) - 20) / rows,
      18
    );

    if (cellSize < 4) return;

    var startX = x + (w - cols * cellSize - (cols - 1) * gap) / 2;
    var startY = y + (h - rows * cellSize - (rows - 1) * gap) / 2;

    var colors = [
      '#3B82F6', '#10B981', '#F59E0B',
      '#EF4444', '#8B5CF6', '#EC4899',
      '#06B6D4', '#84CC16', '#F97316'
    ];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        ctx.fillStyle = colors[idx % colors.length];
        ctx.beginPath();
        ctx.roundRect(
          startX + c * (cellSize + gap),
          startY + r * (cellSize + gap),
          cellSize, cellSize, 2
        );
        ctx.fill();
      }
    }

    // grid 信息标注
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'grid 3\xD73 \xB7 ' + this.properties.gridTemplateColumns,
      x + w / 2,
      y - 2
    );
    ctx.textAlign = 'left';
  };

  // =====================
  //  注册节点类型
  // =====================

  LiteGraph.registerNodeType('sill/layout-container', LayoutContainerNode);

  console.log('[LayoutContainer] 布局容器节点已注册');
})();
