import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function BorderNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? '0 0 0 1px rgba(245,158,11,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id="css-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>📦 边框</span>
        <Handle type="source" position={Position.Right} id="css" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>
        <SelectParam label="线型" value={p.lineType || '实线'} options={['实线','虚线','点线','双线']} onChange={(v) => onChange('lineType', v)} />
        <SliderParam label="粗细" value={p.thickness ?? 2} min={0} max={20} onChange={(v) => onChange('thickness', v)} unit="px" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ color: '#6B7280', fontSize: 9, width: 40 }}>颜色</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '3px' }}>
            <input type="color" value={p.color || '#E5E5E5'} onChange={(e) => onChange('color', e.target.value)} style={{ width: 20, height: 20, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
            <input type="text" value={p.color || '#E5E5E5'} onChange={(e) => onChange('color', e.target.value)} style={{ flex: 1, background: 'none', border: 'none', color: '#E2E8F0', fontSize: 9, fontFamily: 'monospace', outline: 'none' }} />
          </div>
        </div>
        <SliderParam label="圆角" value={p.borderRadius ?? 8} min={0} max={9999} onChange={(v) => onChange('borderRadius', v)} unit="px" />
      </div>
    </div>
  );
}

export default memo(BorderNode);
