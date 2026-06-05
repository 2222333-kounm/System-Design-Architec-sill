/* ========================================
   编辑器初始化 — 挂载引擎 · 注册节点 · 绑定UI · 预览联动
   ======================================== */

;(function() {
  'use strict';

  var canvasWrap = document.getElementById('canvasWrap');
  var previewBody = document.getElementById('previewBody');
  var statusEl = document.getElementById('statusDisplay');
  var zoomLabel = document.getElementById('zoomLabel');

  if (!canvasWrap) {
    console.error('[EditorInit] 画布容器未找到');
    return;
  }

  // =====================
  //  预览更新函数
  // =====================

  function updatePreview(outputData) {
    if (!outputData) {
      previewBody.innerHTML =
        '<div class="preview-empty">' +
        '<div class="preview-empty-icon">🔌</div>' +
        '<div>连接节点到「输出」节点开始预览</div>' +
        '</div>';
      return;
    }

    var html = '';

    try {
      var data = outputData;

      // 错误状态
      if (data.type === 'error') {
        previewBody.innerHTML =
          '<div class="preview-error">❌ ' + (data.message || '未知错误') + '</div>';
        return;
      }

      // 有 CSS 数据
      if (data && data.css) {
        var styleStr = '';
        Object.keys(data.css).forEach(function(k) {
          var v = data.css[k];
          if (v !== undefined && v !== null && v !== '') {
            styleStr += k + ':' + v + ';';
          }
        });

        // 有子元素（堆叠模式）
        if (data.children && Array.isArray(data.children)) {
          var childHtml = data.children.map(function(child) {
            var cs = '';
            Object.keys(child).forEach(function(k) {
              var v = child[k];
              if (v !== undefined && v !== null && v !== '') cs += k + ':' + v + ';';
            });
            return '<div style="' + cs + '"></div>';
          }).join('\n');
          html = '<div class="preview-content" style="position:relative;">' + childHtml + '</div>';
        } else {
          // 普通 CSS 渲染
          var content = data.content || '';
          if (data.type === 'color') {
            // 色块预览 - 居中展示
            html = '<div style="width:100%;display:flex;align-items:center;justify-content:center;min-height:150px;">' +
              '<div style="' + styleStr + 'display:flex;align-items:center;justify-content:center;"></div></div>';
          } else {
            html = '<div class="preview-content" style="' + styleStr + '">' + content + '</div>';
          }
        }

        previewBody.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:auto;">' + html + '</div>';

      } else if (typeof data === 'string') {
        html = '<div class="preview-content">' + data + '</div>';
        previewBody.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:auto;">' + html + '</div>';

      } else {
        // 无法预览
        previewBody.innerHTML = '<div style="text-align:center;color:#4B5563;font-size:12px;padding:20px;">无法预览此数据类型</div>';
      }

    } catch(e) {
      previewBody.innerHTML = '<div class="preview-error">❌ 渲染错误: ' + e.message + '</div>';
    }
  }

  // =====================
  //  状态更新
  // =====================

  function updateStatus() {
    var count = engine.graph._nodes ? engine.graph._nodes.length : 0;
    if (statusEl) statusEl.textContent = count + ' 个节点';
  }

  // =====================
  //  初始化引擎
  // =====================

  var engine = EditorEngine.init(canvasWrap, {
    onOutputChange: function(data) {
      updatePreview(data);
    }
  });

  // 状态跟踪
  engine.graph.onAfterChange = function() {
    updateStatus();
    EditorEngine._updatePreview(engine.graph, updatePreview);
  };
  updateStatus();

  // =====================
  //  缩放控件
  // =====================

  function updateZoomLabel() {
    if (engine.canvas && zoomLabel) {
      zoomLabel.textContent = Math.round(engine.canvas.ds.scale * 100) + '%';
    }
  }

  var zoomInBtn = document.getElementById('zoomInBtn');
  var zoomOutBtn = document.getElementById('zoomOutBtn');
  var resetViewBtn = document.getElementById('resetViewBtn');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      engine.canvas.ds.scale *= 1.3;
      engine.canvas.setDirty(true, true);
      updateZoomLabel();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      engine.canvas.ds.scale /= 1.3;
      engine.canvas.setDirty(true, true);
      updateZoomLabel();
    });
  }

  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', function() {
      var nodes = engine.graph._nodes;
      if (nodes && nodes.length) {
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(function(n) {
          minX = Math.min(minX, n.pos[0] - 50);
          minY = Math.min(minY, n.pos[1] - 50);
          maxX = Math.max(maxX, n.pos[0] + n.size[0] + 50);
          maxY = Math.max(maxY, n.pos[1] + n.size[1] + 50);
        });
        var cw = canvasWrap.clientWidth, ch = canvasWrap.clientHeight;
        if (maxX > minX && maxY > minY && cw > 0 && ch > 0) {
          var fs = Math.min(cw / (maxX - minX), ch / (maxY - minY), 1) * 0.85;
          var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
          engine.canvas.setZoom(fs);
          engine.canvas.setOffset(cw / 2 - cx * fs, ch / 2 - cy * fs);
        }
      }
      updateZoomLabel();
    });
  }

  // =====================
  //  快捷键
  // =====================

  EditorEngine.bindShortcuts(engine.canvas, engine.graph, {
    onSave: function() { EditorEngine.saveToFile(engine.graph); },
    onLoad: function() { EditorEngine.loadFromFile(engine.graph, function(err) {
      if (err) alert('加载失败: ' + err.message);
      else { updateStatus(); updatePreview(null); }
    }); }
  });

  // =====================
  //  Ctrl+E 折叠/展开选中节点
  // =====================

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      if (!engine.canvas) return;
      var selected = engine.canvas.selected_nodes;
      if (!selected) return;
      Object.keys(selected).forEach(function(id) {
        var node = engine.graph.getNodeById(parseInt(id));
        if (!node) return;
        if (node.flags.collapsed) {
          // 展开
          node.flags.collapsed = false;
          node.setSize(node._fullSize || node.size);
        } else {
          // 折叠
          node._fullSize = node.size;
          node.flags.collapsed = true;
          node.setSize([node.size[0], 60]); // 仅显示标题的最小高度
        }
        node.setDirtyCanvas(true, true);
      });
    }
  });

  // =====================
  //  Space + 拖拽平移（无限画布）
  // =====================

  var _spaceHeld = false;
  var _spacePanning = false;
  var _panStartX, _panStartY;
  var _panOffsetX, _panOffsetY;

  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !e.repeat && !_spaceHeld) {
      _spaceHeld = true;
      e.preventDefault();
      document.body.style.cursor = 'grab';
    }
  });

  document.addEventListener('keyup', function(e) {
    if (e.code === 'Space') {
      _spaceHeld = false;
      _spacePanning = false;
      document.body.style.cursor = '';
    }
  });

  var canvasEl = canvasWrap.querySelector('canvas');
  if (canvasEl) {
    canvasEl.addEventListener('mousedown', function(e) {
      if (_spaceHeld && e.button === 0) {
        _spacePanning = true;
        _panStartX = e.clientX;
        _panStartY = e.clientY;
        if (engine.canvas && engine.canvas.ds) {
          _panOffsetX = engine.canvas.ds.offset[0];
          _panOffsetY = engine.canvas.ds.offset[1];
        }
        document.body.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', function(e) {
      if (_spacePanning && engine.canvas && engine.canvas.ds) {
        var dx = e.clientX - _panStartX;
        var dy = e.clientY - _panStartY;
        engine.canvas.ds.offset[0] = _panOffsetX + dx;
        engine.canvas.ds.offset[1] = _panOffsetY + dy;
        engine.canvas.setDirty(true, true);
      }
    });

    window.addEventListener('mouseup', function() {
      _spacePanning = false;
      document.body.style.cursor = _spaceHeld ? 'grab' : '';
    });
  }

  // =====================
  //  工具栏按钮
  // =====================

  var saveBtn = document.getElementById('saveBtn');
  var loadBtn = document.getElementById('loadBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      EditorEngine.saveToFile(engine.graph);
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', function() {
      EditorEngine.loadFromFile(engine.graph, function(err) {
        if (err) alert('加载失败: ' + err.message);
        else { updateStatus(); EditorEngine._updatePreview(engine.graph, updatePreview); }
      });
    });
  }

  // AI 扫描按钮
  var aiBtn = document.getElementById('aiScanBtn');
  if (aiBtn && window.AIScanner) {
    aiBtn.addEventListener('click', function() {
      AIScanner.setGraph(engine.graph);
      AIScanner.open();
    });
  }

  // 复制 HTML
  var copyBtn = document.getElementById('copyHtmlBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var contentEl = previewBody.querySelector('.preview-content');
      if (contentEl) {
        navigator.clipboard.writeText(contentEl.outerHTML).then(function() {
          copyBtn.textContent = '✅';
          setTimeout(function() { copyBtn.textContent = '📋'; }, 2000);
        });
      }
    });
  }

  // =====================
  //  可拖拽分隔线
  // =====================

  var divider = document.getElementById('editorDivider');
  var previewPanel = document.getElementById('previewPanel');

  if (divider && previewPanel) {
    var isDragging = false;

    divider.addEventListener('mousedown', function(e) {
      isDragging = true;
      divider.classList.add('active');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var totalWidth = document.body.clientWidth;
      var previewWidth = totalWidth - e.clientX;
      // 限制最小/最大宽度
      previewWidth = Math.max(280, Math.min(600, previewWidth));
      previewPanel.style.width = previewWidth + 'px';
      // 触发画布 resize
      if (engine.canvas) {
        var cw = canvasWrap.clientWidth;
        var ch = canvasWrap.clientHeight;
        var canvasEl = engine.canvas.canvas;
        if (canvasEl && cw > 0 && ch > 0) {
          canvasEl.width = cw;
          canvasEl.height = ch;
          engine.canvas.setSize(cw, ch);
          engine.canvas.draw(true);
        }
      }
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        divider.classList.remove('active');
      }
    });
  }

  // =====================
  //  右键菜单（中文分组）
  // =====================

  var c = engine.canvas;
  if (c) {
    c.onShowCustomMenu = function(options, e) {
      showContextMenu(e.clientX, e.clientY);
      return true;
    };
  }

  var LABEL_MAP = {
    'sill/color-block': '🎨 色块',
    'sill/text': '📝 文字',
    'sill/image': '🖼️ 图片',
    'sill/video': '🎬 视频',
    'sill/button': '🔘 按钮',
    'sill/icon': '🔣 图标',
    'sill/layout-container': '📐 布局容器',
    'sill/spacing': '↔ 间距',
    'sill/instance': '♻ 组件实例',
    'sill/breakpoint': '📱 断点',
    'sill/transform': '🔄 变换',
    'sill/mask': '🎭 蒙版',
    'sill/border': '📦 边框',
    'sill/shadow': '💡 阴影',
    'sill/mouse-follow': '🖱️ 鼠标跟随',
    'sill/transition': '✨ 转场',
    'sill/convert': '🔄 转换',
    'sill/merge': '🗂️ 合并',
    'sill/global-token': '🌐 全局 Token',
    'sill/output': '📤 输出'
  };

  function showContextMenu(x, y) {
    var existing = document.getElementById('custom-context-menu');
    if (existing) existing.remove();

    var menu = document.createElement('div');
    menu.id = 'custom-context-menu';
    menu.style.cssText =
      'position:fixed;z-index:99999;background:rgba(22,24,30,0.97);' +
      'backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);' +
      'border-radius:12px;padding:6px 0;min-width:160px;' +
      'box-shadow:0 16px 40px rgba(0,0,0,0.5);font-size:12px;';

    // 注册的节点类型（按分组显示）
    var groups = {
      '基础组件': ['sill/color-block', 'sill/text', 'sill/image', 'sill/video', 'sill/button', 'sill/icon'],
      '布局 & 结构': ['sill/layout-container', 'sill/spacing', 'sill/instance', 'sill/breakpoint'],
      '变换 & 特效': ['sill/transform', 'sill/mask', 'sill/border', 'sill/shadow', 'sill/mouse-follow', 'sill/transition'],
      '工具 & 全局': ['sill/convert', 'sill/merge', 'sill/global-token', 'sill/output']
    };

    var first = true;
    Object.keys(groups).forEach(function(groupName) {
      if (!first) {
        var sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.06);margin:4px 12px;';
        menu.appendChild(sep);
      }
      first = false;

      var header = document.createElement('div');
      header.style.cssText = 'color:#6B7280;font-size:10px;padding:4px 14px 2px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;';
      header.textContent = groupName;
      menu.appendChild(header);

      groups[groupName].forEach(function(type) {
        var displayName = LABEL_MAP[type] || type.replace('sill/', '');
        var item = document.createElement('div');
        item.style.cssText =
          'display:flex;align-items:center;gap:8px;padding:5px 14px;' +
          'cursor:pointer;color:#D1D5DB;transition:background 0.1s;';
        item.innerHTML = displayName;
        item.addEventListener('mouseenter', function() { this.style.background = 'rgba(255,255,255,0.06)'; });
        item.addEventListener('mouseleave', function() { this.style.background = ''; });
        item.addEventListener('click', function() {
          menu.remove();
          addNodeToCanvas(type);
        });
        menu.appendChild(item);
      });
    });

    var mx = Math.min(x, window.innerWidth - 180);
    var my = Math.min(y, window.innerHeight - 200);
    menu.style.left = mx + 'px';
    menu.style.top = my + 'px';
    document.body.appendChild(menu);

    function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('contextmenu', closeMenu);
      }
    }
    setTimeout(function() {
      document.addEventListener('click', closeMenu);
      document.addEventListener('contextmenu', closeMenu);
    }, 10);
  }

  function addNodeToCanvas(type) {
    var viewport = canvasWrap;
    var cx = viewport ? viewport.clientWidth / 2 : 400;
    var cy = viewport ? viewport.clientHeight / 2 : 300;
    var currentScale = 1;
    try { currentScale = engine.canvas.ds.scale || 1; } catch(e) {}
    var posX = (cx - 160 + Math.random() * 80) / currentScale;
    var posY = (cy - 100 + Math.random() * 80) / currentScale;

    var node = LiteGraph.createNode(type);
    if (node) {
      node.pos = [posX, posY];
      engine.graph.add(node);
      engine.graph.onAfterChange(engine.graph);
    }
  }

  console.log('[EditorInit] 编辑器初始化完成');
})();
