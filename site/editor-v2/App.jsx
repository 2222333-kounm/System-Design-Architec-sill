import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ColorBlockNode from './nodes/ColorBlockNode';
import TextNode from './nodes/TextNode';
import ButtonNode from './nodes/ButtonNode';
import IconNode from './nodes/IconNode';
import LayoutContainerNode from './nodes/LayoutContainerNode';
import SpacingNode from './nodes/SpacingNode';
import BreakpointNode from './nodes/BreakpointNode';
import TransformNode from './nodes/TransformNode';
import MaskNode from './nodes/MaskNode';
import BorderNode from './nodes/BorderNode';
import ShadowNode from './nodes/ShadowNode';
import MouseFollowNode from './nodes/MouseFollowNode';
import TransitionNode from './nodes/TransitionNode';
import ConvertNode from './nodes/ConvertNode';
import MergeNode from './nodes/MergeNode';
import GlobalTokenNode from './nodes/GlobalTokenNode';
import InstanceNode from './nodes/InstanceNode';
import OutputNode from './nodes/OutputNode';
import PreviewPanel from './components/PreviewPanel';
import AIScanner from './components/AIScanner';
import ExportPanel from './components/ExportPanel';
import TokenEditor from './components/TokenEditor';
import DesignCheck from './components/DesignCheck';
import { useStore, setStore, componentStore } from './store';

const nodeTypes = {
  colorBlock: ColorBlockNode,
  text: TextNode,
  button: ButtonNode,
  icon: IconNode,
  layoutContainer: LayoutContainerNode,
  spacing: SpacingNode,
  breakpoint: BreakpointNode,
  transform: TransformNode,
  mask: MaskNode,
  border: BorderNode,
  shadow: ShadowNode,
  mouseFollow: MouseFollowNode,
  transition: TransitionNode,
  convert: ConvertNode,
  merge: MergeNode,
  globalToken: GlobalTokenNode,
  instance: InstanceNode,
  output: OutputNode,
};

const defaultViewport = { x: 200, y: 100, zoom: 1 };

function Flow() {
  // 先定义 handleNodeChange，供 initialNodes 使用
  const handleNodeChange = useCallback((nodeId, properties) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const extra = {};
          if (n.type === 'instance' && properties.componentId) {
            extra.componentDef = componentStore.get(properties.componentId);
          }
          return { ...n, data: { ...n.data, ...extra, properties } };
        }
        return n;
      })
    );
  }, []);

  const initialNodes = [
    {
      id: 'output-1',
      type: 'output',
      position: { x: 500, y: 200 },
      data: { id: 'output-1', onChange: handleNodeChange },
      deletable: true,
    },
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCount, setNodeCount] = useState(1);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toast, setToast] = useState(null);
  const [showEmptyGuide, setShowEmptyGuide] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const compVersionRef = useRef(0);
  const [showExport, setShowExport] = useState(false);
  const [showTokenEditor, setShowTokenEditor] = useState(false);
  const [showDesignCheck, setShowDesignCheck] = useState(false);

  // Toast 通知
  const showToast = useCallback((msg, type) => {
    setToast({ msg, type: type || 'info' });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // 主题切换
  const toggleTheme = useCallback(() => {
    setIsDarkMode((d) => !d);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.filter = isDarkMode ? 'none' : 'invert(0.92) hue-rotate(180deg)';
    // 保留画布暗色背景不变
    const flowEl = document.querySelector('.react-flow');
    if (flowEl) {
      flowEl.style.filter = 'none';
    }
  }, [isDarkMode]);

  // 全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  React.useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // 自动布局（简单网格排列）
  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    setNodes((nds) => {
      const cols = Math.ceil(Math.sqrt(nds.length));
      const spacingX = 350;
      const spacingY = 200;
      return nds.map((n, i) => ({
        ...n,
        position: {
          x: 80 + (i % cols) * spacingX,
          y: 80 + Math.floor(i / cols) * spacingY,
        },
      }));
    });
    showToast('✅ 已自动排列 ' + nodes.length + ' 个节点', 'done');
  }, [nodes.length, setNodes, showToast]);

  // =====================
  //  撤销/重做
  // =====================

  const [history, setHistory] = useState([{ nodes: initialNodes, edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historySkipRef = useRef(false);

  const pushHistory = useCallback((nds, eds) => {
    if (historySkipRef.current) { historySkipRef.current = false; return; }
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const entry = { nodes: JSON.parse(JSON.stringify(nds)), edges: JSON.parse(JSON.stringify(eds)) };
      return [...trimmed, entry].slice(-50); // 最多50步
    });
    setHistoryIndex((i) => Math.min(i + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    const entry = history[newIdx];
    if (!entry) return;
    historySkipRef.current = true;
    setNodes(JSON.parse(JSON.stringify(entry.nodes)));
    setEdges(JSON.parse(JSON.stringify(entry.edges)));
    setHistoryIndex(newIdx);
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    const entry = history[newIdx];
    if (!entry) return;
    historySkipRef.current = true;
    setNodes(JSON.parse(JSON.stringify(entry.nodes)));
    setEdges(JSON.parse(JSON.stringify(entry.edges)));
    setHistoryIndex(newIdx);
  }, [history, historyIndex, setNodes, setEdges]);

  // 节点/边变化 → 记录历史
  const onNodesChangeWrapped = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const onEdgesChangeWrapped = useCallback((changes) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  React.useEffect(() => {
    if (historySkipRef.current) return;
    const timer = setTimeout(() => pushHistory(nodes, edges), 200);
    return () => clearTimeout(timer);
  }, [nodes, edges, pushHistory]);

  // =====================
  //  端口类型匹配
  // =====================

  const PORT_GROUPS = {
    color: ['color', 'css'],
    image: ['image', 'css'],
    text: ['text', 'css'],
    css: ['css'],
    interactive: ['interactive', 'css'],
    layout: ['layout', 'css'],
    responsive: ['responsive', 'css'],
    merged: ['merged', 'css'],
    tokens: ['tokens', 'css'],
    any: ['color', 'image', 'text', 'css', 'interactive', 'layout', 'responsive', 'merged', 'tokens'],
    number: ['number'],
    video: ['video', 'css'],
    instance: ['instance', 'css'],
    masked: ['masked', 'image', 'css'],
  };

  // 每个节点输出端口的类型
  const OUTPUT_TYPE_MAP = {
    colorBlock: 'color',
    text: 'text',
    image: 'image',
    video: 'video',
    button: 'interactive',
    icon: 'css',
    layoutContainer: 'layout',
    spacing: 'css',
    breakpoint: 'responsive',
    transform: 'css',
    mask: 'masked',
    border: 'css',
    shadow: 'css',
    mouseFollow: 'interactive',
    transition: 'interactive',
    convert: 'any',
    merge: 'merged',
    globalToken: 'tokens',
    output: null,
  };

  // 输出节点接受什么类型
  const INPUT_TYPE_MAP = {
    output: ['color', 'text', 'image', 'css', 'interactive', 'layout', 'responsive', 'merged', 'tokens', 'any'],
    colorBlock: ['color', 'any'],
    text: ['any'],
    image: ['any'],
    video: ['any'],
    button: ['text', 'any'],
    icon: ['any'],
    layoutContainer: ['css', 'any'],
    spacing: ['css', 'any'],
    breakpoint: ['css', 'any'],
    transform: ['css', 'any'],
    mask: ['image', 'any'],
    border: ['css', 'any'],
    shadow: ['css', 'any'],
    mouseFollow: ['css', 'any'],
    transition: ['css', 'any'],
    convert: ['any'],
    merge: ['css', 'any'],
    globalToken: [],
  };

  function isPortCompatible(sourceType, targetType) {
    if (!sourceType || !targetType) return false;
    const allowed = PORT_GROUPS[sourceType] || [sourceType];
    return allowed.indexOf(targetType) >= 0;
  }

  // 连线（带端口类型匹配 + 循环检测）
  const onConnect = useCallback(
    (params) => {
      // 端口类型匹配
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      const sourceType = OUTPUT_TYPE_MAP[sourceNode.type] || 'any';
      const acceptedTypes = INPUT_TYPE_MAP[targetNode.type] || [];
      const targetType = OUTPUT_TYPE_MAP[targetNode.type]; // 用于判断输出连输入是否合理

      if (acceptedTypes.length > 0 && !acceptedTypes.some(t => isPortCompatible(sourceType, t))) {
        showToast('❌ 端口类型不兼容: ' + sourceType + ' → 不能连接 ' + targetNode.type, 'error');
        return;
      }

      // 循环检测
      const isCycle = (() => {
        const visited = new Set();
        const queue = [params.target];
        while (queue.length) {
          const id = queue.shift();
          if (id === params.source) return true;
          if (visited.has(id)) continue;
          visited.add(id);
          edges
            .filter((e) => e.source === id)
            .forEach((e) => queue.push(e.target));
        }
        return false;
      })();

      if (isCycle) {
        showToast('⚠️ 检测到循环依赖，连接被阻止', 'error');
        return;
      }

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [nodes, edges]
  );

  // =====================
  //  右键中文菜单
  // =====================

  const [contextMenu, setContextMenu] = useState(null);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX, y: event.clientY,
      nodeId: node.id, nodeType: node.type,
    });
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX, y: event.clientY,
      nodeId: null, nodeType: null,
    });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const addNodeFromMenu = useCallback((type) => {
    if (!reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
    const id = `${type}-${Date.now()}`;
    setNodes((nds) => nds.concat({
      id, type, position,
      data: { id, properties: getDefaultProps(type), onChange: handleNodeChange },
    }));
    setNodeCount((c) => c + 1);
    closeContextMenu();
  }, [reactFlowInstance, contextMenu, handleNodeChange, closeContextMenu]);

  const NODE_GROUPS = {
    '基础组件': ['colorBlock', 'text', 'button', 'icon'],
    '布局 & 结构': ['layoutContainer', 'spacing', 'breakpoint'],
    '变换 & 特效': ['transform', 'mask', 'border', 'shadow', 'mouseFollow', 'transition'],
    '工具 & 全局': ['convert', 'merge', 'globalToken', 'instance', 'output'],
  };

  const NODE_LABELS = {
    colorBlock: '🎨 色块', text: '📝 文字', button: '🔘 按钮', icon: '🔣 图标',
    layoutContainer: '📐 布局容器', spacing: '↔ 间距', breakpoint: '📱 断点',
    transform: '🔄 变换', mask: '🎭 蒙版', border: '📦 边框', shadow: '💡 阴影',
    mouseFollow: '🖱️ 鼠标跟随', transition: '✨ 转场',
    convert: '🔄 转换', merge: '🗂️ 合并', globalToken: '🌐 全局Token', instance: '♻ 组件实例', output: '📤 输出',
  };

  // =====================
  //  Ctrl+E 折叠/展开
  // =====================

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        document.querySelectorAll('.react-flow__node.selected').forEach((el) => {
          const nodeEl = el.querySelector(':scope > div');
          if (nodeEl) {
            const currentMaxH = nodeEl.style.maxHeight;
            nodeEl.style.maxHeight = currentMaxH === '40px' ? '' : '40px';
            nodeEl.style.overflow = currentMaxH === '40px' ? '' : 'hidden';
            nodeEl.style.transition = 'max-height 0.2s ease';
          }
        });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // 拖放添加节点
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `${type}-${Date.now()}`;
      const newNode = {
        id,
        type,
        position,
        data: { id, properties: getDefaultProps(type), onChange: handleNodeChange },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeCount((c) => c + 1);
    },
    [reactFlowInstance, handleNodeChange]
  );

  // 更新预览数据
  const updatePreview = useCallback(() => {
    const outputNode = nodes.find((n) => n.type === 'output');
    if (!outputNode) {
      setStore({ previewData: null });
      return;
    }
    // 找连接到输出节点的上游
    const inputEdge = edges.find((e) => e.target === outputNode.id);
    if (!inputEdge) {
      setStore({ previewData: null });
      return;
    }
    const sourceNode = nodes.find((n) => n.id === inputEdge.source);
    if (!sourceNode || !sourceNode.data.properties) {
      setStore({ previewData: null });
      return;
    }
    const props = sourceNode.data.properties;
    let output = null;

    switch (sourceNode.type) {
      case 'colorBlock':
        output = {
          type: 'color',
          css: {
            background: props.color,
            width: props.width + 'px',
            height: props.height + 'px',
            borderRadius: props.borderRadius + 'px',
            opacity: String((props.opacity ?? 100) / 100),
          },
        };
        break;
      case 'text':
        output = {
          type: 'text',
          css: {
            fontFamily: props.fontFamily || 'PingFang SC',
            fontSize: (props.fontSize || 16) + (props.fontSizeUnit || 'px'),
            fontWeight: String(props.fontWeight || 400),
            lineHeight: String(props.lineHeight || 1.5),
            letterSpacing: (props.letterSpacing ?? 0) + 'em',
            color: props.color || '#1D1D1F',
            textAlign: props.textAlign || 'left',
          },
          content: props.content || '',
        };
        break;
      case 'button':
        output = {
          type: 'interactive',
          css: {
            display: 'inline-block',
            padding: { xs: '4px 8px', sm: '8px 16px', md: '12px 24px', lg: '16px 32px', xl: '20px 40px' }[props.padding] || '8px 16px',
            background: props.color || '#0071E3',
            color: props.textColor || '#FFFFFF',
            borderRadius: (props.borderRadius ?? 980) + 'px',
            border: 'none',
            cursor: 'pointer',
            fontSize: (props.fontSize || 14) + 'px',
          },
          content: props.text || '按钮',
        };
        break;
      case 'icon':
        output = {
          type: 'css',
          css: {
            fontSize: (props.size || 24) + 'px',
            color: props.color || '#1D1D1F',
            opacity: String((props.opacity ?? 100) / 100),
            lineHeight: '1',
          },
          content: props.icon || '❤️',
        };
        break;
      case 'layoutContainer':
        output = {
          type: 'layout',
          css: props.display === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: props.gridTemplateColumns || '1fr 1fr 1fr',
            gridTemplateRows: props.gridTemplateRows || 'auto',
            rowGap: (props.rowGap ?? 16) + 'px',
            columnGap: (props.columnGap ?? 16) + 'px',
            justifyItems: props.justifyItems || 'center',
            gridAutoFlow: props.gridAutoFlow || 'row',
          } : {
            display: 'flex',
            flexDirection: props.flexDirection || 'row',
            justifyContent: props.justifyContent || 'center',
            alignItems: props.alignItems || 'center',
            gap: (props.gap ?? 16) + 'px',
            flexWrap: props.flexWrap || 'nowrap',
            padding: (props.padding ?? 0) + 'px',
          },
        };
        break;
      case 'spacing': {
        const uk = props.unit || 'px';
        const mode = props.mode || 'padding';
        const prefix = mode === 'padding' ? 'padding' : 'margin';
        let css = {};
        if (props.control === 'individual') {
          css[prefix + 'Top'] = (props[mode + 'Top'] ?? 0) + uk;
          css[prefix + 'Right'] = (props[mode + 'Right'] ?? 0) + uk;
          css[prefix + 'Bottom'] = (props[mode + 'Bottom'] ?? 0) + uk;
          css[prefix + 'Left'] = (props[mode + 'Left'] ?? 0) + uk;
        } else {
          css[prefix] = (props.uniformValue ?? 16) + uk;
        }
        output = { type: 'css', css };
        break;
      }
      case 'breakpoint': {
        const isCustom = props.breakpoint === 'custom';
        const presets = { mobile: { w: 734, c: 'max-width' }, tablet: { w: 1068, c: 'max-width' }, desktop: { w: 1069, c: 'min-width' } };
        const preset = presets[props.breakpoint];
        const w = isCustom ? (props.customWidth || 734) : (preset?.w || 734);
        const c = isCustom ? (props.condition || 'max-width') : (preset?.c || 'max-width');
        output = {
          type: 'responsive',
          css: {},
          extra: { mediaQuery: `(${c}: ${w}px)`, overrides: props.overrides || '' },
        };
        break;
      }
      case 'transform':
        output = { type: 'css', css: {
          transform: 'scale(' + (props.scale ?? 1) + ') rotate(' + (props.rotation ?? 0) + 'deg)',
          opacity: String((props.opacity ?? 100) / 100),
          borderRadius: (props.borderRadius ?? 0) + 'px',
        }};
        break;
      case 'mask':
        output = { type: 'image', css: {
          clipPath: props.shape === '圆形' ? 'circle(50%)' : props.shape === '渐变' ? 'url(#grad)' : 'inset(0 round ' + (props.borderRadius ?? 0) + 'px)',
        }, extra: { shape: props.shape || '矩形', feather: props.feather ?? 0, invert: !!props.invert }};
        break;
      case 'border':
        output = { type: 'css', css: {
          border: (props.thickness ?? 2) + 'px ' + ({ '实线': 'solid', '虚线': 'dashed', '点线': 'dotted', '双线': 'double' }[props.lineType] || 'solid') + ' ' + (props.color || '#E5E5E5'),
          borderRadius: (props.borderRadius ?? 8) + 'px',
        }};
        break;
      case 'shadow':
        output = { type: 'css', css: {
          boxShadow: (props.shadowType === '内阴影' ? 'inset ' : '') + (props.offsetX ?? 0) + 'px ' + (props.offsetY ?? 4) + 'px ' + (props.blur ?? 10) + 'px ' + (props.spread ?? 0) + 'px ' + (props.color || 'rgba(0,0,0,0.15)'),
        }};
        break;
      case 'mouseFollow':
        output = { type: 'interactive', css: { transition: 'all 0.3s ' + (props.easing || 'ease-out'), willChange: 'transform' }, extra: { kind: 'mouse-follow', effect: props.effect || '视差', strength: props.strength ?? 0.3, range: props.range ?? 200 }};
        break;
      case 'transition':
        output = { type: 'interactive', css: { transition: 'all ' + (props.duration ?? 0.3) + 's ' + (props.easing || 'ease-out') + ' ' + (props.delay ?? 0) + 's' }, extra: { kind: 'transition', trigger: props.trigger || 'hover', transformType: props.transformType || '缩放' }};
        break;
      case 'convert':
        output = { type: 'css', css: {}, extra: { mode: props.mode || 'text→css' }};
        break;
      case 'merge':
        output = { type: 'merged', css: {}, extra: { mode: props.mode || '叠加' }};
        break;
      case 'globalToken':
        output = { type: 'tokens', css: {}, extra: { count: window.TokenStore?.keys().length || 0 }};
        break;
      case 'instance': {
        const compDef = componentStore.get(props.componentId);
        if (compDef && compDef.nodes.length > 0) {
          // 合并组件内所有节点的CSS
          const mergedCss = {};
          compDef.nodes.forEach(n => {
            const np = n.data?.properties;
            if (!np) return;
            if (np.color) mergedCss.background = np.color;
            if (np.width) mergedCss.width = np.width + (np.widthUnit || 'px');
            if (np.height) mergedCss.height = np.height + (np.heightUnit || 'px');
            if (np.borderRadius) mergedCss.borderRadius = np.borderRadius + 'px';
            if (np.fontSize) mergedCss.fontSize = np.fontSize + (np.fontSizeUnit || 'px');
            if (np.content) mergedCss.content = np.content;
          });
          output = { type: 'instance', css: mergedCss, extra: { componentRef: props.componentId, instanceName: props.instanceName, slots: props.slots } };
        } else {
          output = { type: 'instance', css: {}, extra: { componentRef: props.componentId } };
        }
        break;
      }
      default:
    }

    setStore({ previewData: output });
  }, [nodes, edges]);

  // 替换原有的 handleNodeChange 以注入 componentDef

  // 节点/边变化时更新预览（100ms 防抖）
  const previewTimerRef = useRef(null);
  React.useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(updatePreview, 100);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  }, [nodes, edges, updatePreview]);

  // 更新节点计数
  React.useEffect(() => {
    setStore({ nodeCount: nodes.length });
  }, [nodes.length]);

  const onNodeClick = useCallback((_, node) => {
    setStore({ selectedNode: node });
  }, []);

  // AI Scanner 添加节点
  const handleAiAddNodes = useCallback((newNode) => {
    setNodes((nds) => nds.concat(newNode));
  }, []);

  // =====================
  //  预览面板宽度（可拖拽）
  // =====================

  const [previewWidth, setPreviewWidth] = useState(420);
  const dividerRef = useRef(null);
  const isDraggingDivider = useRef(false);

  const onDividerMouseDown = useCallback((e) => {
    isDraggingDivider.current = true;
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
  }, []);

  React.useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingDivider.current) return;
      const totalWidth = document.body.clientWidth;
      const newWidth = Math.max(280, Math.min(600, totalWidth - e.clientX));
      setPreviewWidth(newWidth);
    };
    const onMouseUp = () => {
      if (isDraggingDivider.current) {
        isDraggingDivider.current = false;
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []);

  // =====================
  //  Ctrl+S 保存 / Ctrl+O 加载
  // =====================

  const saveToFile = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'node-editor-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const loadFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.nodes) { setNodes(data.nodes); }
          if (data.edges) { setEdges(data.edges); }
        } catch(err) { alert('加载失败: ' + err.message); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges]);

  // =====================
  //  键盘快捷键
  // =====================

  // 复制/粘贴状态
  const clipboardRef = useRef(null);

  const copySelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;
    const selectedIds = new Set(selected.map((n) => n.id));
    const relatedEdges = edges.filter((e) => selectedIds.has(e.source) || selectedIds.has(e.target));
    clipboardRef.current = {
      nodes: JSON.parse(JSON.stringify(selected)),
      edges: JSON.parse(JSON.stringify(relatedEdges)),
    };
  }, [nodes, edges]);

  const pasteClipboard = useCallback(() => {
    const data = clipboardRef.current;
    if (!data || !data.nodes.length) return;
    const idMap = {};
    const newNodes = data.nodes.map((n) => {
      const newId = n.type + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 4);
      idMap[n.id] = newId;
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        selected: false,
        data: { ...n.data, id: newId, properties: { ...n.data.properties } },
      };
    });
    const newEdges = data.edges.map((e) => ({
      ...e,
      id: 'e-' + Date.now() + '-' + Math.random().toString(36).slice(2, 4),
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target,
    }));
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  }, [setNodes, setEdges]);

  React.useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's') { e.preventDefault(); saveToFile(); }
      if (ctrl && e.key === 'o') { e.preventDefault(); loadFromFile(); }
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'y') { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'c') { e.preventDefault(); copySelected(); }
      if (ctrl && e.key === 'v') { e.preventDefault(); pasteClipboard(); }
      if (ctrl && e.key === 'a') { e.preventDefault(); /* 全选由 ReactFlow 处理 */ }
      if (e.key === '?' && !ctrl) { e.preventDefault(); setShowShortcuts((s) => !s); }
      if (e.key === 'Escape') { setShowShortcuts(false); }
      if (e.key === 'r' && !ctrl) {
        e.preventDefault();
        if (reactFlowInstance && nodes.length > 0) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 200 });
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [saveToFile, loadFromFile, undo, redo, copySelected, pasteClipboard, reactFlowInstance, nodes]);

  // 暴露方法到 Store（供 App 工具栏按钮使用）
  React.useEffect(() => {
    setStore({ saveToFile, loadFromFile, autoLayout, toggleTheme, toggleFullscreen, isDarkMode, isFullscreen });
  }, [saveToFile, loadFromFile, autoLayout, toggleTheme, toggleFullscreen, isDarkMode, isFullscreen]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* 全局样式: 选中高亮 + 端口标签 */}
      <style>{`
        .react-flow__node.selected > div {
          box-shadow: 0 0 0 2px rgba(59,130,246,0.6), 0 0 20px rgba(59,130,246,0.2) !important;
          transition: box-shadow 0.15s ease;
        }
        .react-flow__node.selected {
          filter: brightness(1.05);
        }
        .react-flow__handle {
          width: 10px !important;
          height: 10px !important;
          border: 2px solid rgba(255,255,255,0.15) !important;
          transition: all 0.15s ease;
        }
        .react-flow__handle:hover {
          border-color: rgba(59,130,246,0.6) !important;
          transform: scale(1.3);
        }
        .react-flow__handle-connecting {
          border-color: #3B82F6 !important;
        }
        .react-flow__edge-path {
          stroke: rgba(255,255,255,0.2);
          stroke-width: 1.5;
        }
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #3B82F6;
          stroke-width: 2.5;
        }
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: rgba(59,130,246,0.5);
        }
      `}</style>
      {/* 画布 */}
      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapped}
          onEdgesChange={onEdgesChangeWrapped}
          onConnect={onConnect}
          onInit={(instance) => { setReactFlowInstance(instance); setStore({ reactFlowInstance: instance }); }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          onEdgeClick={(e, edge) => { /* 点击边可选中 */ }}
          nodeTypes={nodeTypes}
          defaultViewport={defaultViewport}
          fitView={false}
          colorMode="dark"
          connectionLineStyle={{ stroke: 'rgba(59,130,246,0.5)', strokeWidth: 2 }}
          defaultEdgeOptions={{ style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5 }, animated: false }}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode="Shift"
          snapToGrid
          snapGrid={[20, 20]}
        >
          <Background color="rgba(255,255,255,0.04)" gap={40} />
          <Controls
            style={{
              bottom: 16,
              left: 16,
              background: 'rgba(30,32,38,0.9)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          <MiniMap
            style={{
              background: '#1A1C23',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              cursor: 'pointer',
            }}
            nodeColor={(n) => {
              if (n.type === 'output') return '#FCD34D';
              return '#3B82F6';
            }}
            maskColor="rgba(0,0,0,0.5)"
            pannable
            zoomable
            nodeBorderRadius={4}
            nodeStrokeWidth={2}
          />
        </ReactFlow>

        {/* 空状态引导（首次打开时显示） */}
        {nodes.length <= 1 && showEmptyGuide && (
          <div onClick={() => setShowEmptyGuide(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: nodes.length <= 1 ? 'auto' : 'none' }}>
            <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔌</div>
              <div style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>欢迎使用 Node Editor</div>
              <div style={{ color: '#6B7280', fontSize: 11, lineHeight: 1.6, marginBottom: 16 }}>
                从下方拖拽节点到画布，或<span style={{ color: '#60A5FA', cursor: 'pointer' }} onClick={() => setShowEmptyGuide(false)}>关闭引导</span>后右键画布添加。
                <br />连接节点到「输出」即可在右侧预览。
              </div>
              <button onClick={() => setShowEmptyGuide(false)}
                style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '8px 20px', fontSize: 12, cursor: 'pointer' }}>
                开始使用 ✕
              </button>
            </div>
          </div>
        )}

        {/* Toast 通知 */}
        {toast && (
          <div style={{
            position: 'absolute', bottom: 60, right: 16, zIndex: 100,
            background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
            color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 11,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', maxWidth: 300,
            backdropFilter: 'blur(8px)',
          }}>
            {toast.msg}
          </div>
        )}

        <AIScanner addNodes={handleAiAddNodes} />

        {/* 浮动工具按钮（撤销/重做/保存/加载/重置） */}
        <div style={{ position: 'absolute', bottom: 16, right: previewWidth + 16, zIndex: 10, display: 'flex', gap: 4 }}>
          <button onClick={undo} title="撤销 Ctrl+Z"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↩</button>
          <button onClick={redo} title="重做 Ctrl+Shift+Z"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↪</button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 2px' }} />
          <button onClick={saveToFile} title="保存 Ctrl+S"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💾</button>
          <button onClick={loadFromFile} title="加载 Ctrl+O"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📂</button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 2px' }} />
          <button onClick={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 200 })} title="重置视图 R"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⌂</button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 2px' }} />
          <button onClick={() => setShowTokenEditor(true)} title="全局 Token"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', color: '#6EE7B7', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</button>
          <button onClick={() => setShowDesignCheck(true)} title="规范检查"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📐</button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 2px' }} />
          <button onClick={() => setShowExport(true)} title="导出代码"
            style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', color: '#6EE7B7', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📤</button>
        </div>

        {/* 导出面板 */}
        {showExport && <ExportPanel nodes={nodes} edges={edges} onClose={() => setShowExport(false)} />}
        {showTokenEditor && <TokenEditor open={showTokenEditor} onClose={() => setShowTokenEditor(false)} />}
        {showDesignCheck && <DesignCheck open={showDesignCheck} onClose={() => setShowDesignCheck(false)} nodes={nodes} onUpdateNode={handleNodeChange} />}

        {/* 快捷键提示面板 */}
        {showShortcuts && (
          <div onClick={() => setShowShortcuts(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: 'rgba(22,24,30,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: 400, maxHeight: '70vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>⌨️ 快捷键</h2>
                <button onClick={() => setShowShortcuts(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B7280', fontSize: 18, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Ctrl+S', '保存节点图'],
                  ['Ctrl+O', '加载节点图'],
                  ['Ctrl+Z', '撤销'],
                  ['Ctrl+Shift+Z / Ctrl+Y', '重做'],
                  ['Ctrl+C', '复制选中节点'],
                  ['Ctrl+V', '粘贴节点'],
                  ['R', '重置视图 (fitView)'],
                  ['Ctrl+E', '折叠/展开选中节点'],
                  ['Backspace / Delete', '删除选中'],
                  ['Shift + 点击', '多选'],
                  ['?', '显示/关闭此面板'],
                  ['ESC', '关闭面板 / 取消选中'],
                ].map(([key, desc]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <kbd style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 8px', color: '#93C5FD', fontSize: 10, fontFamily: 'monospace', minWidth: 100, textAlign: 'center' }}>{key}</kbd>
                    <span style={{ color: '#9CA3AF', fontSize: 11 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 右键菜单 */}
        {contextMenu && (
          <div onClick={closeContextMenu}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 10000,
                background: 'rgba(22,24,30,0.97)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '6px 0', minWidth: 180,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)', fontSize: 12,
              }}>
              {Object.entries(NODE_GROUPS).map(([group, types], gi) => (
                <React.Fragment key={group}>
                  {gi > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 12px' }} />}
                  <div style={{ color: '#6B7280', fontSize: 10, padding: '4px 14px 2px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {group}
                  </div>
                  {types.map(type => (
                    <div key={type} onClick={() => addNodeFromMenu(type)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px',
                        cursor: 'pointer', color: '#D1D5DB', transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.target.style.background = ''}>
                      {NODE_LABELS[type] || type}
                    </div>
                  ))}
                </React.Fragment>
              ))}
              {/* 分割线 */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 12px' }} />
              {/* 保存为组件（选中节点时显示） */}
              <div onClick={() => { const sel = nodes.filter(n => n.selected); if (sel.length > 0) { const name = prompt('组件名称:', '组件 ' + (Object.keys(componentStore.list()).length + 1)); if (name) { const id = componentStore.createFromSelected(sel, edges, name); showToast('✅ 已保存组件: ' + name, 'done'); closeContextMenu(); } } else { showToast('⚠️ 请先选中要保存的节点', 'error'); closeContextMenu(); } }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', cursor: 'pointer', color: '#C4B5FD', transition: 'background 0.1s', fontSize: 11 }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(139,92,246,0.1)'}
                onMouseLeave={(e) => e.target.style.background = ''}>
                💾 保存选中为组件
              </div>
              {/* 组件管理 */}
              <div onClick={() => { const list = componentStore.list(); if (list.length === 0) { showToast('⚠️ 暂无保存的组件', 'error'); } else { showToast('📦 共 ' + list.length + ' 个组件: ' + list.map(c => c.name).join(', '), 'done'); } closeContextMenu(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', cursor: 'pointer', color: '#6B7280', transition: 'background 0.1s', fontSize: 11 }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.target.style.background = ''}>
                📋 组件列表
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 组件拖拽面板 - 浮动在画布左下 */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 80,
        zIndex: 10,
        display: 'flex',
        gap: 4,
      }}>
        <DraggableNode type="colorBlock" label="🎨 色块" />
        <DraggableNode type="text" label="📝 文字" />
        <DraggableNode type="button" label="🔘 按钮" />
        <DraggableNode type="icon" label="🔣 图标" />
        <DraggableNode type="layoutContainer" label="📐 布局" />
        <DraggableNode type="spacing" label="↔ 间距" />
        <DraggableNode type="breakpoint" label="📱 断点" />
        <DraggableNode type="transform" label="🔄 变换" />
        <DraggableNode type="mask" label="🎭 蒙版" />
        <DraggableNode type="border" label="📦 边框" />
        <DraggableNode type="shadow" label="💡 阴影" />
        <DraggableNode type="mouseFollow" label="🖱️ 跟随" />
        <DraggableNode type="transition" label="✨ 转场" />
        <DraggableNode type="convert" label="🔄 转换" />
        <DraggableNode type="merge" label="🗂️ 合并" />
        <DraggableNode type="globalToken" label="🌐 全局Token" />
<DraggableNode type="instance" label="♻ 组件实例" />
        <DraggableNode type="output" label="📤 输出" />
      </div>

      {/* 可拖拽分隔线 */}
      <div
        ref={dividerRef}
        onMouseDown={onDividerMouseDown}
        style={{
          width: 5, cursor: 'col-resize', flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!isDraggingDivider.current) e.target.style.background = 'rgba(59,130,246,0.15)'; }}
        onMouseLeave={(e) => { if (!isDraggingDivider.current) e.target.style.background = 'rgba(255,255,255,0.04)'; }}
      >
        <div style={{ width: 2, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
      </div>

      {/* 右侧预览（可变宽度） */}
      <div style={{ width: previewWidth, minWidth: 280, maxWidth: 600, flexShrink: 0 }}>
        <PreviewPanel />
      </div>
    </div>
  );
}

/** 可拖拽节点模版 */
function DraggableNode({ type, label }) {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        background: 'rgba(30,32,38,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '6px 12px',
        color: '#9CA3AF',
        fontSize: 11,
        cursor: 'grab',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  );
}

/** 各节点默认属性 */
function getDefaultProps(type) {
  switch (type) {
    case 'colorBlock':
      return { color: '#3B82F6', width: 320, height: 120, borderRadius: 12, opacity: 100 };
    case 'text':
      return { content: '示例文字', fontFamily: 'PingFang SC', fontSize: 16, fontSizeUnit: 'px', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, color: '#1D1D1F', textAlign: 'left' };
    case 'button':
      return { text: '立即购买', color: '#0071E3', hoverColor: '#0077ED', activeColor: '#0068D9', textColor: '#FFFFFF', borderRadius: 980, padding: 'sm', fontSize: 14 };
    case 'icon':
      return { icon: '❤️', size: 24, color: '#1D1D1F', opacity: 100 };
    case 'layoutContainer':
      return { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'nowrap', padding: 0, gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto', rowGap: 16, columnGap: 16, justifyItems: 'center', gridAutoFlow: 'row' };
    case 'spacing':
      return { mode: 'padding', control: 'uniform', uniformValue: 16, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, unit: 'px' };
    case 'breakpoint':
      return { breakpoint: 'mobile', customWidth: 734, condition: 'max-width', overrides: '' };
    case 'transform':
      return { scale: 1, rotation: 0, opacity: 100, borderRadius: 0 };
    case 'mask':
      return { shape: '矩形', feather: 0, invert: false, borderRadius: 0 };
    case 'border':
      return { lineType: '实线', thickness: 2, color: '#E5E5E5', borderRadius: 8 };
    case 'shadow':
      return { shadowType: '投影', offsetX: 0, offsetY: 4, blur: 10, spread: 0, color: '#000000' };
    case 'mouseFollow':
      return { effect: '视差', strength: 0.3, range: 200, easing: 'ease-out' };
    case 'transition':
      return { trigger: 'hover', transformType: '缩放', targetValue: 1.2, duration: 0.3, delay: 0, easing: 'ease-out' };
    case 'convert':
      return { mode: 'text→css' };
    case 'merge':
      return { mode: '叠加' };
    case 'globalToken':
      return {};
    case 'instance':
      return { componentId: '', instanceName: '', slots: '' };
    case 'output':
      return {};
    default:
      return {};
  }
}

export default function App() {
  const nodeCountStore = useStore('nodeCount');
  const autoLayoutFromStore = useStore('autoLayout');
  const toggleThemeFromStore = useStore('toggleTheme');
  const toggleFullscreenFromStore = useStore('toggleFullscreen');
  const isDarkModeFromStore = useStore('isDarkMode');
  const isFullscreenFromStore = useStore('isFullscreen');
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1A1C23' }}>
      {/* 顶栏 */}
      <div style={{
        height: 44,
        background: '#22242B',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
          🔌 <span style={{ color: '#3B82F6' }}>Node</span> Editor <span style={{ color: '#6B7280', fontSize: 10, fontWeight: 400 }}>v2 · React Flow</span>
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ color: '#4B5563', fontSize: 11 }}>{nodeCountStore || 0} 个节点</span>
        <span style={{ color: '#374151', fontSize: 9, margin: '0 4px' }}>·</span>
        <button onClick={autoLayoutFromStore} title="自动排列"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280', borderRadius: 6, padding: '4px 8px', fontSize: 10, cursor: 'pointer' }}>⊞ 排列</button>
        <button onClick={toggleThemeFromStore} title="切换主题"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280', borderRadius: 6, padding: '4px 8px', fontSize: 10, cursor: 'pointer' }}>{isDarkModeFromStore !== false ? '☀️' : '🌙'}</button>
        <button onClick={toggleFullscreenFromStore} title="全屏"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280', borderRadius: 6, padding: '4px 8px', fontSize: 10, cursor: 'pointer' }}>{!!isFullscreenFromStore ? '⛶' : '⛶'}</button>
      </div>

      {/* 主体 */}
      <div style={{ width: '100%', height: 'calc(100% - 44px)', position: 'relative' }}>
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
