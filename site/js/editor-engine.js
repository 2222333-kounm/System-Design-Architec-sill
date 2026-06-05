/* ========================================
   编辑器引擎 — LiteGraph 封装
   拓扑排序 · 循环检测 · 端口匹配 · 预览更新
   ======================================== */

;(function() {
  'use strict';

  var EditorEngine = window.EditorEngine = {};

  // =====================
  //  端口类型定义
  // =====================

  var PORT_TYPES = {
    COLOR: 'color',
    IMAGE: 'image',
    TEXT: 'text',
    CSS: 'css',
    NUMBER: 'number',
    ANY: 'any',
    INTERACTIVE: 'interactive'
  };

  // 端口兼容性映射表: 源类型 → 可连接的目标类型列表
  var COMPATIBLE_MAP = {};
  COMPATIBLE_MAP[PORT_TYPES.COLOR] = [PORT_TYPES.COLOR, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE_MAP[PORT_TYPES.IMAGE] = [PORT_TYPES.IMAGE, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE_MAP[PORT_TYPES.TEXT] = [PORT_TYPES.TEXT, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE_MAP[PORT_TYPES.CSS] = [PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE_MAP[PORT_TYPES.INTERACTIVE] = [PORT_TYPES.INTERACTIVE, PORT_TYPES.CSS, PORT_TYPES.ANY];
  COMPATIBLE_MAP[PORT_TYPES.ANY] = [PORT_TYPES.COLOR, PORT_TYPES.IMAGE, PORT_TYPES.TEXT, PORT_TYPES.CSS, PORT_TYPES.INTERACTIVE, PORT_TYPES.NUMBER, PORT_TYPES.ANY];
  COMPATIBLE_MAP[PORT_TYPES.NUMBER] = [PORT_TYPES.NUMBER, PORT_TYPES.ANY];

  EditorEngine.PORT_TYPES = PORT_TYPES;

  /**
   * 检查端口类型兼容性
   * @param {string} fromType - 输出端口类型
   * @param {string} toType - 输入端口类型
   * @returns {boolean}
   */
  EditorEngine.isCompatible = function(fromType, toType) {
    var allowed = COMPATIBLE_MAP[fromType];
    if (!allowed) return false;
    return allowed.indexOf(toType) >= 0;
  };

  // =====================
  //  循环依赖检测
  // =====================

  /**
   * 判断添加 fromNode → toNode 的连线是否会形成环
   * 使用 BFS 从 toNode 出发，看是否能回到 fromNode
   */
  EditorEngine.wouldCreateCycle = function(graph, fromNode, toNode) {
    if (!graph || !fromNode || !toNode) return false;
    var visited = {};
    var queue = [toNode];
    while (queue.length > 0) {
      var current = queue.shift();
      if (current === fromNode) return true;
      var id = current.id;
      if (visited[id]) continue;
      visited[id] = true;
      if (current.outputs) {
        for (var i = 0; i < current.outputs.length; i++) {
          var output = current.outputs[i];
          if (output.links) {
            for (var j = 0; j < output.links.length; j++) {
              var linkId = output.links[j];
              if (linkId == null) continue;
              var link = graph.links[linkId];
              if (link) {
                var targetNode = graph.getNodeById(link.target_id);
                if (targetNode && !visited[targetNode.id]) {
                  queue.push(targetNode);
                }
              }
            }
          }
        }
      }
    }
    return false;
  };

  // =====================
  //  编辑器初始化
  // =====================

  /**
   * 初始化编辑器
   * @param {HTMLElement} container - 画布容器元素
   * @param {Object} opts
   * @param {function} [opts.onOutputChange] - 输出变化回调
   * @returns {{ graph: LGraph, canvas: LGraphCanvas }}
   */
  EditorEngine.init = function(container, opts) {
    opts = opts || {};
    if (window.TokenStore) window.TokenStore.refresh();

    var graph = new LGraph();

    // 创建 canvas 元素
    var canvasEl;
    if (container.tagName === 'CANVAS') {
      canvasEl = container;
    } else {
      canvasEl = document.createElement('canvas');
      canvasEl.style.width = '100%';
      canvasEl.style.height = '100%';
      canvasEl.style.display = 'block';
      canvasEl.id = 'litegraph-canvas';
      container.appendChild(canvasEl);

      var w = container.clientWidth;
      if (w === 0) w = container.offsetWidth;
      if (w === 0) w = window.innerWidth - 420;
      var h = container.clientHeight;
      if (h === 0) h = container.offsetHeight;
      if (h === 0) h = window.innerHeight - 44;
      canvasEl.width = Math.max(w, 400);
      canvasEl.height = Math.max(h, 400);
    }

    var canvas = new LGraphCanvas(canvasEl, graph);
    canvas.background_image = '';
    canvas.node_title_color = '#FAFAFA';
    canvas.allow_searchbox = true;
    canvas.setSize(canvasEl.width, canvasEl.height);

    // 窗口 resize
    window.addEventListener('resize', function() {
      var cw = container.clientWidth;
      var ch = container.clientHeight;
      if (cw > 0 && ch > 0) {
        canvasEl.width = cw;
        canvasEl.height = ch;
        canvas.setSize(cw, ch);
      }
    });

    // 延迟重绘确保尺寸正确
    setTimeout(function() {
      canvasEl.width = canvasEl.clientWidth || canvasEl.width;
      canvasEl.height = canvasEl.clientHeight || canvasEl.height;
      canvas.setSize(canvasEl.width, canvasEl.height);
      canvas.draw(true);
    }, 100);

    // 连线前的循环检测钩子
    canvas.onConnection = function(node, slot, targetNode, targetSlot) {
      if (EditorEngine.wouldCreateCycle(graph, node, targetNode)) {
        console.warn('[EditorEngine] 检测到循环依赖，连接被阻止');
        return false;
      }
      return true;
    };

    // LiteGraph 的连线事件
    graph.onAfterChange = function() {
      EditorEngine._updatePreview(graph, opts.onOutputChange);
    };

    graph.start();

    return { graph: graph, canvas: canvas };
  };

  // =====================
  //  预览更新
  // =====================

  /**
   * 遍历图找到输出节点，获取其输出数据并回调
   */
  EditorEngine._updatePreview = function(graph, callback) {
    var outputNode = null;
    if (!graph || !graph._nodes) return;
    for (var i = 0; i < graph._nodes.length; i++) {
      if (graph._nodes[i].type === 'sill/output') {
        outputNode = graph._nodes[i];
        break;
      }
    }
    if (outputNode) {
      outputNode.onExecute();
      if (callback && outputNode._lastOutput) {
        callback(outputNode._lastOutput);
      } else if (callback) {
        callback(null);
      }
    } else {
      if (callback) callback(null);
    }
  };

  // =====================
  //  序列化 / 反序列化
  // =====================

  EditorEngine.serialize = function(graph) {
    return JSON.stringify(graph.serialize(), null, 2);
  };

  EditorEngine.deserialize = function(graph, jsonStr, callback) {
    try {
      var data = JSON.parse(jsonStr);
      graph.configure(data);
      if (callback) callback(null);
    } catch(e) {
      if (callback) callback(e);
    }
  };

  // =====================
  //  快捷键绑定
  // =====================

  EditorEngine.bindShortcuts = function(canvas, graph, options) {
    var onSave = options.onSave;
    var onLoad = options.onLoad;

    document.addEventListener('keydown', function(e) {
      // Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave();
      }
      // Ctrl+O 加载
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        if (onLoad) onLoad();
      }
      // R 重置视图
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        if (canvas && graph) {
          var nodes = graph._nodes;
          if (nodes && nodes.length) {
            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            nodes.forEach(function(n) {
              minX = Math.min(minX, n.pos[0] - 50);
              minY = Math.min(minY, n.pos[1] - 50);
              maxX = Math.max(maxX, n.pos[0] + n.size[0] + 50);
              maxY = Math.max(maxY, n.pos[1] + n.size[1] + 50);
            });
            var cw = canvas.canvas.width, ch = canvas.canvas.height;
            if (maxX > minX && maxY > minY && cw > 0 && ch > 0) {
              var fs = Math.min(cw / (maxX - minX), ch / (maxY - minY), 1) * 0.85;
              var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
              canvas.setZoom(fs);
              canvas.setOffset(cw / 2 - cx * fs, ch / 2 - cy * fs);
            }
          }
        }
      }
    });
  };

  // =====================
  //  保存 / 加载文件
  // =====================

  EditorEngine.saveToFile = function(graph) {
    var json = EditorEngine.serialize(graph);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'node-editor-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  EditorEngine.loadFromFile = function(graph, callback) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', function() {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        EditorEngine.deserialize(graph, e.target.result, callback);
      };
      reader.readAsText(file);
    });
    input.click();
  };

})();
