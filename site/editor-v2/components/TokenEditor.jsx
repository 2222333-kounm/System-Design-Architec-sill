import React, { useState, useEffect, useCallback } from 'react';

/**
 * 全局 Token 可视化编辑器
 * 列出来所有 CSS 变量，支持实时编辑和导出
 */
export default function TokenEditor({ open, onClose }) {
  const [tokens, setTokens] = useState({});
  const [categories, setCategories] = useState({});
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) return;
    // 延迟读取，确保 DOM 已加载
    const t = setTimeout(() => {
      const tr = window.TokenReader;
      if (!tr) return;
      tr.refresh();
      setCategories(tr.getCategories());
      setTokens(tr.getAll());
    }, 100);
    return () => clearTimeout(t);
  }, [open]);

  const updateToken = useCallback((name, value) => {
    const tr = window.TokenReader;
    if (!tr) return;
    tr.set(name, value);
    setTokens(prev => ({ ...prev, [name]: value }));
    // 通知全局 Token 节点更新
    window.dispatchEvent(new CustomEvent('token-update', { detail: { name, value } }));
  }, []);

  const handleExport = useCallback(() => {
    const tr = window.TokenReader;
    if (!tr) return;
    const css = tr.exportCSS();
    navigator.clipboard.writeText(css).then(() => {
      setToast('✅ CSS 已复制到剪贴板');
      setTimeout(() => setToast(null), 2000);
    });
  }, []);

  const handleDownload = useCallback(() => {
    const tr = window.TokenReader;
    if (!tr) return;
    const css = tr.exportCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tokens.css'; a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!open) return null;

  const isColor = (v) => /^#[0-9a-f]{3,6}$/i.test(v) || /^rgb/.test(v);
  const isNumber = (v) => /^[\d.]+/.test(v);

  const filteredCats = Object.entries(categories).filter(([cat, items]) => {
    if (!filter) return true;
    const kw = filter.toLowerCase();
    return cat.toLowerCase().includes(kw) || items.some(i => i.name.includes(kw) || i.value.toLowerCase().includes(kw));
  });

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 600, maxHeight: '85vh', background: 'rgba(22,24,30,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>🌐 全局 Token</h2>
          <span style={{ color: '#4B5563', fontSize: 10, marginLeft: 8 }}>{Object.keys(tokens).length} 个变量</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B7280', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>✕</button>
        </div>

        <div style={{ padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="搜索 Token…"
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '6px 10px', color: '#E2E8F0', fontSize: 11, outline: 'none' }} />
          <button onClick={handleExport} title="复制 CSS"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, padding: '6px 12px', fontSize: 10, cursor: 'pointer' }}>📋 复制</button>
          <button onClick={handleDownload} title="下载 tokens.css"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '6px 12px', fontSize: 10, cursor: 'pointer' }}>⬇ 下载</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {filteredCats.map(([cat, items]) => (
            <details key={cat} open={cat === '颜色' || !!filter} style={{ marginBottom: 8 }}>
              <summary style={{ color: '#93C5FD', fontSize: 10, fontWeight: 600, cursor: 'pointer', padding: '4px 8px', background: 'rgba(59,130,246,0.06)', borderRadius: 6, marginBottom: 4 }}>
                {cat} · {items.length}
              </summary>
              <div style={{ paddingLeft: 4 }}>
                {items.map(item => {
                  const isCol = isColor(item.value);
                  const isNum = isNumber(item.value);
                  const displayName = item.name.replace('--', '');
                  return (
                    <div key={item.name}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', marginBottom: 2, borderRadius: 4, background: 'rgba(0,0,0,0.15)' }}>
                      <span style={{ color: '#94A3B8', fontSize: 8, fontFamily: 'monospace', width: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }} title={displayName}>{displayName}</span>

                      {isCol ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input type="color" value={item.value} onChange={e => updateToken(item.name, e.target.value)}
                            style={{ width: 22, height: 22, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'transparent' }} />
                          <input type="text" value={item.value} onChange={e => updateToken(item.name, e.target.value)}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 3, padding: '2px 4px', color: '#E2E8F0', fontSize: 9, fontFamily: 'monospace', outline: 'none' }} />
                        </div>
                      ) : isNum ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input type="range" min={0} max={parseInt(item.value) * 2 || 200} value={parseInt(item.value) || 0}
                            onChange={e => updateToken(item.name, e.target.value + item.value.replace(/[\d.]+/g, ''))}
                            style={{ flex: 1, height: 3, accentColor: '#3B82F6' }} />
                          <input type="text" value={item.value} onChange={e => updateToken(item.name, e.target.value)}
                            style={{ width: 50, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 3, padding: '2px 4px', color: '#E2E8F0', fontSize: 9, textAlign: 'right', fontFamily: 'monospace', outline: 'none' }} />
                        </div>
                      ) : (
                        <input type="text" value={item.value} onChange={e => updateToken(item.name, e.target.value)}
                          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 3, padding: '2px 4px', color: '#E2E8F0', fontSize: 9, fontFamily: 'monospace', outline: 'none' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </div>

        {toast && (
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
