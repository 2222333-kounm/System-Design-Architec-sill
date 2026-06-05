/* ========================================
   AI 扫描面板 — 浮动模态框
   结构化输出 · 去重检测 · 视图中心定位
   ======================================== */

;(function() {
  'use strict';

  var AIScanner = window.AIScanner = {};

  var _overlay = null;
  var _results = [];
  var _addedCount = 0;
  var _graph = null;

  // =====================
  //  扫描输出格式
  //  { type, name, value, suggestedNode }
  // =====================

  var MOCK_RESULTS = {
    default: [
      { type: 'color',      name: '主色调',     value: '#0071E3',    suggestedNode: 'sill/color-block' },
      { type: 'color',      name: '文字色',     value: '#1D1D1F',    suggestedNode: 'sill/color-block' },
      { type: 'color',      name: '背景色',     value: '#F5F5F7',    suggestedNode: 'sill/color-block' },
      { type: 'typography', name: 'Hero 标题',  value: '56px SF Pro', suggestedNode: 'sill/text' },
      { type: 'typography', name: '正文字号',   value: '17px SF Pro', suggestedNode: 'sill/text' },
      { type: 'button',     name: '主按钮样式', value: '胶囊 980px', suggestedNode: 'sill/button' },
      { type: 'layout',     name: 'Flex 布局',  value: 'center 居中', suggestedNode: 'sill/layout-container' },
      { type: 'spacing',    name: '内边距',     value: '16px',        suggestedNode: 'sill/spacing' },
      { type: 'breakpoint', name: '移动端断点', value: '734px',       suggestedNode: 'sill/breakpoint' }
    ]
  };

  // =====================
  //  创建面板 DOM
  // =====================

  function createPanel() {
    if (_overlay) return;

    _overlay = document.createElement('div');
    _overlay.className = 'ai-scan-overlay hidden';

    _overlay.innerHTML =
      '<div class="ai-scan-panel">' +
        '<div class="ai-scan-header">' +
          '<h2>🤖 AI 扫描</h2>' +
          '<button class="ai-scan-close" id="aiScanClose">✕</button>' +
        '</div>' +
        '<div class="ai-scan-body">' +
          '<div class="ai-scan-input-row">' +
            '<input type="text" id="aiScanUrl" placeholder="输入网页 URL…" value="">' +
            '<button class="ai-scan-btn" id="aiScanStart">扫描</button>' +
          '</div>' +
          '<div class="ai-scan-dropzone" id="aiScanDropzone">' +
            '<div class="ai-scan-dropzone-text">' +
              '<span class="icon">📁</span>' +
              '<span>拖放本地 HTML / CSS 文件到此处</span>' +
            '</div>' +
          '</div>' +
          '<div class="ai-scan-divider">或</div>' +
          '<div class="ai-scan-status idle" id="aiScanStatus">' +
            '<span>💡 输入 URL 或上传文件开始扫描</span>' +
          '</div>' +
          '<div class="ai-scan-results" id="aiScanResults"></div>' +
          '<input type="file" id="aiScanFileInput" accept=".html,.css,.htm" style="display:none">' +
        '</div>' +
        '<div class="ai-scan-footer">' +
          '<button class="ai-scan-btn-primary" id="aiScanAddAll">全部添加到画布</button>' +
          '<button class="ai-scan-btn-secondary" id="aiScanCancel">取消</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(_overlay);

    // 关闭
    _overlay.querySelector('#aiScanClose').addEventListener('click', closePanel);
    _overlay.querySelector('#aiScanCancel').addEventListener('click', closePanel);
    _overlay.addEventListener('click', function(e) {
      if (e.target === _overlay) closePanel();
    });

    // 扫描按钮
    _overlay.querySelector('#aiScanStart').addEventListener('click', startScan);
    _overlay.querySelector('#aiScanUrl').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') startScan();
    });

    // 文件拖放
    var dropzone = _overlay.querySelector('#aiScanDropzone');
    dropzone.addEventListener('click', function() {
      document.getElementById('aiScanFileInput').click();
    });
    dropzone.addEventListener('dragover', function(e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', function() {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    document.getElementById('aiScanFileInput').addEventListener('change', function(e) {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    document.getElementById('aiScanAddAll').addEventListener('click', addAllToCanvas);
  }

  // =====================
  //  面板开关
  // =====================

  AIScanner.open = function() {
    createPanel();
    _overlay.classList.remove('hidden');
    setTimeout(function() {
      var input = document.getElementById('aiScanUrl');
      if (input) input.focus();
    }, 100);
    setStatus('idle', '💡 输入 URL 或上传文件开始扫描');
    _results = [];
    _addedCount = 0;
    renderResults([]);
    updateAddAllButton();
  };

  function closePanel() {
    if (_overlay) _overlay.classList.add('hidden');
  }

  // =====================
  //  ID 生成
  // =====================

  function makeId(item, idx) {
    return item.suggestedNode + '-' + idx;
  }

  // =====================
  //  去重检测：遍历画布已有节点
  // =====================

  function detectAlreadyAdded(results) {
    if (!_graph || !_graph._nodes) return results;

    return results.map(function(item) {
      // 检查画布上是否已有同类节点
      var exists = _graph._nodes.some(function(n) {
        if (n.type !== item.suggestedNode) return false;

        // 色块节点 — 匹配颜色值
        if (item.suggestedNode === 'sill/color-block' && typeof item.value === 'string') {
          return n.properties && n.properties.color &&
            n.properties.color.toUpperCase() === item.value.toUpperCase();
        }
        // 文字节点 — 匹配内容包含
        if (item.suggestedNode === 'sill/text' && typeof item.value === 'string') {
          return n.properties && n.properties.content &&
            n.properties.content.indexOf(item.value) >= 0;
        }
        return false;
      });
      return { ...item, added: exists };
    });
  }

  // =====================
  //  扫描逻辑（模拟）
  // =====================

  function startScan() {
    var url = document.getElementById('aiScanUrl').value.trim();
    if (!url) {
      setStatus('idle', '⚠️ 请输入网页 URL');
      return;
    }
    setStatus('loading', '🔍 正在扫描 ' + url + ' …');

    setTimeout(function() {
      _results = MOCK_RESULTS.default.map(function(item, i) {
        return { id: makeId(item, i), ...item };
      });
      // 去重检测
      _results = detectAlreadyAdded(_results);
      _addedCount = _results.filter(function(r) { return r.added; }).length;

      var total = _results.length;
      var msg = _addedCount > 0
        ? '✅ 扫描完成 · 共 ' + total + ' 个元素（' + _addedCount + ' 个已在画布上）'
        : '✅ 扫描完成 · 共发现 ' + total + ' 个设计元素';
      setStatus('done', msg);
      renderResults(_results);
      updateAddAllButton();
    }, 1500);
  }

  function handleFile(file) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (['html', 'htm', 'css'].indexOf(ext) < 0) {
      setStatus('error', '❌ 不支持的文件格式: .' + ext + '（支持 html/htm/css）');
      return;
    }
    setStatus('loading', '🔍 正在分析 ' + file.name + ' …');

    setTimeout(function() {
      _results = MOCK_RESULTS.default.map(function(item, i) {
        return { id: makeId(item, i), ...item };
      });
      _results = detectAlreadyAdded(_results);
      _addedCount = _results.filter(function(r) { return r.added; }).length;
      setStatus('done', '✅ 分析完成 · 共发现 ' + _results.length + ' 个设计元素');
      renderResults(_results);
      updateAddAllButton();
    }, 1200);
  }

  // =====================
  //  状态 & 结果渲染
  // =====================

  function setStatus(type, text) {
    var el = document.getElementById('aiScanStatus');
    if (!el) return;
    el.className = 'ai-scan-status ' + type;
    if (type === 'loading') {
      el.innerHTML = '<div class="ai-scan-spinner"></div><span>' + text + '</span>';
    } else {
      el.innerHTML = '<span>' + text + '</span>';
    }
  }

  function renderResults(results) {
    var container = document.getElementById('aiScanResults');
    if (!container) return;
    if (!results || results.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = results.map(function(item) {
      var addedClass = item.added ? 'added' : '';
      var actionHtml = item.added
        ? '<span class="ai-scan-result-action added">✓ 已添加</span>'
        : '<span class="ai-scan-result-action add-btn" data-id="' + item.id + '">+ 添加</span>';

      var iconHtml = item.type === 'color'
        ? '<div class="ai-scan-result-icon color" style="background:' + item.value + '"></div>'
        : '<div class="ai-scan-result-icon">' + getIcon(item) + '</div>';

      var detailText = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);

      return '<div class="ai-scan-result-item ' + addedClass + '" data-id="' + item.id + '">' +
        iconHtml +
        '<div class="ai-scan-result-info">' +
          '<div class="ai-scan-result-name">' + getIcon(item) + ' ' + item.name + '</div>' +
          '<div class="ai-scan-result-desc"><span class="ai-scan-result-detail">' + detailText + '</span> · ' + item.type + '</div>' +
        '</div>' +
        actionHtml +
      '</div>';
    }).join('');

    container.querySelectorAll('.add-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        addSingleToCanvas(this.getAttribute('data-id'));
      });
    });
  }

  function getIcon(item) {
    var map = {
      'sill/color-block': '🎨',
      'sill/text': '📝',
      'sill/image': '🖼️',
      'sill/video': '🎬',
      'sill/button': '🔘',
      'sill/icon': '🔣',
      'sill/layout-container': '📐',
      'sill/spacing': '↔',
      'sill/instance': '♻',
      'sill/breakpoint': '📱',
      'sill/transform': '🔄',
      'sill/mask': '🎭',
      'sill/border': '📦',
      'sill/shadow': '💡',
      'sill/convert': '🔄',
      'sill/merge': '🗂️',
      'sill/global-token': '🌐'
    };
    return map[item.suggestedNode] || '📦';
  }

  function updateAddAllButton() {
    var btn = document.getElementById('aiScanAddAll');
    if (!btn) return;
    var unadded = _results.filter(function(r) { return !r.added; });
    btn.disabled = unadded.length === 0;
    btn.textContent = _results.length > 0
      ? '全部添加到画布（' + unadded.length + '）'
      : '全部添加到画布';
  }

  // =====================
  //  添加到画布（视图中心定位）
  // =====================

  function getCanvasCenter() {
    var canvasWrap = document.getElementById('canvasWrap');
    if (!canvasWrap) return { x: 400, y: 300, scale: 1 };

    var cw = canvasWrap.clientWidth;
    var ch = canvasWrap.clientHeight;

    var scale = 1;
    try {
      var canvasEl = canvasWrap.querySelector('canvas');
      if (canvasEl && canvasEl.lgraphcanvas) {
        scale = canvasEl.lgraphcanvas.ds.scale || 1;
      }
    } catch(e) {}

    return {
      x: cw / 2,
      y: ch / 2,
      scale: scale
    };
  }

  function addSingleToCanvas(id) {
    var item = _results.find(function(r) { return r.id === id; });
    if (!item || item.added) return;
    if (!_graph || !window.LiteGraph) return;

    var node = LiteGraph.createNode(item.suggestedNode);
    if (!node) return;

    // 视图中心 + 随机偏移（避免重叠）
    var center = getCanvasCenter();
    var offsetX = (Math.random() - 0.5) * 200;
    var offsetY = (Math.random() - 0.5) * 150;
    node.pos = [
      (center.x - 160 + offsetX) / center.scale,
      (center.y - 100 + offsetY) / center.scale
    ];

    // 预填值
    if (item.suggestedNode === 'sill/color-block' && typeof item.value === 'string') {
      node.properties.color = item.value;
    }
    if (item.suggestedNode === 'sill/text' && typeof item.value === 'string') {
      node.properties.content = item.name + ' · ' + item.value;
    }
    if (item.suggestedNode === 'sill/spacing' && typeof item.value === 'string') {
      var val = parseInt(item.value) || 16;
      node.properties.uniformValue = val;
    }
    if (item.suggestedNode === 'sill/breakpoint' && typeof item.value === 'string') {
      var w = parseInt(item.value) || 734;
      node.properties.customWidth = w;
    }

    _graph.add(node);
    if (_graph.onAfterChange) _graph.onAfterChange(_graph);

    // 标记
    item.added = true;
    _addedCount++;

    var total = _results.length;
    var statusEl = document.getElementById('aiScanStatus');
    if (statusEl && _addedCount < total) {
      setStatus('done', '✅ 已添加 ' + _addedCount + ' / ' + total + ' 个元素');
    }
    if (statusEl && _addedCount >= total) {
      setStatus('done', '✅ 所有元素已添加到画布');
    }

    renderResults(_results);
    updateAddAllButton();
  }

  function addAllToCanvas() {
    var unadded = _results.filter(function(r) { return !r.added; });
    unadded.forEach(function(item) {
      addSingleToCanvas(item.id);
    });
  }

  // =====================
  //  保存 graph 引用
  // =====================

  AIScanner.setGraph = function(graph) {
    _graph = graph;
    Store.set('scannerGraph', graph);
  };

  // 自动从 Store 获取 graph
  function getGraph() {
    return _graph || Store.get('graph');
  }

  console.log('[AIScanner] AI 扫描模块已加载（结构化输出 + 去重 + 视图中心定位）');
})();
