import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function TextNode({ data, selected }) {
  const p = data.properties || {};

  const onChange = useCallback(
    (key, value) => {
      data.onChange?.(data.id, { ...p, [key]: value });
    },
    [data, p]
  );

  return (
    <div style={{
      background: '#2A2D35',
      border: `2px solid ${selected ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12,
      width: 310,
      boxShadow: selected ? '0 0 0 1px rgba(139,92,246,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        background: 'rgba(139,92,246,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px 10px 0 0',
      }}>
        <Handle type="target" position={Position.Left} id="content-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>📝 文字</span>
        <Handle type="source" position={Position.Right} id="styled-text" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#6B7280', fontSize: 9 }}>内容</span>
          <textarea value={p.content || ''} onChange={(e) => onChange('content', e.target.value)}
            style={{ width: '100%', height: 40, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '5px 8px', color: '#E2E8F0', fontSize: 10, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        <ParamRow label="字体">
          <select value={p.fontFamily || 'PingFang SC'} onChange={(e) => onChange('fontFamily', e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }}>
            <option>PingFang SC</option><option>SF Pro Display</option><option>Inter</option><option>Georgia</option><option>monospace</option>
          </select>
        </ParamRow>

        <ParamRow label="字号">
          <SliderRange value={p.fontSize || 16} min={8} max={120} onChange={(v) => onChange('fontSize', v)} unit={p.fontSizeUnit || 'px'} />
          <UnitSelect value={p.fontSizeUnit || 'px'} onChange={(v) => onChange('fontSizeUnit', v)} options={['px', 'em', 'rem']} />
        </ParamRow>

        <ParamRow label="字重">
          <select value={p.fontWeight || 400} onChange={(e) => onChange('fontWeight', Number(e.target.value))}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none' }}>
            {[100,200,300,400,500,600,700,800,900].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </ParamRow>

        <ParamRow label="行高">
          <SliderRange value={p.lineHeight || 1.5} min={0.5} max={3} step={0.1} onChange={(v) => onChange('lineHeight', v)} />
        </ParamRow>

        <ParamRow label="字距">
          <SliderRange value={p.letterSpacing ?? 0} min={-10} max={20} onChange={(v) => onChange('letterSpacing', v)} unit="em" />
        </ParamRow>

        <ParamRow label="颜色">
          <input type="color" value={p.color || '#1D1D1F'} onChange={(e) => onChange('color', e.target.value)}
            style={{ width: 24, height: 24, border: 'none', borderRadius: 5, cursor: 'pointer', padding: 0 }} />
          <span style={{ color: '#94A3B8', fontSize: 9, fontFamily: 'monospace', marginLeft: 4 }}>{p.color || '#1D1D1F'}</span>
        </ParamRow>

        <ParamRow label="对齐">
          {['left', 'center', 'right'].map(a => (
            <div key={a} onClick={() => onChange('textAlign', a)}
              style={{ flex: 1, padding: '4px', textAlign: 'center', background: (p.textAlign || 'left') === a ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, color: (p.textAlign || 'left') === a ? '#C4B5FD' : '#6B7280', fontSize: 9, cursor: 'pointer' }}>{a === 'left' ? '⬅' : a === 'center' ? '⬌' : '➡'}</div>
          ))}
        </ParamRow>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px', maxWidth: '100%' }}>
          <span style={{
            color: p.color || '#E2E8F0', fontSize: (p.fontSize || 16) + (p.fontSizeUnit || 'px'),
            fontWeight: p.fontWeight || 400, lineHeight: p.lineHeight || 1.5,
            fontFamily: p.fontFamily || 'sans-serif', letterSpacing: (p.letterSpacing ?? 0) + 'em',
            textAlign: p.textAlign || 'left', wordBreak: 'break-word', overflowWrap: 'break-word',
          }}>
            {p.content || '文字预览'}
          </span>
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

function SliderRange({ value, min, max, step, onChange, unit }) {
  return (
    <>
      <input type="range" min={min} max={max} step={step || 1} value={value}
        onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, height: 3, accentColor: '#8B5CF6' }} />
      <input type="text" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width: 30, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 4px', color: '#E2E8F0', fontSize: 9, textAlign: 'right', outline: 'none' }} />
      {unit && <span style={{ color: '#4B5563', fontSize: 7 }}>{unit}</span>}
    </>
  );
}

function UnitSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px', color: '#4B5563', fontSize: 7, outline: 'none' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default memo(TextNode);
