import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStore, setStore } from '../store';

/**
 * AI 扫描浮动面板 — React Flow 版本
 * URL/文件扫描 · 结果列表 · 添加到画布
 */
export default function AIScanner({ addNodes }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const reactFlowInstance = useStore('reactFlowInstance');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [statusText, setStatusText] = useState('💡 输入 URL 或上传文件开始扫描');
  const [results, setResults] = useState([]);
  const [addedCount, setAddedCount] = useState(0);
  const existingNodes = useStore('nodes');
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  // =====================
  //  模拟扫描数据
  // =====================

  const MOCK_RESULTS = [
    { type: 'color',      name: '主色调',     value: '#0071E3',    suggestedNode: 'colorBlock' },
    { type: 'color',      name: '文字色',     value: '#1D1D1F',    suggestedNode: 'colorBlock' },
    { type: 'color',      name: '背景色',     value: '#F5F5F7',    suggestedNode: 'colorBlock' },
    { type: 'typography', name: 'Hero 标题',  value: '56px SF Pro', suggestedNode: 'text' },
    { type: 'typography', name: '正文字号',   value: '17px SF Pro', suggestedNode: 'text' },
    { type: 'button',     name: '主按钮样式', value: '胶囊 980px',  suggestedNode: 'button' },
    { type: 'layout',     name: 'Flex 布局',  value: 'center 居中', suggestedNode: 'layoutContainer' },
    { type: 'spacing',    name: '内边距',     value: '16px',        suggestedNode: 'spacing' },
    { type: 'breakpoint', name: '移动端断点', value: '734px',       suggestedNode: 'breakpoint' },
  ];

  const NODE_ICONS = {
    colorBlock: '🎨', text: '📝', button: '🔘', icon: '🔣',
    layoutContainer: '📐', spacing: '↔', breakpoint: '📱',
    transform: '🔄', mask: '🎭', border: '📦', shadow: '💡',
    mouseFollow: '🖱️', transition: '✨', convert: '🔄', merge: '🗂️',
    globalToken: '🌐', output: '📤',
  };

  // =====================
  //  去重检测
  // =====================

  const detectAdded = useCallback((items) => {
    const nodes = existingNodes || [];
    return items.map(item => {
      const exists = nodes.some(n => {
        if (n.type !== item.suggestedNode) return false;
        if (item.suggestedNode === 'colorBlock' && typeof item.value === 'string') {
          return n.data?.properties?.color?.toUpperCase() === item.value.toUpperCase();
        }
        return false;
      });
      return { ...item, id: item.suggestedNode + '-' + Math.random().toString(36).slice(2, 6), added: exists };
    });
  }, [existingNodes]);

  // =====================
  //  扫描逻辑
  // =====================

  const startScan = useCallback(() => {
    if (!url.trim()) {
      setStatus('idle');
      setStatusText('⚠️ 请输入网页 URL');
      return;
    }
    setStatus('loading');
    setStatusText('🔍 正在扫描 ' + url + ' …');
    setAddedCount(0);

    setTimeout(() => {
      const items = MOCK_RESULTS.map(item => ({ ...item }));
      const withAdded = detectAdded(items);
      const added = withAdded.filter(r => r.added).length;
      setResults(withAdded);
      setAddedCount(added);
      setStatus('done');
      setStatusText(added > 0
        ? `✅ 扫描完成 · 共 ${withAdded.length} 个元素（${added} 个已在画布上）`
        : `✅ 扫描完成 · 共发现 ${withAdded.length} 个设计元素`);
    }, 1500);
  }, [url, detectAdded]);

  // =====================
  //  文件处理
  // =====================

  const handleFile = useCallback((file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['html', 'htm', 'css'].includes(ext)) {
      setStatus('error');
      setStatusText('❌ 不支持的文件格式: .' + ext);
      return;
    }
    setStatus('loading');
    setStatusText('🔍 正在分析 ' + file.name + ' …');

    setTimeout(() => {
      const items = MOCK_RESULTS.map(item => ({ ...item }));
      const withAdded = detectAdded(items);
      const added = withAdded.filter(r => r.added).length;
      setResults(withAdded);
      setAddedCount(added);
      setStatus('done');
      setStatusText(`✅ 分析完成 · 共发现 ${withAdded.length} 个设计元素`);
    }, 1200);
  }, [detectAdded]);

  // =====================
  //  添加到画布
  // =====================

  const addToCanvas = useCallback((id) => {
    const item = results.find(r => r.id === id);
    if (!item || item.added) return;

    const center = reactFlowInstance?.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }) || { x: 300, y: 200 };

    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 150;

    const nodeType = item.suggestedNode;
    const props = getDefaultProps(nodeType);

    // 预填扫描值
    if (nodeType === 'colorBlock' && typeof item.value === 'string') {
      props.color = item.value;
    }
    if (nodeType === 'text' && typeof item.value === 'string') {
      props.content = item.name + ' · ' + item.value;
    }
    if (nodeType === 'spacing' && typeof item.value === 'string') {
      props.uniformValue = parseInt(item.value) || 16;
    }
    if (nodeType === 'breakpoint' && typeof item.value === 'string') {
      props.customWidth = parseInt(item.value) || 734;
    }

    addNodes({
      id: nodeType + '-' + Date.now(),
      type: nodeType,
      position: { x: center.x + offsetX, y: center.y + offsetY },
      data: { id: nodeType + '-' + Date.now(), properties: props, onChange: handleNodeChange },
    });

    setResults(prev => prev.map(r => r.id === id ? { ...r, added: true } : r));
    const newAdded = addedCount + 1;
    setAddedCount(newAdded);
    if (newAdded >= results.length) {
      setStatusText('✅ 所有元素已添加到画布');
    } else {
      setStatusText(`✅ 已添加 ${newAdded} / ${results.length} 个元素`);
    }
  }, [results, addedCount, reactFlowInstance, addNodes]);

  // 临时的 handleNodeChange — 由 App.jsx 传入
  const handleNodeChange = useCallback((nodeId, properties) => {
    // placeholder, real handler comes from App
  }, []);

  const addAllToCanvas = useCallback(() => {
    results.filter(r => !r.added).forEach(r => addToCanvas(r.id));
  }, [results, addToCanvas]);

  // =====================
  //  键盘输入
  // =====================

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') startScan();
    if (e.key === 'Escape') setOpen(false);
  }, [startScan]);

  // =====================
  //  渲染
  // =====================

  if (!open) {
    return (
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 100 }}>
        <button onClick={() => setOpen(true)}
          style={{
            background: 'rgba(16,185,129,0.15)', color: '#6EE7B7',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}>
          🤖 AI
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        width: 520, maxHeight: '80vh',
        background: 'rgba(22,24,30,0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* 头部 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>
            🤖 AI 扫描
          </h2>
          <button onClick={() => setOpen(false)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#6B7280', fontSize: 20, cursor: 'pointer',
              padding: '4px 8px', borderRadius: 6, lineHeight: 1,
            }}>
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>

          {/* URL 输入 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入网页 URL…"
              style={{
                flex: 1, background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '10px 14px',
                color: '#E2E8F0', fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={startScan}
              style={{
                background: '#3B82F6', color: 'white', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontSize: 13,
                fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              扫描
            </button>
          </div>

          {/* 文件拖放 */}
          <div
            ref={dropzoneRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            }}
            style={{
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: 8, padding: 16, textAlign: 'center',
              cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.15s',
            }}
          >
            <span style={{ color: '#4B5563', fontSize: 11 }}>
              📁 拖放本地 HTML / CSS 文件到此处
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.css,.htm"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files.length > 0) handleFile(e.target.files[0]);
            }}
          />

          {/* 分割线 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: '#374151', fontSize: 10 }}>或</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* 状态 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8, marginBottom: 12,
            background: status === 'done' ? 'rgba(16,185,129,0.1)' :
                        status === 'loading' ? 'rgba(59,130,246,0.1)' :
                        status === 'error' ? 'rgba(239,68,68,0.1)' :
                        'rgba(255,255,255,0.03)',
            color: status === 'done' ? '#6EE7B7' :
                   status === 'loading' ? '#60A5FA' :
                   status === 'error' ? '#FCA5A5' : '#4B5563',
            fontSize: 11,
          }}>
            {status === 'loading' && (
              <div style={{
                width: 14, height: 14,
                border: '2px solid rgba(59,130,246,0.2)',
                borderTopColor: '#3B82F6',
                borderRadius: '50%',
                animation: 'none',
              }} />
            )}
            <span>{statusText}</span>
          </div>

          {/* 结果列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
            {results.map(item => {
              const isAdded = item.added;
              const nodeIcon = NODE_ICONS[item.suggestedNode] || '📦';
              return (
                <div key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    transition: 'all 0.1s',
                    opacity: isAdded ? 0.6 : 1,
                    border: isAdded ? '1px solid rgba(16,185,129,0.15)' : '1px solid transparent',
                    background: isAdded ? 'rgba(16,185,129,0.03)' : 'transparent',
                  }}
                >
                  {item.type === 'color' ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: item.value, flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.1)',
                    }} />
                  ) : (
                    <div style={{
                      width: 28, height: 28,
                      background: 'rgba(139,92,246,0.1)', borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      {nodeIcon}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#E2E8F0', fontSize: 11, fontWeight: 500 }}>
                      {nodeIcon} {item.name}
                    </div>
                    <div style={{ color: '#4B5563', fontSize: 9, marginTop: 1 }}>
                      <span style={{
                        color: '#6B7280', fontFamily: 'monospace',
                        background: 'rgba(0,0,0,0.2)', padding: '1px 6px',
                        borderRadius: 4,
                      }}>
                        {typeof item.value === 'string' ? item.value : JSON.stringify(item.value)}
                      </span> · {item.type}
                    </div>
                  </div>

                  {isAdded ? (
                    <span style={{ color: '#10B981', fontSize: 10, padding: '4px 8px', flexShrink: 0 }}>
                      ✓ 已添加
                    </span>
                  ) : (
                    <span
                      onClick={() => addToCanvas(item.id)}
                      style={{
                        color: '#6B7280', fontSize: 10, padding: '4px 8px',
                        borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      + 添加
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部 */}
        <div style={{
          display: 'flex', gap: 8,
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button onClick={addAllToCanvas}
            disabled={results.filter(r => !r.added).length === 0}
            style={{
              flex: 1, color: 'white', border: 'none', borderRadius: 8,
              padding: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: results.filter(r => !r.added).length === 0 ? 'rgba(59,130,246,0.3)' : '#3B82F6',
            }}>
            全部添加到画布（{results.filter(r => !r.added).length}）
          </button>
          <button onClick={() => setOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', color: '#9CA3AF',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
              padding: '10px 20px', fontSize: 12, cursor: 'pointer',
            }}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================
//  默认属性
// =====================

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
      return { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'nowrap', padding: 0 };
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
    default:
      return {};
  }
}
