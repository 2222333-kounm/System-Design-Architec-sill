import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function MaskNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);
  const S = { flex: 1, gap: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: '3px 6px', display: 'flex', alignItems: 'center' };

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#10B981' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? '0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id="img-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🎭 蒙版</span>
        <Handle type="source" position={Position.Right} id="masked" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>
        <SelectParam label="形状" value={p.shape || '矩形'} options={['矩形','圆形','渐变']} onChange={(v) => onChange('shape', v)} />
        <SliderParam label="羽化" value={p.feather ?? 0} min={0} max={100} onChange={(v) => onChange('feather', v)} unit="px" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ color: '#6B7280', fontSize: 9, width: 40 }}>反转</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'rgba(0,0,0,0.2)', padding: '5px 8px', borderRadius: 5, flex: 1 }}>
            <input type="checkbox" checked={!!p.invert} onChange={(e) => onChange('invert', e.target.checked)} style={{ accentColor: '#10B981' }} />
            <span style={{ color: '#E2E8F0', fontSize: 9 }}>反转蒙版区域</span>
          </label>
        </div>
        {p.shape === '矩形' && <SliderParam label="圆角" value={p.borderRadius ?? 0} min={0} max={100} onChange={(v) => onChange('borderRadius', v)} unit="px" />}
      </div>
    </div>
  );
}

export default memo(MaskNode);
