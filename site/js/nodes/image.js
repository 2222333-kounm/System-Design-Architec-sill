/* ========================================
   图片节点 — 显示图片
   输入: input | 输出: image
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[ImageNode] NodeBase 未加载');
    return;
  }

  // =====================
  //  图片节点定义
  // =====================

  function ImageNode() {
    this.addInput('input', 'any');
    this.addOutput('image', 'image');

    this.properties = {
      url: '',
      objectFit: 'cover',
      repeat: 'no-repeat',
      backgroundColor: '#374151'
    };

    var that = this;

    // URL
    this.addWidget('text', 'URL', this.properties.url, function(v) {
      that.properties.url = v;
      that._loadImage();
      that._markDirty();
    });

    // 填充方式
    this.addWidget('combo', '填充', this.properties.objectFit, function(v) {
      that.properties.objectFit = v;
      that._markDirty();
    }, {
      values: ['cover', 'contain', 'fill', 'none', 'scale-down']
    });

    // 重复
    this.addWidget('combo', '重复', this.properties.repeat, function(v) {
      that.properties.repeat = v;
      that._markDirty();
    }, {
      values: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']
    });

    // 背景色
    this.addWidget('color', '背景色', this.properties.backgroundColor, function(v) {
      that.properties.backgroundColor = v;
      that._markDirty();
    });

    // 节点尺寸
    this.previewY = 180;
    this.size = [320, 280];

    // 图片缓存（用于画布预览绘制）
    this._cachedImage = null;
    this._cachedUrl = '';
  }

  ImageNode.title = '🖼️ 图片';
  ImageNode.desc = '图片显示 · URL/填充方式/重复/背景色';

  ImageNode.prototype = Object.create(NodeBase.prototype);
  ImageNode.prototype.constructor = ImageNode;

  /**
   * 加载图片到缓存（用于 onDrawBackground 预览绘制）
   */
  ImageNode.prototype._loadImage = function() {
    var url = this.properties.url && this.properties.url.trim();
    if (!url) {
      this._cachedImage = null;
      this._cachedUrl = '';
      return;
    }
    if (url === this._cachedUrl && this._cachedImage) return;

    var that = this;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      that._cachedImage = img;
      that._cachedUrl = url;
      that.setDirtyCanvas(true, true);
    };
    img.onerror = function() {
      console.warn('[ImageNode] 图片加载失败:', url);
      that._cachedImage = null;
      that._cachedUrl = '';
      that.setDirtyCanvas(true, true);
    };
    img.src = url;
  };

  /**
   * 节点执行 — 计算输出数据
   */
  ImageNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    var prevUrl = this.properties.url;

    // 如果上游传递了数据，同步更新属性
    if (input) {
      if (input.url) this.properties.url = input.url;
      if (input.objectFit) this.properties.objectFit = input.objectFit;
      if (input.repeat) this.properties.repeat = input.repeat;
      if (input.backgroundColor) this.properties.backgroundColor = input.backgroundColor;
    }

    // URL 变化时触发加载
    if (this.properties.url !== prevUrl) {
      this._loadImage();
    }

    var url = this.properties.url && this.properties.url.trim();
    var bgImage = url ? 'url(' + url + ')' : 'none';

    // 解析 Token 引用（如 var(--color-bg-tertiary)）
    var resolvedBg = this.properties.backgroundColor;
    if (window.TokenRef && typeof resolvedBg === 'string') {
      resolvedBg = window.TokenRef.resolve(resolvedBg);
    }

    this._lastOutput = this.buildOutput('image', {
      objectFit: this.properties.objectFit,
      backgroundRepeat: this.properties.repeat,
      backgroundColor: resolvedBg,
      backgroundImage: bgImage
    }, {
      alt: '',
      loading: 'lazy'
    });

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * 节点内绘制预览（图片预览区域）
   */
  ImageNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var x = 10;
    var y = this.previewY;
    var w = this.size[0] - 20;
    var h = 80;
    var url = this.properties.url && this.properties.url.trim();

    if (url && this._cachedImage) {
      // — 有图片：绘制背景色 + 实际图片 —
      ctx.fillStyle = this.properties.backgroundColor;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();

      // clip 到圆角区域
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.clip();

      // 根据 repeat 模式处理
      if (this.properties.repeat !== 'no-repeat') {
        var pattern = ctx.createPattern(this._cachedImage, this.properties.repeat);
        ctx.fillStyle = pattern;
        ctx.fillRect(x, y, w, h);
      } else {
        // 根据 objectFit 计算图片在预览区域中的位置
        var imgW = this._cachedImage.naturalWidth;
        var imgH = this._cachedImage.naturalHeight;
        var sx = x, sy = y, sw = w, sh = h;
        var aspect = imgW / imgH;
        var targetAspect = w / h;

        switch (this.properties.objectFit) {
          case 'cover':
            if (aspect > targetAspect) {
              sh = h;
              sw = h * aspect;
              sx = x - (sw - w) / 2;
            } else {
              sw = w;
              sh = w / aspect;
              sy = y - (sh - h) / 2;
            }
            break;
          case 'contain':
            if (aspect > targetAspect) {
              sw = w;
              sh = w / aspect;
              sy = y + (h - sh) / 2;
            } else {
              sh = h;
              sw = h * aspect;
              sx = x + (w - sw) / 2;
            }
            break;
          case 'fill':
            // 拉伸填充，无需偏移
            sw = w; sh = h;
            break;
          case 'none':
            sw = Math.min(imgW, w);
            sh = Math.min(imgH, h);
            sx = x + (w - sw) / 2;
            sy = y + (h - sh) / 2;
            break;
          case 'scale-down':
            var cw = Math.min(imgW, w);
            var ch = Math.min(imgH, h);
            var ca = cw / ch;
            if (ca > targetAspect) {
              sw = w;
              sh = w / ca;
            } else {
              sh = h;
              sw = h * ca;
            }
            sx = x + (w - sw) / 2;
            sy = y + (h - sh) / 2;
            break;
        }

        ctx.drawImage(this._cachedImage, sx, sy, sw, sh);
      }

      ctx.restore();
    } else if (url && !this._cachedImage) {
      // — 有 URL 但正在加载 —
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();

      ctx.fillStyle = '#6B7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('加载中...', this.size[0] / 2, y + h / 2 + 4);
      ctx.textAlign = 'left';
    } else {
      // — 无图片：绘制占位区域 —
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#6B7280';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🖼️', this.size[0] / 2, y + h / 2 - 6);
      ctx.font = '10px sans-serif';
      ctx.fillText('输入图片 URL', this.size[0] / 2, y + h / 2 + 18);
      ctx.textAlign = 'left';
    }

    // 底部属性标注
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var info = this.properties.objectFit + ' · ' + this.properties.repeat + ' · ' + this.properties.backgroundColor;
    if (url) {
      var shortUrl = url.length > 25 ? url.substring(0, 22) + '...' : url;
      info = shortUrl + ' · ' + info;
    }
    ctx.fillText(info, this.size[0] / 2, y + h + 16);
    ctx.textAlign = 'left';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/image', ImageNode);

  console.log('[ImageNode] 图片节点已注册');
})();
