import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function ShadowNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);
  const isInner = p.shadowType === '内阴影';

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? '0 0 0 1px rgba(139,92,246,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(139,92,246,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id="css-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>💡 阴影</span>
        <Handle type="source" position={Position.Right} id="css" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>
        <SelectParam label="类型" value={p.shadowType || '投影'} options={['投影','内阴影']} onChange={(v) => onChange('shadowType', v)} />
        <SliderParam label="X偏移" value={p.offsetX ?? 0} min={-50} max={50} onChange={(v) => onChange('offsetX', v)} unit="px" />
        <SliderParam label="Y偏移" value={p.offsetY ?? 4} min={-50} max={50} onChange={(v) => onChange('offsetY', v)} unit="px" />
        <SliderParam label="模糊" value={p.blur ?? 10} min={0} max={100} onChange={(v) => onChange('blur', v)} unit="px" />
        <SliderParam label="扩展" value={p.spread ?? 0} min={0} max={50} onChange={(v) => onChange('spread', v)} unit="px" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ color: '#6B7280', fontSize: 9, width: 40 }}>颜色</span>
          <input type="color" value={p.color || '#000000'} onChange={(e) => onChange('color', e.target.value)} style={{ width: 24, height: 24, border: 'none', borderRadius: 5, cursor: 'pointer', padding: 0 }} />
          <input type="text" value={p.color || '#000000'} onChange={(e) => onChange('color', e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }} />
        </div>
      </div>
      <div style={{ padding: '0 12px 12px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8, color: '#4B5563', fontSize: 8, fontFamily: 'monospace' }}>
          {isInner ? 'inset ' : ''}{p.offsetX ?? 0}px {p.offsetY ?? 4}px {p.blur ?? 10}px {p.spread ?? 0}px {p.color || '#000'}
        </div>
      </div>
    </div>
  );
}

export default memo(ShadowNode);
