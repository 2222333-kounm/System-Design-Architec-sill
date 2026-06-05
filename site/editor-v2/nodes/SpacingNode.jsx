import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function SpacingNode({ data, selected }) {
  const p = data.properties || {};
  const m = p.mode || 'padding';
  const control = p.control || 'uniform';
  const unit = p.unit || 'px';

  const onChange = useCallback((key, value) => {
    data.onChange?.(data.id, { ...p, [key]: value });
  }, [data, p]);

  const val = (k, d) => p[k] ?? d ?? 0;

  return (
    <div style={{
      background: '#2A2D35',
      border: `2px solid ${selected ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12, width: 310,
      boxShadow: selected ? '0 0 0 1px rgba(245,158,11,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px 10px 0 0',
      }}>
        <Handle type="target" position={Position.Left} id="css-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>↔ 间距</span>
        <Handle type="source" position={Position.Right} id="css" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {['padding', 'margin'].map(md => (
            <div key={md} onClick={() => onChange('mode', md)}
              style={{ flex: 1, padding: '6px', textAlign: 'center', background: m === md ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${m === md ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: m === md ? '#FCD34D' : '#6B7280', fontSize: 10, fontWeight: m === md ? 600 : 400, cursor: 'pointer' }}>{md === 'padding' ? 'Padding' : 'Margin'}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {['uniform', 'individual'].map(c => (
            <div key={c} onClick={() => onChange('control', c)}
              style={{ flex: 1, padding: '3px', textAlign: 'center', background: control === c ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${control === c ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 5, color: control === c ? '#FCD34D' : '#6B7280', fontSize: 8, cursor: 'pointer' }}>{c === 'uniform' ? '统一' : '独立'}</div>
          ))}
        </div>

        {control === 'uniform' ? (
          <SliderParam label="四方向" value={val('uniformValue', 16)} min={0} max={200} onChange={(v) => onChange('uniformValue', v)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
            {['Top', 'Right', 'Bottom', 'Left'].map(dir => (
              <div key={dir} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: '3px 6px' }}>
                <span style={{ color: '#6B7280', fontSize: 7, width: 20 }}>{dir}</span>
                <input type="range" min={0} max={200} value={val(m + dir)} onChange={(e) => onChange(m + dir, Number(e.target.value))} style={{ flex: 1, height: 2, accentColor: '#F59E0B' }} />
                <input type="text" value={val(m + dir)} onChange={(e) => onChange(m + dir, Number(e.target.value) || 0)} style={{ width: 22, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 3, padding: '1px 2px', color: '#E2E8F0', fontSize: 7, textAlign: 'right', outline: 'none' }} />
              </div>
            ))}
          </div>
        )}

        <SelectRow label="单位" value={unit} options={['px','em','%']} onChange={(v) => onChange('unit', v)} />
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 6, padding: Math.min(val('uniformValue', 16) / 2, 40), position: 'relative' }}>
            <div style={{ color: '#FCD34D', fontSize: 8 }}>{m}: {control === 'uniform' ? `${val('uniformValue', 16)}${unit}` : `${val(m+'Top',0)}${unit} ${val(m+'Right',0)}${unit} ${val(m+'Bottom',0)}${unit} ${val(m+'Left',0)}${unit}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <span style={{ color: '#6B7280', fontSize: 9, width: 40, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>{children}</div>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <ParamRow label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </ParamRow>
  );
}

function SliderParam({ label, value, min, max, onChange, unit }) {
  return (
    <ParamRow label={label}>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, height: 3, accentColor: '#F59E0B' }} />
      <input type="text" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} style={{ width: 28, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 4px', color: '#E2E8F0', fontSize: 8, textAlign: 'right', outline: 'none' }} />
    </ParamRow>
  );
}

export default memo(SpacingNode);
