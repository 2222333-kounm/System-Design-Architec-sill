import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function LayoutContainerNode({ data, selected }) {
  const p = data.properties || {};
  const mode = p.display || 'flex';

  const onChange = useCallback((key, value) => {
    data.onChange?.(data.id, { ...p, [key]: value });
  }, [data, p]);

  return (
    <div style={{
      background: '#2A2D35',
      border: `2px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12, width: 330,
      boxShadow: selected ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        background: 'rgba(59,130,246,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px 10px 0 0',
      }}>
        <Handle type="target" position={Position.Left} id="items-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>📐 布局容器</span>
        <Handle type="source" position={Position.Right} id="layout" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      <div style={{ padding: 12 }}>
        {/* Flex/Grid 切换 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {['flex', 'grid'].map(m => (
            <div key={m} onClick={() => { onChange('display', m); }}
              style={{ flex: 1, padding: '6px', textAlign: 'center', background: mode === m ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${mode === m ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: mode === m ? '#93C5FD' : '#6B7280', fontSize: 11, fontWeight: mode === m ? 600 : 400, cursor: 'pointer' }}>{m === 'flex' ? 'Flex' : 'Grid'}</div>
          ))}
        </div>

        {mode === 'flex' ? (
          <>
            <ParamRow label="方向">
              <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                {['row', 'column'].map(d => (
                  <div key={d} onClick={() => onChange('flexDirection', d)}
                    style={{ flex: 1, padding: '4px', textAlign: 'center', background: (p.flexDirection || 'row') === d ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, color: (p.flexDirection || 'row') === d ? '#93C5FD' : '#6B7280', fontSize: 9, cursor: 'pointer' }}>→ {d}</div>
                ))}
              </div>
            </ParamRow>
            <SelectRow label="主轴" value={p.justifyContent || 'flex-start'} options={['flex-start','center','flex-end','space-between','space-around','space-evenly']} onChange={(v) => onChange('justifyContent', v)} />
            <SelectRow label="交叉轴" value={p.alignItems || 'center'} options={['stretch','center','flex-start','flex-end']} onChange={(v) => onChange('alignItems', v)} />
            <SliderParam label="间距" value={p.gap ?? 16} min={0} max={100} onChange={(v) => onChange('gap', v)} unit="px" />
            <SelectRow label="换行" value={p.flexWrap || 'nowrap'} options={['nowrap','wrap','wrap-reverse']} onChange={(v) => onChange('flexWrap', v)} />
          </>
        ) : (
          <>
            <ParamRow label="列">
              <input value={p.gridTemplateColumns || '1fr 1fr 1fr'} onChange={(e) => onChange('gridTemplateColumns', e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none', fontFamily: 'monospace' }} />
            </ParamRow>
            <ParamRow label="行">
              <input value={p.gridTemplateRows || 'auto'} onChange={(e) => onChange('gridTemplateRows', e.target.value)}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 6px', color: '#E2E8F0', fontSize: 9, outline: 'none', fontFamily: 'monospace' }} />
            </ParamRow>
            <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
              <div style={{ flex: 1 }}><SliderParam label="行间距" value={p.rowGap ?? 16} min={0} max={100} onChange={(v) => onChange('rowGap', v)} unit="px" /></div>
              <div style={{ flex: 1 }}><SliderParam label="列间距" value={p.columnGap ?? 16} min={0} max={100} onChange={(v) => onChange('columnGap', v)} unit="px" /></div>
            </div>
            <SelectRow label="项对齐" value={p.justifyItems || 'center'} options={['start','end','center','stretch']} onChange={(v) => onChange('justifyItems', v)} />
            <SelectRow label="自动流" value={p.gridAutoFlow || 'row'} options={['row','column','dense','row dense','column dense']} onChange={(v) => onChange('gridAutoFlow', v)} />
          </>
        )}
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8 }}>
          {mode === 'flex' ? (
            <div style={{ display: 'flex', flexDirection: p.flexDirection || 'row', gap: (p.gap || 16) / 2, justifyContent: p.justifyContent || 'flex-start', alignItems: p.alignItems || 'center', minHeight: 30 }}>
              {[1,2,3].map(i => <div key={i} style={{ width: 16, height: 16, background: 'rgba(59,130,246,0.4)', borderRadius: 3 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 12, background: 'rgba(59,130,246,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#93C5FD', fontSize: 6 }}>{i}</span></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <span style={{ color: '#6B7280', fontSize: 9, width: 36, flexShrink: 0 }}>{label}</span>
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
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, height: 3, accentColor: '#3B82F6' }} />
      <input type="text" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width: 28, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 4px', color: '#E2E8F0', fontSize: 8, textAlign: 'right', outline: 'none' }} />
      {unit && <span style={{ color: '#4B5563', fontSize: 7 }}>{unit}</span>}
    </ParamRow>
  );
}

export default memo(LayoutContainerNode);
