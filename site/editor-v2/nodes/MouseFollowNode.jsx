import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function MouseFollowNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);
  const colors = { '视差': '#EC4899', '发光': '#F59E0B', '3D倾斜': '#3B82F6' };

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#EC4899' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? '0 0 0 1px rgba(236,72,153,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(236,72,153,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id="css-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🖱️ 鼠标跟随</span>
        <Handle type="source" position={Position.Right} id="interactive" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {['视差','发光','3D倾斜'].map(e => (
            <div key={e} onClick={() => onChange('effect', e)} style={{ flex: 1, padding: '6px 4px', textAlign: 'center', background: (p.effect || '视差') === e ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${(p.effect||'视差')===e ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: (p.effect||'视差')===e ? '#F9A8D4' : '#6B7280', fontSize: 10, cursor: 'pointer' }}>{e}</div>
          ))}
        </div>
        <SliderParam label="强度" value={p.strength ?? 0.3} min={0} max={1} step={0.05} onChange={(v) => onChange('strength', v)} />
        <SliderParam label="范围" value={p.range ?? 200} min={50} max={500} step={10} onChange={(v) => onChange('range', v)} unit="px" />
        <SelectParam label="缓动" value={p.easing || 'ease-out'} options={['ease-out','linear','ease-in','ease-in-out']} onChange={(v) => onChange('easing', v)} />
      </div>
    </div>
  );
}

export default memo(MouseFollowNode);
