import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

function GlobalTokenNode({ data, selected }) {
  const [tokens, setTokens] = useState({ count: 0, categories: {} });

  useEffect(() => {
    const ts = window.TokenStore;
    if (!ts) return;
    ts.refresh();
    const cats = { color: [], typography: [], spacing: [], radius: [] };
    ts.keys().forEach(k => {
      if (k.startsWith('--color-')) cats.color.push(k);
      else if (k.startsWith('--font-')) cats.typography.push(k);
      else if (k.startsWith('--spacing-')) cats.spacing.push(k);
      else if (k.startsWith('--radius-')) cats.radius.push(k);
    });
    setTokens({ count: ts.keys().length, categories: cats });
  }, []);

  return (
    <div style={{ background: '#2A2D35', border: `2px solid ${selected ? '#10B981' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, width: 300, boxShadow: selected ? '0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px 10px 0 0' }}>
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🌐 全局 Token</span>
        <Handle type="source" position={Position.Right} id="tokens" style={{ position: 'relative', top: 0, right: 0, transform: 'none' }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ color: '#6EE7B7', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>📦 {tokens.count} 个 Token</div>
        {Object.entries(tokens.categories).filter(([,v]) => v.length > 0).map(([cat, items]) => (
          <details key={cat} style={{ marginBottom: 4 }} open={cat === 'color'}>
            <summary style={{ color: '#93C5FD', fontSize: 9, cursor: 'pointer', padding: '3px 6px', background: 'rgba(59,130,246,0.08)', borderRadius: 4 }}>
              {cat === 'color' ? '🎨' : cat === 'typography' ? '🔤' : cat === 'spacing' ? '📏' : '⚪'} {cat} · {items.length}
            </summary>
            <div style={{ padding: '4px 6px' }}>
              {items.slice(0, 3).map(k => (
                <div key={k} style={{ color: '#94A3B8', fontSize: 7, fontFamily: 'monospace', padding: '1px 0' }}>
                  {k.replace('--', '')}: {window.TokenStore?.get(k) || ''}
                </div>
              ))}
              {items.length > 3 && <div style={{ color: '#4B5563', fontSize: 7 }}>…还有 {items.length - 3} 个</div>}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default memo(GlobalTokenNode);
