import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * 输出节点
 * 对应 V1 的 sill/output
 */
function OutputNode({ data, selected }) {
  return (
    <div
      style={{
        background: '#2A2D35',
        border: `2px solid ${selected ? '#FCD34D' : 'rgba(250,204,21,0.3)'}`,
        borderRadius: 12,
        width: 180,
        boxShadow: selected ? '0 0 0 1px rgba(250,204,21,0.2), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: 'rgba(250,204,21,0.1)',
          borderRadius: 10,
        }}
      >
        <Handle type="target" position={Position.Left} id="data-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>📤 输出</span>
      </div>
      <div style={{ padding: '8px 12px 12px', textAlign: 'center' }}>
        <span style={{ color: '#4B5563', fontSize: 9 }}>数据推送到预览面板</span>
      </div>
    </div>
  );
}

export default memo(OutputNode);
