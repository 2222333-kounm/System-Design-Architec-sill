/* ========================================
   AI 扫描面板 — 浮动模态框
   URL/文件扫描 · 结果列表 · 添加到画布
   ======================================== */

;(function() {
  'use strict';

  var AIScanner = window.AIScanner = {};

  var _overlay = null;
  var _results = [];
  var _addedCount = 0;

  // =====================
  //  模拟扫描数据（无后端时用）
  // =====================

  var MOCK_RESULTS = {
    default: [
      { type: 'color',    label: '主色调',       detail: '#0071E3',    nodeType: 'sill/color-block', icon: '🎨' },
      { type: 'color',    label: '文字色',       detail: '#1D1D1F',    nodeType: 'sill/color-block', icon: '🎨' },
      { type: 'color',    label: '背景色',       detail: '#F5F5F7',    nodeType: 'sill/color-block', icon: '🎨' },
      { type: 'typography', label: 'Hero 标题',  detail: '56px SF Pro', nodeType: 'sill/text',       icon: '📝' },
      { type: 'typography', label: '正文字号',   detail: '17px SF Pro', nodeType: 'sill/text',       icon: '📝' },
      { type: 'button',   label: '主按钮样式',   detail: '胶囊 980px', nodeType: 'sill/button',     icon: '🔘' },
      { type: 'layout',   label: 'Flex 布局',    detail: 'center 居中', nodeType: 'sill/layout-container', icon: '📐' },
      { type: 'spacing',  label: '内边距',       detail: '16px',       nodeType: 'sill/spacing',    icon: '↔' },
      { type: 'breakpoint', label: '移动端断点', detail: '734px',      nodeType: 'sill/breakpoint', icon: '📱' }
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

    // ---- 绑定事件 ----

    // 关闭按钮
    _overlay.querySelector('#aiScanClose').addEventListener('click', closePanel);
    _overlay.querySelector('#aiScanCancel').addEventListener('click', closePanel);

    // 点击遮罩关闭
    _overlay.addEventListener('click', function(e) {
      if (e.target === _overlay) closePanel();
    });

    // 扫描按钮
    _overlay.querySelector('#aiScanStart').addEventListener('click', startScan);

    // URL 输入框回车触发扫描
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
      var files = e.dataTransfer.files;
      if (files.length > 0) handleFile(files[0]);
    });

    // 文件选择
    _overlay.querySelector('#aiScanFileInput').addEventListener('change', function(e) {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // 全部添加
    _overlay.querySelector('#aiScanAddAll').addEventListener('click', addAllToCanvas);
  }

  // =====================
  //  面板开关
  // =====================

  AIScanner.open = function() {
    createPanel();
    _overlay.classList.remove('hidden');
    // 聚焦输入框
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
    if (_overlay) {
      _overlay.classList.add('hidden');
    }
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
    // 模拟扫描
    setStatus('loading', '🔍 正在扫描 ' + url + ' …');
    _results = [];
    _addedCount = 0;
    renderResults([]);
    updateAddAllButton();

    setTimeout(function() {
      // 扫描完成 — 用模拟数据
      _results = MOCK_RESULTS.default.map(function(item, i) {
        return { id: 'r' + i, added: false, ...item };
      });
      setStatus('done', '✅ 扫描完成 · 共发现 ' + _results.length + ' 个设计元素');
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
        return { id: 'r' + i, added: false, ...item };
      });
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
        ? '<div class="ai-scan-result-icon color" style="background:' + item.detail + '"></div>'
        : '<div class="ai-scan-result-icon">' + item.icon + '</div>';

      return '<div class="ai-scan-result-item ' + addedClass + '" data-id="' + item.id + '">' +
        iconHtml +
        '<div class="ai-scan-result-info">' +
          '<div class="ai-scan-result-name">' + item.icon + ' ' + item.label + '</div>' +
          '<div class="ai-scan-result-desc"><span class="ai-scan-result-detail">' + item.detail + '</span> · ' + item.type + '</div>' +
        '</div>' +
        actionHtml +
      '</div>';
    }).join('');

    // 绑定单个添加
    container.querySelectorAll('.add-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        addSingleToCanvas(id);
      });
    });
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
  //  添加到画布
  // =====================

  function addSingleToCanvas(id) {
    var item = _results.find(function(r) { return r.id === id; });
    if (!item || item.added) return;

    var canvasWrap = document.getElementById('canvasWrap');
    if (!canvasWrap || !window.LiteGraph) return;

    var node = LiteGraph.createNode(item.nodeType);
    if (!node) return;

    // 找编辑器引擎的 graph
    var engine = window.EditorEngine;
    var graph = null;
    // 尝试从 canvasWrap 上挂载的引用获取
    if (canvasWrap._editorGraph) {
      graph = canvasWrap._editorGraph;
    }

    if (!graph) return;

    // 随机位置偏移
    var cx = canvasWrap.clientWidth / 2 + (Math.random() - 0.5) * 200;
    var cy = canvasWrap.clientHeight / 2 + (Math.random() - 0.5) * 200;
    var scale = 1;
    try {
      // try to find canvas instance
      var canvasEl = canvasWrap.querySelector('canvas');
      if (canvasEl && canvasEl.lgraphcanvas) {
        scale = canvasEl.lgraphcanvas.ds.scale || 1;
      }
    } catch(e) {}

    node.pos = [(cx - 160) / scale, (cy - 100) / scale];

    // 如果是色块节点，设置检测到的颜色
    if (item.nodeType === 'sill/color-block' && item.type === 'color') {
      node.properties.color = item.detail;
    }
    // 如果是文字节点，设置检测到的内容
    if (item.nodeType === 'sill/text') {
      node.properties.content = item.label + ' · ' + item.detail;
    }

    graph.add(node);
    if (graph.onAfterChange) graph.onAfterChange(graph);

    // 标记已添加
    item.added = true;
    _addedCount++;

    var statusEl = document.getElementById('aiScanStatus');
    if (statusEl && _addedCount < _results.length) {
      setStatus('done', '✅ 已添加 ' + _addedCount + ' / ' + _results.length + ' 个元素');
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
  //  保存 graph 引用（由 editor-init 调用）
  // =====================

  AIScanner.setGraph = function(graph) {
    var canvasWrap = document.getElementById('canvasWrap');
    if (canvasWrap) canvasWrap._editorGraph = graph;
  };

  console.log('[AIScanner] AI 扫描模块已加载');
})();
