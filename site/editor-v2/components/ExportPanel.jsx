import React, { useState, useMemo } from 'react';
import { buildTailwindClasses } from '../utils/tailwind-map';

/**
 * 导出代码面板 — HTML/CSS/React/Vue/Tailwind/SC + 响应式
 */
export default function ExportPanel({ nodes = [], edges = [], onClose }) {
  const [format, setFormat] = useState('html');
  const [copied, setCopied] = useState(false);
  const [responsive, setResponsive] = useState(true);

  // 反向遍历收集链路数据 + 断点信息
  const codeData = useMemo(() => {
    if (!nodes || nodes.length === 0) return null;
    const outputNode = nodes.find(n => n.type === 'output');
    if (!outputNode) return { error: '画布上没有输出节点' };

    const visited = new Set();
    const queue = [outputNode.id];
    const chain = [];
    const breakpoints = [];

    while (queue.length > 0) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const node = nodes.find(n => n.id === id);
      if (!node) continue;
      chain.unshift(node);
      if (node.type === 'breakpoint') {
        const p = node.data?.properties || {};
        const presets = { mobile: { w: 734, c: 'max-width' }, tablet: { w: 1068, c: 'max-width' }, desktop: { w: 1069, c: 'min-width' } };
        const pre = presets[p.breakpoint];
        const isCustom = p.breakpoint === 'custom';
        const w = isCustom ? (p.customWidth || 734) : (pre?.w || 734);
        const c = isCustom ? (p.condition || 'max-width') : (pre?.c || 'max-width');
        breakpoints.push({ mediaQuery: `(${c}: ${w}px)`, overrides: p.overrides || '' });
      }
      edges.filter(e => e.target === id).forEach(e => {
        if (!visited.has(e.source)) queue.push(e.source);
      });
    }
    return { chain, outputNode, count: chain.length, breakpoints };
  }, [nodes, edges]);

  const collectData = (chain) => {
    const cssProps = {}; const elements = [];
    chain.forEach(node => {
      const p = node.data?.properties; if (!p) return;
      const t = node.type;
      if (t === 'colorBlock') {
        cssProps['background'] = p.color || '#3B82F6';
        cssProps['width'] = (p.width || 320) + (p.widthUnit || 'px');
        cssProps['height'] = (p.height || 120) + (p.heightUnit || 'px');
        cssProps['border-radius'] = (p.borderRadius || 12) + 'px';
        cssProps['opacity'] = String((p.opacity ?? 100) / 100);
        elements.push({ tag: 'div', className: 'color-block', content: '', type: t });
      }
      if (t === 'text') {
        cssProps['font-family'] = p.fontFamily || 'sans-serif';
        cssProps['font-size'] = (p.fontSize || 16) + (p.fontSizeUnit || 'px');
        cssProps['font-weight'] = String(p.fontWeight || 400);
        cssProps['color'] = p.color || '#1D1D1F';
        elements.push({ tag: 'div', className: 'text', content: p.content || '', type: t });
      }
      if (t === 'button') {
        cssProps['background'] = p.color || '#0071E3';
        cssProps['color'] = p.textColor || '#FFF';
        cssProps['border-radius'] = (p.borderRadius ?? 980) + 'px';
        cssProps['display'] = 'inline-block';
        elements.push({ tag: 'button', className: 'btn', content: p.text || '按钮', type: t });
      }
      if (t === 'icon') {
        cssProps['font-size'] = (p.size || 24) + 'px';
        cssProps['color'] = p.color || '#1D1D1F';
        elements.push({ tag: 'span', className: 'icon', content: p.icon || '❤️', type: t });
      }
      if (t === 'layoutContainer') {
        cssProps['display'] = p.display === 'grid' ? 'grid' : 'flex';
        if (p.display !== 'grid') cssProps['justify-content'] = p.justifyContent || 'center';
        elements.push({ tag: 'div', className: p.display === 'grid' ? 'grid-container' : 'flex-container', content: '', type: t });
      }
      if (t === 'spacing') {
        const uk = p.unit || 'px'; const md = p.mode || 'padding'; const px = md === 'padding' ? 'padding' : 'margin';
        if (p.control === 'individual') {
          cssProps[px+'-top'] = (p[md+'Top'] ?? 0)+uk; cssProps[px+'-right'] = (p[md+'Right'] ?? 0)+uk;
          cssProps[px+'-bottom'] = (p[md+'Bottom'] ?? 0)+uk; cssProps[px+'-left'] = (p[md+'Left'] ?? 0)+uk;
        } else { cssProps[px] = (p.uniformValue ?? 16)+uk; }
      }
    });
    return { cssProps, elements };
  };

  const generatedCode = useMemo(() => {
    if (!codeData || codeData.error) return codeData?.error || '暂无数据';
    const chain = codeData.chain.filter(n => n.type !== 'breakpoint' && n.type !== 'output');
    const { cssProps, elements } = collectData(chain);

    const cssStr = Object.entries(cssProps).filter(([, v]) => v != null && v !== '').map(([k, v]) => `  ${k}: ${v};`).join('\n');
    const hasResp = responsive && codeData.breakpoints.length > 0;
    const rBlocks = hasResp ? codeData.breakpoints.map(bp => {
      const ov = bp.overrides.split('\n').filter(Boolean);
      if (!ov.length) return '';
      return `\n@media ${bp.mediaQuery} {\n${ov.map(l => { const [k,...v] = l.split(':'); return k ? `  ${k.trim()}: ${v.join(':').trim()};` : ''; }).filter(Boolean).join('\n')}\n}`;
    }).join('') : '';

    switch (format) {
      case 'html': {
        const h = elements.map(el => `  <${el.tag} class="${el.className}">${el.content}</${el.tag}>`).join('\n');
        return `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1.0">\n  <style>\n.element {\n${cssStr}\n}${rBlocks}\n  </style>\n</head>\n<body>\n${h}\n</body>\n</html>`;
      }
      case 'react': {
        const jsx = elements.map(el => `      <${el.tag} className="el">${el.content}</${el.tag}>`).join('\n');
        return `import React from 'react';\n\nconst styles = {\n  el: {\n${Object.entries(cssProps).map(([k,v]) => `    ${k.replace(/-([a-z])/g, (_,c) => c.toUpperCase())}: '${v}',`).join('\n')}\n  },\n};\n\nexport default function Component() {\n  return <div style={styles.el}>\n${jsx}\n  </div>;\n}`;
      }
      case 'vue': {
        const tmpl = elements.map(el => `  <${el.tag} class="el">${el.content}</${el.tag}>`).join('\n');
        return `<template>\n  <div class="el">\n${tmpl}\n  </div>\n</template>\n\n<style scoped>\n.el {\n${cssStr}\n}${rBlocks}\n</style>`;
      }
      case 'tailwind': {
        const tw = buildTailwindClasses(cssProps);
        const th = elements.map(el => `  <${el.tag} class="${tw}">${el.content}</${el.tag}>`).join('\n');
        return `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="dark bg-gray-950 min-h-screen flex items-center justify-center p-4">\n${th}\n</body>\n</html>`;
      }
      case 'styled': {
        const sc = elements.map(el => {
          const n = el.className.replace(/-(\w)/g, (_,c) => c.toUpperCase());
          return `const ${n} = styled.${el.tag}\`\n${Object.entries(cssProps).map(([k,v]) => `  ${k}: ${v};`).join('\n')}\n\`;`;
        }).join('\n\n');
        const sx = elements.map(el => `      <${el.className.replace(/-(\w)/g, (_,c) => c.toUpperCase())}>${el.content}</${el.className.replace(/-(\w)/g, (_,c) => c.toUpperCase())}>`).join('\n');
        return `import React from 'react';\nimport styled from 'styled-components';\n\n${sc}\n\nexport default function Component() {\n  return <>\n${sx}\n  </>;\n}`;
      }
      default: return '';
    }
  }, [codeData, format, responsive]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const handleDownload = () => {
    const em = { html:'html', react:'jsx', vue:'vue', tailwind:'html', styled:'js' };
    const b = new Blob([generatedCode], {type:'text/plain'});
    const u = URL.createObjectURL(b); const a = document.createElement('a');
    a.href=u; a.download='export.'+(em[format]||'txt'); a.click(); URL.revokeObjectURL(u);
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:9999, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:640, maxHeight:'80vh', background:'rgba(22,24,30,0.98)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin:0, fontSize:15, fontWeight:600, color:'#E2E8F0' }}>📤 导出代码</h2>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#6B7280', fontSize:20, cursor:'pointer', padding:'4px 8px', borderRadius:6 }}>✕</button>
        </div>

        <div style={{ padding:'10px 20px', display:'flex', gap:6, borderBottom:'1px solid rgba(255,255,255,0.04)', flexWrap:'wrap', alignItems:'center' }}>
          {[{key:'html',label:'HTML+CSS'},{key:'react',label:'React'},{key:'vue',label:'Vue'},{key:'tailwind',label:'Tailwind'},{key:'styled',label:'Styled 🎭'}].map(f => (
            <div key={f.key} onClick={()=>setFormat(f.key)}
              style={{ padding:'5px 12px', borderRadius:6, cursor:'pointer', fontSize:10, fontWeight:500,
                background:format===f.key?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.04)',
                border:`1px solid ${format===f.key?'rgba(59,130,246,0.3)':'rgba(255,255,255,0.06)'}`,
                color:format===f.key?'#93C5FD':'#6B7280' }}>{f.label}</div>
          ))}
          <div style={{ flex:1 }} />
          <label style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', color:'#6B7280', fontSize:9 }}>
            <input type="checkbox" checked={responsive} onChange={e=>setResponsive(e.target.checked)} style={{ accentColor:'#3B82F6' }} /> 响应式
          </label>
          <span style={{ color:'#4B5563', fontSize:9 }}>{codeData?.count||0} 节点</span>
        </div>

        <div style={{ flex:1, overflow:'auto', padding:12 }}>
          {codeData?.error ? <div style={{ color:'#FCA5A5', fontSize:12, padding:12 }}>{codeData.error}</div> : (
            <pre style={{ margin:0, background:'rgba(0,0,0,0.3)', borderRadius:8, padding:14, fontFamily:"'JetBrains Mono', monospace", fontSize:10, lineHeight:1.5, color:'#94A3B8', overflow:'auto', whiteSpace:'pre-wrap' }}>{generatedCode}</pre>
          )}
        </div>

        <div style={{ display:'flex', gap:8, padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleCopy} style={{ flex:1, background:copied?'rgba(16,185,129,0.2)':'#3B82F6', color:copied?'#6EE7B7':'white', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, cursor:'pointer', fontWeight:500 }}>{copied?'✅ 已复制':'📋 复制'}</button>
          <button onClick={handleDownload} style={{ background:'rgba(255,255,255,0.06)', color:'#9CA3AF', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 16px', fontSize:12, cursor:'pointer' }}>⬇ 下载</button>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', color:'#9CA3AF', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 16px', fontSize:12, cursor:'pointer' }}>取消</button>
        </div>
      </div>
    </div>
  );
}
