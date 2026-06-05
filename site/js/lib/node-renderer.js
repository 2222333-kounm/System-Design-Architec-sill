/* ========================================
   Node Renderer — 节点 HTML 预览渲染器
   在 LiteGraph Canvas 上方叠加 DOM 元素,
   实现真实的图片/视频/按钮等预览效果
   ======================================== */

;(function() {
  'use strict';

  var NodeRenderer = window.NodeRenderer = {};

  var _overlays = {};  // nodeId → { div, lastPos }
  var _rafId = null;
  var _canvas = null;
  var _container = null;

  /**
   * 初始化渲染器
   * @param {HTMLElement} canvasEl - LiteGraph 的 canvas 元素
   * @param {HTMLElement} container - 画布容器（用于定位叠加层）
   */
  NodeRenderer.init = function(canvasEl, container) {
    _canvas = canvasEl;
    _container = container || canvasEl.parentElement;
  };

  /**
   * 注册节点的 HTML 预览内容生成器
   * @param {string} nodeType - 节点类型（如 'sill/color-block'）
   * @param {function} renderFn - (node) => HTMLElement | string | null
   */
  NodeRenderer.register = function(nodeType, renderFn) {
    _renderers[nodeType] = renderFn;
  };

  var _renderers = {};

  // ---- 内置渲染器 ----

  // 色块
  NodeRenderer.register('sill/color-block', function(node) {
    var p = node.properties;
    var div = document.createElement('div');
    div.style.cssText =
      'width:100%;height:100%;border-radius:' + (p.borderRadius || 0) + 'px;' +
      'background:' + (p.color || '#3B82F6') + ';' +
      'opacity:' + ((p.opacity || 100) / 100) + ';' +
      'display:flex;align-items:center;justify-content:center;' +
      'color:rgba(255,255,255,0.7);font-size:10px;font-family:monospace;';
    div.textContent = p.color + ' · ' + p.width + '×' + p.height;
    return div;
  });

  // 按钮
  NodeRenderer.register('sill/button', function(node) {
    var p = node.properties;
    var paddingMap = { xs: '4px 8px', sm: '8px 16px', md: '12px 24px', lg: '16px 32px', xl: '20px 40px' };
    var div = document.createElement('div');
    div.style.cssText =
      'display:inline-flex;align-items:center;justify-content:center;' +
      'padding:' + (paddingMap[p.padding] || '8px 16px') + ';' +
      'background:' + (p.color || '#0071E3') + ';' +
      'color:' + (p.textColor || '#FFFFFF') + ';' +
      'border-radius:' + (p.borderRadius || 980) + 'px;' +
      'border:none;cursor:pointer;font-size:' + (p.fontSize || 14) + 'px;' +
      'font-family:system-ui,sans-serif;white-space:nowrap;';
    div.textContent = p.text || '按钮';
    return div;
  });

  // 文字
  NodeRenderer.register('sill/text', function(node) {
    var p = node.properties;
    var div = document.createElement('div');
    div.style.cssText =
      'white-space:pre-wrap;word-break:break-word;overflow:hidden;' +
      'font-family:' + (p.fontFamily || 'sans-serif') + ';' +
      'font-size:' + (p.fontSize || 16) + (p.fontSizeUnit || 'px') + ';' +
      'font-weight:' + (p.fontWeight || 400) + ';' +
      'line-height:' + (p.lineHeight || 1.5) + ';' +
      'letter-spacing:' + (p.letterSpacing || 0) + 'em;' +
      'color:' + (p.color || '#E2E8F0') + ';' +
      'text-align:' + (p.textAlign || 'left') + ';' +
      'max-height:56px;';
    div.textContent = p.content || '文字预览';
    return div;
  });

  /**
   * 开始渲染循环
   */
  NodeRenderer.start = function() {
    if (_rafId) return;
    loop();
  };

  /**
   * 停止渲染循环
   */
  NodeRenderer.stop = function() {
    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
    clearOverlays();
  };

  function loop() {
    _rafId = requestAnimationFrame(function() {
      try { syncOverlays(); } catch(e) { /* silent */ }
      loop();
    });
  }

  function clearOverlays() {
    Object.keys(_overlays).forEach(function(id) {
      if (_overlays[id] && _overlays[id].div.parentNode) {
        _overlays[id].div.parentNode.removeChild(_overlays[id].div);
      }
    });
    _overlays = {};
  }

  /**
   * 同步所有叠加层位置
   */
  function syncOverlays() {
    if (!_canvas || !_container) return;
    var graph = Store.get('graph');
    if (!graph || !graph._nodes) return;

    var canvasRect = _canvas.getBoundingClientRect();
    var containerRect = _container.getBoundingClientRect();

    // 获取画布变换状态
    var ds = null;
    try {
      if (_canvas.lgraphcanvas) ds = _canvas.lgraphcanvas.ds;
    } catch(e) {}

    if (!ds) return;

    var scale = ds.scale || 1;
    var offsetX = ds.offset ? ds.offset[0] : 0;
    var offsetY = ds.offset ? ds.offset[1] : 0;

    var visibleIds = {};

    graph._nodes.forEach(function(node) {
      if (node.flags.collapsed) return;

      // 节点预览区域的位置（底部 60-80px）
      var nodeX = node.pos[0] * scale + offsetX;
      var nodeY = node.pos[1] * scale + offsetY + node.size[1] - 80;

      // 屏幕外裁剪
      if (nodeY + 80 < 0 || nodeY > containerRect.height) return;
      if (nodeX + node.size[0] * scale + 20 < 0 || nodeX > containerRect.width) return;

      var id = node.id;
      visibleIds[id] = true;

      var renderFn = _renderers[node.type];
      if (!renderFn) return;

      if (!_overlays[id]) {
        var overlay = document.createElement('div');
        overlay.className = 'node-renderer-overlay';
        overlay.style.cssText =
          'position:absolute;pointer-events:none;z-index:95;' +
          'overflow:hidden;display:flex;align-items:center;justify-content:center;';
        _container.appendChild(overlay);
        _overlays[id] = { div: overlay, lastPos: { x: -9999, y: -9999, w: 0, h: 0 } };
      }

      var ov = _overlays[id];
      var w = (node.size[0] - 24) * scale;
      var h = 70 * scale;
      var x = nodeX + 12 * scale;
      var y = nodeY;

      // 位置未变则不更新 DOM
      var lp = ov.lastPos;
      if (Math.abs(lp.x - x) < 1 && Math.abs(lp.y - y) < 1 && Math.abs(lp.w - w) < 1 && Math.abs(lp.h - h) < 1 && ov.lastContent) {
        return;
      }

      ov.div.style.left = x + 'px';
      ov.div.style.top = y + 'px';
      ov.div.style.width = w + 'px';
      ov.div.style.height = h + 'px';

      // 放大时调大字体
      var fontSizeScale = Math.max(0.7, Math.min(1.5, scale));
      ov.div.style.fontSize = (10 * fontSizeScale) + 'px';

      // 内容更新
      var content = renderFn(node);
      if (content !== ov.lastContent) {
        ov.div.innerHTML = '';
        if (content instanceof HTMLElement) {
          ov.div.appendChild(content);
        } else if (typeof content === 'string') {
          ov.div.innerHTML = content;
        }
        ov.lastContent = content;
      }

      lp.x = x; lp.y = y; lp.w = w; lp.h = h;
    });

    // 清理已移除节点的叠加层
    Object.keys(_overlays).forEach(function(id) {
      if (!visibleIds[id]) {
        if (_overlays[id].div.parentNode) {
          _overlays[id].div.parentNode.removeChild(_overlays[id].div);
        }
        delete _overlays[id];
      }
    });
  }

  /**
   * 强制刷新
   */
  NodeRenderer.refresh = function() {
    // 重置位置缓存，强制重绘
    Object.keys(_overlays).forEach(function(id) {
      _overlays[id].lastPos = { x: -9999, y: -9999, w: 0, h: 0 };
    });
  };

  console.log('[NodeRenderer] HTML 渲染器已加载');
})();
