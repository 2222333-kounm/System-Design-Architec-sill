import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

const MODES = ['text→css','color→css','image→css','css→text','object→json','json→object'];

function ConvertNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#64748B' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 260, boxShadow: selected ? '0 0 0 1px rgba(100,116,139,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(100,116,139,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <Handle type="target" position={Position.Left} id="any-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🔄 转换</span>
        <Handle type="source" position={Position.Right} id="any" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>
      <div style={{ padding: 12 }}>
        <select value={p.mode || 'text→css'} onChange={(e) => onChange('mode', e.target.value)}
          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '6px 8px', color: '#E2E8F0', fontSize: 10, outline: 'none' }}>
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{ marginTop: 8, textAlign: 'center', color: '#4B5563', fontSize: 8, fontFamily: 'monospace' }}>
          {p.mode || 'text→css'}
        </div>
      </div>
    </div>
  );
}

export default memo(ConvertNode);
