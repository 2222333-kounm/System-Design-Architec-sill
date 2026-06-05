/* ========================================
   Port Labels — 端口名称标签叠加层
   在 LiteGraph 端口上叠加 DOM 标签,
   显示端口名和类型颜色标识
   ======================================== */

;(function() {
  'use strict';

  var PortLabels = window.PortLabels = {};

  var _labels = {};
  var _rafId = null;
  var _canvas = null;
  var _container = null;

  // 端口类型颜色
  var TYPE_COLORS = {
    color: '#3B82F6',
    image: '#10B981',
    text: '#8B5CF6',
    css: '#F59E0B',
    interactive: '#EC4899',
    number: '#06B6D4',
    any: '#6B7280',
    layout: '#3B82F6',
    video: '#EF4444',
    responsive: '#10B981',
    instance: '#8B5CF6',
    merged: '#F59E0B',
    tokens: '#10B981',
    masked: '#10B981'
  };

  PortLabels.init = function(canvasEl, container) {
    _canvas = canvasEl;
    _container = container || canvasEl.parentElement;
  };

  PortLabels.start = function() {
    if (_rafId) return;
    loop();
  };

  PortLabels.stop = function() {
    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
    clearLabels();
  };

  function loop() {
    _rafId = requestAnimationFrame(function() {
      try { syncLabels(); } catch(e) { /* silent */ }
      loop();
    });
  }

  function clearLabels() {
    Object.keys(_labels).forEach(function(key) {
      if (_labels[key] && _labels[key].parentNode) {
        _labels[key].parentNode.removeChild(_labels[key]);
      }
    });
    _labels = {};
  }

  function syncLabels() {
    if (!_canvas || !_container) return;
    var graph = Store.get('graph');
    if (!graph || !graph._nodes) return;

    var ds = null;
    try {
      if (_canvas.lgraphcanvas) ds = _canvas.lgraphcanvas.ds;
    } catch(e) {}
    if (!ds) return;

    var scale = ds.scale || 1;
    var offsetX = ds.offset ? ds.offset[0] : 0;
    var offsetY = ds.offset ? ds.offset[1] : 0;
    var containerRect = _container.getBoundingClientRect();

    var visibleKeys = {};

    graph._nodes.forEach(function(node) {
      if (node.flags.collapsed) return;

      var nodeX = node.pos[0] * scale + offsetX;
      var nodeY = node.pos[1] * scale + offsetY;

      // 屏幕外裁剪
      if (nodeX + node.size[0] * scale < -100 || nodeX > containerRect.width + 100) return;
      if (nodeY + node.size[1] * scale < -100 || nodeY > containerRect.height + 100) return;

      // 输入端口标签（左侧）
      if (node.inputs) {
        node.inputs.forEach(function(input, slot) {
          var portY = getPortY(node, slot, 'input', scale);
          var key = node.id + '-in-' + slot;
          visibleKeys[key] = true;
          var labelEl = getOrCreateLabel(key, input, 'input');
          positionLabel(labelEl, nodeX - 8, nodeY + portY, 'right', scale);
        });
      }

      // 输出端口标签（右侧）
      if (node.outputs) {
        node.outputs.forEach(function(output, slot) {
          var portY = getPortY(node, slot, 'output', scale);
          var key = node.id + '-out-' + slot;
          visibleKeys[key] = true;
          var labelEl = getOrCreateLabel(key, output, 'output');
          positionLabel(labelEl, nodeX + node.size[0] * scale + 8, nodeY + portY, 'left', scale);
        });
      }
    });

    // 清理
    Object.keys(_labels).forEach(function(key) {
      if (!visibleKeys[key]) {
        if (_labels[key].parentNode) _labels[key].parentNode.removeChild(_labels[key]);
        delete _labels[key];
      }
    });
  }

  /**
   * 计算端口在节点内的 Y 偏移（像素）
   */
  function getPortY(node, slot, dir, scale) {
    // LiteGraph 默认端口布局: 标题行 ~30px, 每个端口间隔 ~24px
    var titleHeight = 30;
    var slotGap = 24;
    var y = titleHeight + slot * slotGap + 4;
    return y * scale;
  }

  function getOrCreateLabel(key, port, dir) {
    if (_labels[key]) return _labels[key];

    var el = document.createElement('div');
    el.className = 'port-label-overlay';
    el.style.cssText =
      'position:absolute;z-index:96;pointer-events:none;' +
      'white-space:nowrap;display:flex;align-items:center;gap:4px;' +
      'font-family:monospace;';

    // 颜色圆点
    var dot = document.createElement('span');
    var type = port.type || 'any';
    var color = TYPE_COLORS[type] || '#6B7280';
    dot.style.cssText =
      'display:inline-block;width:8px;height:8px;border-radius:50%;' +
      'background:' + color + ';box-shadow:0 0 0 2px rgba(255,255,255,0.05);';

    // 端口名
    var nameSpan = document.createElement('span');
    var displayName = port.name || type;
    nameSpan.textContent = displayName;
    nameSpan.style.cssText = 'color:#94A3B8;font-size:9px;text-shadow:0 1px 4px rgba(0,0,0,0.6);';

    if (dir === 'input') {
      el.appendChild(dot);
      el.appendChild(nameSpan);
    } else {
      el.appendChild(nameSpan);
      el.appendChild(dot);
    }

    _container.appendChild(el);
    _labels[key] = el;
    return el;
  }

  function positionLabel(el, x, y, anchor, scale) {
    var fontSize = Math.max(8, Math.min(12, 10 * scale));
    el.style.fontSize = fontSize + 'px';
    el.style.top = (y - fontSize) + 'px';

    if (anchor === 'right') {
      el.style.left = (x + 4) + 'px';
      el.style.transform = 'translateY(-50%)';
    } else {
      el.style.left = (x + 4) + 'px';
      el.style.transform = 'translateY(-50%)';
    }
  }

  PortLabels.refresh = function() {
    clearLabels();
  };

  console.log('[PortLabels] 端口标签层已加载');
})();
