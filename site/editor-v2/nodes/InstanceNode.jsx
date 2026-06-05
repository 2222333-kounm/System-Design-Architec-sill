import React, { memo, useCallback, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * 组件实例节点 — React Flow 版本
 * 引用已保存的组件定义，支持插槽映射和样式覆盖
 */
function InstanceNode({ data, selected }) {
  const p = data.properties || {};
  const componentId = p.componentId || '';
  const compDef = data.componentDef; // 由 App.jsx 传入

  const onChange = useCallback((key, value) => {
    data.onChange?.(data.id, { ...p, [key]: value });
  }, [data, p]);

  // 解析插槽字符串 "title=Hello,button=Click"
  const slots = useMemo(() => {
    const str = p.slots || '';
    const result = {};
    str.split(',').forEach(pair => {
      const [k, ...v] = pair.split('=');
      if (k && v.length) result[k.trim()] = v.join('=').trim();
    });
    return result;
  }, [p.slots]);

  return (
    <div style={{
      background: '#2A2D35',
      border: `2px solid ${selected ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12, width: 300,
      boxShadow: selected ? '0 0 0 1px rgba(139,92,246,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        background: 'rgba(139,92,246,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px 10px 0 0',
      }}>
        <Handle type="target" position={Position.Left} id="slot-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>♻ {p.instanceName || '组件实例'}</span>
        <Handle type="source" position={Position.Right} id="instance" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        {/* 选择组件 */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#6B7280', fontSize: 9, display: 'block', marginBottom: 3 }}>引用组件</span>
          <select value={componentId} onChange={(e) => onChange('componentId', e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '5px 6px', color: '#E2E8F0', fontSize: 10, outline: 'none' }}>
            <option value="">— 选择组件 —</option>
            <option disabled>────────</option>
            {componentStore.list().map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* 实例名 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ color: '#6B7280', fontSize: 9, width: 45 }}>实例名</span>
          <input value={p.instanceName || ''} onChange={(e) => onChange('instanceName', e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }} />
        </div>

        {/* 引用组件信息 */}
        {compDef && (
          <div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 6, padding: 6, marginBottom: 8 }}>
            <div style={{ color: '#C4B5FD', fontSize: 8, marginBottom: 4 }}>
              📦 {compDef.name} · {compDef.nodes.length} 节点 · {compDef.edges.length} 连线
            </div>
            <div style={{ color: '#4B5563', fontSize: 7 }}>
              创建于 {new Date(compDef.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* 插槽输入 */}
        {compDef && compDef.slots.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: '#6B7280', fontSize: 8, display: 'block', marginBottom: 4 }}>插槽映射</span>
            {compDef.slots.map((slot, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3, background: 'rgba(0,0,0,0.15)', borderRadius: 4, padding: '3px 6px' }}>
                <span style={{ color: '#C4B5FD', fontSize: 7, background: 'rgba(139,92,246,0.2)', padding: '1px 5px', borderRadius: 3, minWidth: 40, textAlign: 'center' }}>{slot.label || slot.field}</span>
                <span style={{ color: '#4B5563', fontSize: 7 }}>→</span>
                <input value={slots[slot.label] || ''}
                  onChange={(e) => {
                    const newSlots = { ...slots, [slot.label]: e.target.value };
                    const str = Object.entries(newSlots).map(([k, v]) => k + '=' + v).join(',');
                    onChange('slots', str);
                  }}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 3, padding: '2px 4px', color: '#E2E8F0', fontSize: 8, outline: 'none' }}
                  placeholder={slot.field} />
              </div>
            ))}
          </div>
        )}

        {/* 未选择组件时提示 */}
        {!compDef && (
          <div style={{ textAlign: 'center', color: '#4B5563', fontSize: 9, padding: 8 }}>
            先保存组件定义，再在此处引用
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(InstanceNode);
