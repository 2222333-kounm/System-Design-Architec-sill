import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

const PRESETS = {
  mobile: { label: '移动端', width: 734, condition: 'max-width' },
  tablet: { label: '平板', width: 1068, condition: 'max-width' },
  desktop: { label: '桌面', width: 1069, condition: 'min-width' },
};

function BreakpointNode({ data, selected }) {
  const p = data.properties || {};
  const bp = p.breakpoint || 'mobile';
  const isCustom = bp === 'custom';

  const onChange = useCallback((key, value) => {
    data.onChange?.(data.id, { ...p, [key]: value });
  }, [data, p]);

  const preset = PRESETS[bp];
  const width = isCustom ? (p.customWidth || 734) : (preset?.width || 734);
  const condition = isCustom ? (p.condition || 'max-width') : (preset?.condition || 'max-width');

  return (
    <div style={{
      background: '#2A2D35',
      border: `2px solid ${selected ? '#10B981' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12, width: 300,
      boxShadow: selected ? '0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px 10px 0 0',
      }}>
        <Handle type="target" position={Position.Left} id="css-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>📱 断点</span>
        <Handle type="source" position={Position.Right} id="responsive" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {Object.entries(PRESETS).map(([key, val]) => (
            <div key={key} onClick={() => onChange('breakpoint', key)}
              style={{ flex: 1, padding: '6px 4px', textAlign: 'center', background: bp === key ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${bp === key ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: bp === key ? '#6EE7B7' : '#6B7280', fontSize: 9, fontWeight: bp === key ? 600 : 400, cursor: 'pointer' }}>
              {val.label}<br /><span style={{ fontSize: 7, color: '#4B5563' }}>{val.condition}: {val.width}px</span>
            </div>
          ))}
          <div key="custom" onClick={() => onChange('breakpoint', 'custom')}
            style={{ flex: 1, padding: '6px 4px', textAlign: 'center', background: isCustom ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isCustom ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: isCustom ? '#6EE7B7' : '#6B7280', fontSize: 9, fontWeight: isCustom ? 600 : 400, cursor: 'pointer' }}>自定义</div>
        </div>

        {isCustom && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <select value={p.condition || 'max-width'} onChange={(e) => onChange('condition', e.target.value)}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }}>
              <option value="max-width">max-width</option>
              <option value="min-width">min-width</option>
            </select>
            <input type="text" value={p.customWidth || 734} onChange={(e) => onChange('customWidth', Number(e.target.value) || 0)}
              style={{ width: 50, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, textAlign: 'right', outline: 'none' }} />
            <span style={{ color: '#4B5563', fontSize: 8, alignSelf: 'center' }}>px</span>
          </div>
        )}

        <ParamRow label="覆盖">
          <textarea value={p.overrides || ''} onChange={(e) => onChange('overrides', e.target.value)}
            placeholder="fontSize: 32px&#10;padding: 16px&#10;flexDirection: column"
            style={{ flex: 1, height: 40, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 8, outline: 'none', resize: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
        </ParamRow>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 36, height: 24, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}><span style={{ fontSize: 9 }}>🖥</span></div>
            <span style={{ color: '#6B7280', fontSize: 6, display: 'block' }}>桌面</span>
          </div>
          <span style={{ color: '#4B5563', fontSize: 9 }}>→</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 20, height: 28, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}><span style={{ fontSize: 7 }}>📱</span></div>
            <span style={{ color: '#6B7280', fontSize: 6, display: 'block' }}>移动端</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 4, color: '#4B5563', fontSize: 7 }}>
          @media ({condition}: {width}px)
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <span style={{ color: '#6B7280', fontSize: 9, width: 30, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>{children}</div>
    </div>
  );
}

export default memo(BreakpointNode);
