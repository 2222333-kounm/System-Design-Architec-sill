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
import OutputNode from './nodes/OutputNode';
import PreviewPanel from './components/PreviewPanel';
import { setStore } from './store';

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
  output: OutputNode,
};

const defaultViewport = { x: 200, y: 100, zoom: 1 };

const initialNodes = [
  {
    id: 'output-1',
    type: 'output',
    position: { x: 500, y: 200 },
    data: { id: 'output-1', onChange: handleNodeChange },
    deletable: true,
  },
];

// 注意：handleNodeChange 需要提升到 useEffect 外，用 useCallback

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCount, setNodeCount] = useState(1);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // 全局 handleNodeChange
  const handleNodeChange = useCallback((nodeId, properties) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, properties },
          };
        }
        return n;
      })
    );
  }, []);

  // 连线
  const onConnect = useCallback(
    (params) => {
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
        console.warn('[ReactFlow] 检测到循环依赖，连接被阻止');
        return;
      }

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [edges]
  );

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
      default:
        output = { type: 'unknown', css: {} };
    }

    setStore({ previewData: output });
  }, [nodes, edges]);

  // 节点/边变化时更新预览
  React.useEffect(() => {
    updatePreview();
  }, [nodes, edges, updatePreview]);

  // 更新节点计数
  React.useEffect(() => {
    setStore({ nodeCount: nodes.length });
  }, [nodes.length]);

  const onNodeClick = useCallback((_, node) => {
    setStore({ selectedNode: node });
  }, []);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* 画布 */}
      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          defaultViewport={defaultViewport}
          fitView={false}
          colorMode="dark"
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
            }}
            nodeColor={(n) => {
              if (n.type === 'output') return '#FCD34D';
              return '#3B82F6';
            }}
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>
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
        <DraggableNode type="output" label="📤 输出" />
      </div>

      {/* 右侧预览 */}
      <div style={{ width: 420, minWidth: 280, maxWidth: 600, flexShrink: 0 }}>
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
    case 'output':
      return {};
    default:
      return {};
  }
}

export default function App() {
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
        <span style={{ color: '#4B5563', fontSize: 11 }} id="v2Status">就绪</span>
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
