import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function ButtonNode({ data, selected }) {
  const p = data.properties || {};
  const color = p.color || '#0071E3';
  const textColor = p.textColor || '#FFFFFF';
  const borderRadius = p.borderRadius ?? 980;
  const fontSize = p.fontSize || 14;
  const paddingMap = { xs: '4px 8px', sm: '8px 16px', md: '12px 24px', lg: '16px 32px', xl: '20px 40px' };
  const padding = paddingMap[p.padding] || '8px 16px';

  const onChange = useCallback((key, value) => {
    data.onChange?.(data.id, { ...p, [key]: value });
  }, [data, p]);

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
        <Handle type="target" position={Position.Left} id="text-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🔘 按钮</span>
        <Handle type="source" position={Position.Right} id="interactive" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        <ParamRow label="文字">
          <input value={p.text || '立即购买'} onChange={(e) => onChange('text', e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '5px 8px', color: '#E2E8F0', fontSize: 10, outline: 'none' }} />
        </ParamRow>

        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#6B7280', fontSize: 8, display: 'block', marginBottom: 4 }}>三态颜色</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'color', label: '默认', val: color },
              { key: 'hoverColor', label: 'hover', val: p.hoverColor || '#0077ED' },
              { key: 'activeColor', label: 'active', val: p.activeColor || '#0068D9' },
            ].map(t => (
              <div key={t.key} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: 4 }}>
                <span style={{ color: '#64748B', fontSize: 7, display: 'block', marginBottom: 2 }}>{t.label}</span>
                <input type="color" value={t.val} onChange={(e) => onChange(t.key, e.target.value)}
                  style={{ width: '100%', height: 20, border: 'none', borderRadius: 3, cursor: 'pointer', padding: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <ParamRow label="文字色">
          <input type="color" value={p.textColor || '#FFFFFF'} onChange={(e) => onChange('textColor', e.target.value)}
            style={{ width: 20, height: 20, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
          <span style={{ color: '#94A3B8', fontSize: 8, fontFamily: 'monospace' }}>{p.textColor || '#FFFFFF'}</span>
        </ParamRow>

        <ParamRow label="圆角">
          <SliderRange value={borderRadius} min={0} max={9999} onChange={(v) => onChange('borderRadius', v)} unit="px" />
        </ParamRow>

        <ParamRow label="内边距">
          <select value={p.padding || 'sm'} onChange={(e) => onChange('padding', e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }}>
            {['xs', 'sm', 'md', 'lg', 'xl'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </ParamRow>

        <ParamRow label="字号">
          <SliderRange value={fontSize} min={8} max={40} onChange={(v) => onChange('fontSize', v)} unit="px" />
        </ParamRow>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-block', padding, background: color, color: textColor,
            borderRadius: Math.min(borderRadius, 16), fontSize, cursor: 'pointer', textAlign: 'center',
          }}>{p.text || '按钮'}</div>
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
        style={{ flex: 1, height: 3, accentColor: '#F59E0B' }} />
      <input type="text" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width: 28, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 4px', color: '#E2E8F0', fontSize: 8, textAlign: 'right', outline: 'none' }} />
      {unit && <span style={{ color: '#4B5563', fontSize: 7 }}>{unit}</span>}
    </>
  );
}

export default memo(ButtonNode);
