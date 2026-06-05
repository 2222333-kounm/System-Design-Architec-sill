import React, { useState, useMemo } from 'react';

/**
 * 导出代码面板 — 将节点链路转换为 HTML/CSS/React/Vue 代码
 */
export default function ExportPanel({ nodes = [], edges = [], onClose }) {
  const [format, setFormat] = useState('html');
  const [copied, setCopied] = useState(false);

  // 从输出节点反向遍历，收集链路数据
  const codeData = useMemo(() => {
    if (!nodes || nodes.length === 0) return null;

    // 找输出节点
    const outputNode = nodes.find(n => n.type === 'output');
    if (!outputNode) return { error: '画布上没有输出节点' };

    // 反向遍历找上游
    const visited = new Set();
    const queue = [outputNode.id];
    const chain = [];

    while (queue.length > 0) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const node = nodes.find(n => n.id === id);
      if (!node) continue;
      chain.unshift(node);
      // 找输入边
      edges.filter(e => e.target === id).forEach(e => {
        if (!visited.has(e.source)) queue.push(e.source);
      });
    }

    return { chain, outputNode, count: chain.length };
  }, [nodes, edges]);

  // 生成代码
  const generatedCode = useMemo(() => {
    if (!codeData || codeData.error) return codeData?.error || '暂无数据';
    const chain = codeData.chain;

    // 收集 CSS
    const cssProps = {};
    const elements = [];

    chain.forEach(node => {
      const p = node.data?.properties;
      if (!p) return;
      const type = node.type;

      if (type === 'colorBlock') {
        cssProps['background'] = p.color;
        cssProps['width'] = p.width + (p.widthUnit || 'px');
        cssProps['height'] = p.height + (p.heightUnit || 'px');
        cssProps['border-radius'] = p.borderRadius + 'px';
        cssProps['opacity'] = String((p.opacity ?? 100) / 100);
        elements.push({ tag: 'div', className: 'color-block', content: '' });
      }
      if (type === 'text') {
        cssProps['font-family'] = p.fontFamily || 'sans-serif';
        cssProps['font-size'] = (p.fontSize || 16) + (p.fontSizeUnit || 'px');
        cssProps['font-weight'] = String(p.fontWeight || 400);
        cssProps['line-height'] = String(p.lineHeight || 1.5);
        cssProps['color'] = p.color || '#1D1D1F';
        cssProps['text-align'] = p.textAlign || 'left';
        elements.push({ tag: 'div', className: 'text', content: p.content || '' });
      }
      if (type === 'button') {
        cssProps['display'] = 'inline-block'; cssProps['padding'] = '8px 16px';
        cssProps['background'] = p.color || '#0071E3'; cssProps['color'] = p.textColor || '#FFF';
        cssProps['border-radius'] = (p.borderRadius ?? 980) + 'px'; cssProps['border'] = 'none';
        elements.push({ tag: 'button', className: 'btn', content: p.text || '按钮' });
      }
    });

    // 格式化 CSS
    const cssStr = Object.entries(cssProps).filter(([, v]) => v != null && v !== '').map(([k, v]) => `  ${k}: ${v};`).join('\n');

    switch (format) {
      case 'html': {
        const html = elements.map(el => `  <${el.tag} class="${el.className}">${el.content}</${el.tag}>`).join('\n');
        return `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style>\n.${elements.map(e => e.className).join(',\n.')} {\n${cssStr}\n  }\n  </style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
      }
      case 'react': {
        const jsx = elements.map(el => `      <${el.tag} className="${el.className}">${el.content}</${el.tag}>`).join('\n');
        return `import React from 'react';\n\nconst styles = {\n${elements.map(e => `  ${e.className}: {\n${Object.entries(cssProps).map(([k, v]) => `    ${k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}: '${v}',`).join('\n')}\n  }`).join(',\n\n')}\n};\n\nexport default function Component() {\n  return (\n    <div style={styles.${elements[0]?.className || 'container'}}>\n${jsx}\n    </div>\n  );\n}`;
      }
      case 'vue': {
        const tmpl = elements.map(el => `  <${el.tag} class="${el.className}">${el.content}</${el.tag}>`).join('\n');
        return `<template>\n  <div class="container">\n${tmpl}\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'ExportedComponent',\n};\n</script>\n\n<style scoped>\n.container {\n${cssStr}\n}\n</style>`;
      }
      default: return '';
    }
  }, [codeData, format]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const ext = format === 'html' ? 'html' : format === 'react' ? 'jsx' : 'vue';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'export.' + ext; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 600, maxHeight: '80vh', background: 'rgba(22,24,30,0.98)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>📤 导出代码</h2>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B7280', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>✕</button>
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {[
            { key: 'html', label: 'HTML+CSS' },
            { key: 'react', label: 'React JSX' },
            { key: 'vue', label: 'Vue SFC' },
          ].map(f => (
            <div key={f.key} onClick={() => setFormat(f.key)}
              style={{ padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 500,
                background: format === f.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${format === f.key ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: format === f.key ? '#93C5FD' : '#6B7280' }}>
              {f.label}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ color: '#4B5563', fontSize: 9, alignSelf: 'center' }}>{codeData?.count || 0} 节点</div>
        </div>

        {/* code */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {codeData?.error ? (
            <div style={{ color: '#FCA5A5', fontSize: 12, padding: 12 }}>{codeData.error}</div>
          ) : (
            <pre style={{
              margin: 0, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 14,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.5,
              color: '#94A3B8', overflow: 'auto', whiteSpace: 'pre-wrap',
            }}>{generatedCode}</pre>
          )}
        </div>

        {/* bottom */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleCopy}
            style={{ flex: 1, background: copied ? 'rgba(16,185,129,0.2)' : '#3B82F6', color: copied ? '#6EE7B7' : 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            {copied ? '✅ 已复制' : '📋 复制代码'}
          </button>
          <button onClick={handleDownload}
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}>
            ⬇ 下载
          </button>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
