import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

const ICONS = ['🔍','🔔','⚙️','📁','❤️','⭐','💬','📌','🔗','💾','📤','📥','🔄','🎯','🧩','🔒','🌐','✏️','🗑️','📊'];

function IconNode({ data, selected }) {
  const p = data.properties || {};
  const icon = p.icon || '❤️';
  const size = p.size || 24;
  const color = p.color || '#1D1D1F';
  const opacity = (p.opacity ?? 100) / 100;

  const onChange = useCallback((key, value) => {
    data.onChange?.(data.id, { ...p, [key]: value });
  }, [data, p]);

  return (
    <div style={{
      background: '#2A2D35',
      border: `2px solid ${selected ? '#EC4899' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12, width: 300,
      boxShadow: selected ? '0 0 0 1px rgba(236,72,153,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        background: 'rgba(236,72,153,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px 10px 0 0',
      }}>
        <Handle type="target" position={Position.Left} id="any-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🔣 图标</span>
        <Handle type="source" position={Position.Right} id="css" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        <ParamRow label="图标">
          <select value={icon} onChange={(e) => onChange('icon', e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '5px 6px', color: '#E2E8F0', fontSize: 10, outline: 'none' }}>
            {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </ParamRow>

        <ParamRow label="大小">
          <SliderRange value={size} min={8} max={128} onChange={(v) => onChange('size', v)} unit="px" />
        </ParamRow>

        <ParamRow label="颜色">
          <input type="color" value={p.color || '#1D1D1F'} onChange={(e) => onChange('color', e.target.value)}
            style={{ width: 22, height: 22, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
          <span style={{ color: '#94A3B8', fontSize: 8, fontFamily: 'monospace' }}>{p.color || '#1D1D1F'}</span>
        </ParamRow>

        <ParamRow label="透明度">
          <SliderRange value={p.opacity ?? 100} min={0} max={100} onChange={(v) => onChange('opacity', v)} unit="%" />
        </ParamRow>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: Math.min(size, 48), color, opacity, lineHeight: 1 }}>{icon}</span>
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

function SliderRange({ value, min, max, onChange, unit }) {
  return (
    <>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 3, accentColor: '#EC4899' }} />
      <input type="text" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width: 28, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 4px', color: '#E2E8F0', fontSize: 8, textAlign: 'right', outline: 'none' }} />
      {unit && <span style={{ color: '#4B5563', fontSize: 7 }}>{unit}</span>}
    </>
  );
}

export default memo(IconNode);
