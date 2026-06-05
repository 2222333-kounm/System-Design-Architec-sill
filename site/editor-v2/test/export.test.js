import { describe, it, expect } from 'vitest';

/**
 * 模拟导出面板的数据处理逻辑（纯函数）
 */

function generateHTML(chain) {
  if (!chain || chain.length === 0) return '';
  const cssProps = {};
  const elements = [];
  chain.forEach(node => {
    const p = node.props || {};
    if (node.type === 'colorBlock') {
      cssProps['background'] = p.color || '#3B82F6';
      cssProps['width'] = (p.width || 320) + 'px';
      cssProps['height'] = (p.height || 120) + 'px';
      cssProps['border-radius'] = (p.borderRadius || 12) + 'px';
      elements.push({ tag: 'div', className: 'color-block', content: '' });
    }
    if (node.type === 'text') {
      cssProps['font-size'] = (p.fontSize || 16) + 'px';
      cssProps['color'] = p.color || '#1D1D1F';
      elements.push({ tag: 'div', className: 'text', content: p.content || '' });
    }
    if (node.type === 'button') {
      cssProps['background'] = p.color || '#0071E3';
      cssProps['color'] = p.textColor || '#FFF';
      cssProps['border-radius'] = (p.borderRadius ?? 980) + 'px';
      elements.push({ tag: 'button', className: 'btn', content: p.text || '按钮' });
    }
  });
  const cssStr = Object.entries(cssProps).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const html = elements.map(el => `  <${el.tag} class="${el.className}">${el.content}</${el.tag}>`).join('\n');
  return `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style>\n.${elements.map(e => e.className).join(',\n.')} {\n${cssStr}\n  }\n</style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
}

function generateReact(chain) {
  if (!chain || chain.length === 0) return '';
  const cssProps = {};
  const elements = [];
  chain.forEach(node => {
    const p = node.props || {};
    if (node.type === 'colorBlock') {
      cssProps['background'] = p.color || '#3B82F6';
      cssProps['width'] = (p.width || 320) + 'px';
      elements.push({ tag: 'div', className: 'colorBlock', content: '' });
    }
    if (node.type === 'text') {
      cssProps['fontSize'] = (p.fontSize || 16) + 'px';
      cssProps['color'] = p.color || '#1D1D1F';
      elements.push({ tag: 'div', className: 'text', content: p.content || '' });
    }
    if (node.type === 'button') {
      cssProps['background'] = p.color || '#0071E3';
      cssProps['borderRadius'] = (p.borderRadius ?? 980) + 'px';
      elements.push({ tag: 'button', className: 'btn', content: p.text || '按钮' });
    }
  });
  return `import React from 'react';\n\nconst styles = {\n  ${elements.map(e => `${e.className}: {\n    ${Object.entries(cssProps).map(([k, v]) => `${k}: '${v}'`).join(',\n    ')}\n  }`).join(',\n  ')}\n};\n\nexport default function Component() {\n  return (\n    <>\n${elements.map(el => `      <${el.tag} style={styles.${el.className}}>${el.content}</${el.tag}>`).join('\n')}\n    </>\n  );\n}`;
}

function generateVue(chain) {
  if (!chain || chain.length === 0) return '';
  const cssProps = {};
  const elements = [];
  chain.forEach(node => {
    const p = node.props || {};
    if (node.type === 'colorBlock') {
      cssProps['background'] = p.color || '#3B82F6';
      cssProps['width'] = (p.width || 320) + 'px';
      elements.push({ tag: 'div', class: 'color-block', content: '' });
    }
  });
  const cssStr = Object.entries(cssProps).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const tmpl = elements.map(el => `  <${el.tag} class="${el.class}">${el.content}</${el.tag}>`).join('\n');
  return `<template>\n  <div class="container">\n${tmpl}\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'ExportedComponent',\n};\n</script>\n\n<style scoped>\n.container {\n${cssStr}\n}\n</style>`;
}

// =====================
//  测试
// =====================

describe('导出 HTML', () => {

  it('色块+文字节点生成完整 HTML', () => {
    const chain = [
      { type: 'colorBlock', props: { color: '#FF0000', width: 200, height: 100, borderRadius: 8 } },
      { type: 'text', props: { content: 'Hello World', fontSize: 24, color: '#333333' } },
    ];
    const html = generateHTML(chain);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('#FF0000');
    expect(html).toContain('200px');
    expect(html).toContain('Hello World');
    expect(html).toContain('24px');
  });

  it('按钮节点生成 button 标签', () => {
    const chain = [
      { type: 'button', props: { text: '立即购买', color: '#0071E3', borderRadius: 980 } },
    ];
    const html = generateHTML(chain);
    expect(html).toContain('<button');
    expect(html).toContain('立即购买');
    expect(html).toContain('980px');
  });

  it('空链返回空字符串', () => {
    expect(generateHTML([])).toBe('');
    expect(generateHTML(null)).toBe('');
    expect(generateHTML(undefined)).toBe('');
  });
});

describe('导出 React JSX', () => {

  it('生成含 camelCase 样式的 JSX', () => {
    const chain = [
      { type: 'colorBlock', props: { color: '#0071E3' } },
      { type: 'button', props: { text: 'Click', borderRadius: 980 } },
    ];
    const code = generateReact(chain);
    expect(code).toContain('import React');
    expect(code).toContain('export default function Component');
    expect(code).toContain('borderRadius');
    expect(code).toContain('background');
  });
});

describe('导出 Vue SFC', () => {

  it('生成含 scoped style 的 Vue 组件', () => {
    const chain = [
      { type: 'colorBlock', props: { color: '#FF6600' } },
    ];
    const code = generateVue(chain);
    expect(code).toContain('<template>');
    expect(code).toContain('<style scoped>');
    expect(code).toContain('FF6600');
  });
});
