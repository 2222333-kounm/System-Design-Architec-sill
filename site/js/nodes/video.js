/* ========================================
   视频节点 — 视频嵌入
   输入: input | 输出: video
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[VideoNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  视频节点定义
  // =====================

  function VideoNode() {
    this.addInput('input', 'any');
    this.addOutput('video', 'video');

    this.properties = {
      url: '',
      aspectRatio: '16:9',   // 16:9 / 4:3 / 1:1 / 9:16 / 自定义
      autoplay: true,
      loop: true,
      muted: false,
      controls: true,
      poster: ''
    };

    var that = this;

    // URL
    this.addWidget('text', 'URL', this.properties.url, function(v) {
      that.properties.url = v;
      that._markDirty();
    });

    // 宽高比
    this.addWidget('combo', '宽高比', this.properties.aspectRatio, function(v) {
      that.properties.aspectRatio = v;
      that._markDirty();
    }, {
      values: ['16:9', '4:3', '1:1', '9:16', '自定义']
    });

    // 自动播放
    this.addWidget('toggle', '自动播放', this.properties.autoplay, function(v) {
      that.properties.autoplay = v;
      that._markDirty();
    });

    // 循环
    this.addWidget('toggle', '循环', this.properties.loop, function(v) {
      that.properties.loop = v;
      that._markDirty();
    });

    // 静音
    this.addWidget('toggle', '静音', this.properties.muted, function(v) {
      that.properties.muted = v;
      that._markDirty();
    });

    // 控件
    this.addWidget('toggle', '控件', this.properties.controls, function(v) {
      that.properties.controls = v;
      that._markDirty();
    });

    // 封面图
    this.addWidget('text', '封面', this.properties.poster, function(v) {
      that.properties.poster = v;
      that._markDirty();
    });

    // 节点尺寸
    this.previewY = 200;
    this.size = [320, 340];
  }

  VideoNode.title = '🎬 视频';
  VideoNode.desc = '视频嵌入 · URL/宽高比/自动播放/循环/静音/控件/封面';

  VideoNode.prototype = Object.create(NodeBase.prototype);
  VideoNode.prototype.constructor = VideoNode;

  /**
   * 宽高比字符串映射为 CSS aspect-ratio 值
   */
  function mapAspectRatio(ratio) {
    var map = {
      '16:9': '16/9',
      '4:3': '4/3',
      '1:1': '1/1',
      '9:16': '9/16'
    };
    return map[ratio] || 'auto';
  }

  /**
   * 宽高比字符串解析为数值 (w/h)，用于预览绘制
   */
  function parseAspectRatio(ratio) {
    var parts = ratio.split(':');
    if (parts.length === 2) {
      var rw = parseFloat(parts[0]);
      var rh = parseFloat(parts[1]);
      if (rw > 0 && rh > 0) return rw / rh;
    }
    return 16 / 9; // 默认 16:9
  }

  /**
   * 节点执行 — 计算输出数据
   */
  VideoNode.prototype.onExecute = function() {
    var input = this.getInputData(0);

    // 如果上游传递了数据，同步更新属性
    if (input) {
      if (input.url) this.properties.url = input.url;
      if (input.aspectRatio) this.properties.aspectRatio = input.aspectRatio;
      if (input.autoplay !== undefined) this.properties.autoplay = input.autoplay;
      if (input.loop !== undefined) this.properties.loop = input.loop;
      if (input.muted !== undefined) this.properties.muted = input.muted;
      if (input.controls !== undefined) this.properties.controls = input.controls;
      if (input.poster) this.properties.poster = input.poster;
    }

    var url = this.properties.url && this.properties.url.trim();
    var poster = this.properties.poster && this.properties.poster.trim();

    this._lastOutput = this.buildOutput('video', {
      aspectRatio: mapAspectRatio(this.properties.aspectRatio)
    }, {
      src: url || '',
      autoplay: this.properties.autoplay,
      loop: this.properties.loop,
      muted: this.properties.muted,
      controls: this.properties.controls,
      poster: poster || ''
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（视频占位区域 + 播放按钮）
   */
  VideoNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;

    // 根据宽高比计算预览区域高度
    var aspect = parseAspectRatio(this.properties.aspectRatio);
    var previewH = w / aspect;
    previewH = Math.min(previewH, 200); // 最大高度限制
    previewH = Math.max(previewH, 80);  // 最小高度保障

    // — 视频播放器占位背景 —
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, previewH, 8);
    ctx.fill();

    // 边框
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, previewH, 8);
    ctx.stroke();

    // — 播放按钮 (圆圈 + 三角形) —
    var centerX = this.size[0] / 2;
    var centerY = y + previewH / 2;

    // 半透明背景环
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();

    // 白色圆圈
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.fill();

    // 三角形播放图标
    var triH = 12;
    var triW = 10;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(centerX - triW * 0.4, centerY - triH * 0.6);
    ctx.lineTo(centerX - triW * 0.4, centerY + triH * 0.6);
    ctx.lineTo(centerX + triW * 0.7, centerY);
    ctx.closePath();
    ctx.fill();

    // — URL / 提示信息 —
    var url = this.properties.url && this.properties.url.trim();
    ctx.textAlign = 'center';

    if (url) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px monospace';
      var shortUrl = url.length > 28 ? url.substring(0, 25) + '...' : url;
      ctx.fillText(shortUrl, this.size[0] / 2, y + previewH + 14);
    } else {
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px sans-serif';
      ctx.fillText('输入视频 URL', this.size[0] / 2, y + previewH + 14);
    }

    // — 属性信息栏 —
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    var info = this.properties.aspectRatio + ' · ' +
      (this.properties.autoplay ? '▶ 自动' : '▐▐ 手动') + ' · ' +
      (this.properties.loop ? '⟳ 循环' : '→ 单次') + ' · ' +
      (this.properties.muted ? '🔇 静音' : '🔊 有声') + ' · ' +
      (this.properties.controls ? '☰ 控件' : '');
    ctx.fillText(info, this.size[0] / 2, y + previewH + 30);

    // 封面图提示（如有）
    var poster = this.properties.poster && this.properties.poster.trim();
    if (poster) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '9px sans-serif';
      var shortPoster = poster.length > 22 ? poster.substring(0, 19) + '...' : poster;
      ctx.fillText('封面: ' + shortPoster, this.size[0] / 2, y + previewH - 8);
    }

    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/video', VideoNode);

  console.log('[VideoNode] 视频节点已注册');
})();
