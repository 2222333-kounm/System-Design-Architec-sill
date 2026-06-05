import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function TransformNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);

  return (
    <NodeWrap title="🔄 变换" selected={selected} color="#8B5CF6" id="css-in" outId="css">
      <SliderParam label="缩放" value={p.scale ?? 1} min={0.1} max={5} step={0.1} onChange={(v) => onChange('scale', v)} unit="×" />
      <SliderParam label="旋转" value={p.rotation ?? 0} min={-360} max={360} onChange={(v) => onChange('rotation', v)} unit="°" />
      <SliderParam label="透明度" value={p.opacity ?? 100} min={0} max={100} onChange={(v) => onChange('opacity', v)} unit="%" />
      <SliderParam label="圆角" value={p.borderRadius ?? 0} min={0} max={9999} onChange={(v) => onChange('borderRadius', v)} unit="px" />
    </NodeWrap>
  );
}

function NodeWrap({ title, selected, color, id, outId, children }) {
  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? color : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? `0 0 0 1px ${color}33, 0 8px 24px rgba(0,0,0,0.3)` : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: `${color}26`, borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id={id || 'in'} style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>{title}</span>
        <Handle type="source" position={Position.Right} id={outId || 'out'} style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}
const ParamRow = ({ label, children }) => (<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><span style={{ color: '#6B7280', fontSize: 9, width: 40, flexShrink: 0 }}>{label}</span><div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>{children}</div></div>);
const SliderParam = ({ label, value, min, max, step, onChange, unit }) => (
  <ParamRow label={label}>
    <input type="range" min={min} max={max} step={step || 1} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, height: 3, accentColor: '#8B5CF6' }} />
    <input type="text" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} style={{ width: 28, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 4px', color: '#E2E8F0', fontSize: 8, textAlign: 'right', outline: 'none' }} />
    {unit && <span style={{ color: '#4B5563', fontSize: 7 }}>{unit}</span>}
  </ParamRow>
);
const SelectParam = ({ label, value, options, onChange }) => (
  <ParamRow label={label}>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </ParamRow>
);

export default memo(TransformNode);
