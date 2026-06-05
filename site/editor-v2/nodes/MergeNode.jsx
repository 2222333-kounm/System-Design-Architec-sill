import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

function MergeNode({ data, selected }) {
  const p = data.properties || {};
  const onChange = useCallback((k, v) => data.onChange?.(data.id, { ...p, [k]: v }), [data, p]);

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#64748B' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 260, boxShadow: selected ? '0 0 0 1px rgba(100,116,139,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(100,116,139,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="A-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none' }} />A
          <Handle type="target" position={Position.Left} id="B-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none' }} />B
          <Handle type="target" position={Position.Left} id="C-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none' }} />C
        </div>
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🗂️ 合并</span>
        <Handle type="source" position={Position.Right} id="merged" style={{ position: 'relative', top: 0, right: 0, transform: 'none' }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['叠加','堆叠','覆盖'].map(m => (
            <div key={m} onClick={() => onChange('mode', m)}
              style={{ flex: 1, padding: '6px 4px', textAlign: 'center', background: (p.mode || '叠加') === m ? 'rgba(100,116,139,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${(p.mode||'叠加')===m ? 'rgba(100,116,139,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: (p.mode||'叠加')===m ? '#CBD5E1' : '#6B7280', fontSize: 10, cursor: 'pointer' }}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(MergeNode);
