import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function TransitionNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(59,130,246,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id="css-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>✨ 转场</span>
        <Handle type="source" position={Position.Right} id="interactive" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {['hover','click'].map(t => (
            <div key={t} onClick={() => onChange('trigger', t)} style={{ flex: 1, padding: '6px', textAlign: 'center', background: (p.trigger || 'hover') === t ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${(p.trigger||'hover')===t ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: (p.trigger||'hover')===t ? '#93C5FD' : '#6B7280', fontSize: 10, cursor: 'pointer' }}>{t}</div>
          ))}
        </div>
        <SelectParam label="变换" value={p.transformType || '缩放'} options={['缩放','位移','淡入','旋转']} onChange={(v) => onChange('transformType', v)} />
        <SliderParam label="目标值" value={p.targetValue ?? 1.2} min={0.1} max={5} step={0.1} onChange={(v) => onChange('targetValue', v)} />
        <SliderParam label="时长" value={p.duration ?? 0.3} min={0.1} max={5} step={0.1} onChange={(v) => onChange('duration', v)} unit="s" />
        <SliderParam label="延迟" value={p.delay ?? 0} min={0} max={5} step={0.1} onChange={(v) => onChange('delay', v)} unit="s" />
        <SelectParam label="缓动" value={p.easing || 'ease-out'} options={['ease-out','ease-in','ease-in-out','linear']} onChange={(v) => onChange('easing', v)} />
      </div>
    </div>
  );
}

export default memo(TransitionNode);
