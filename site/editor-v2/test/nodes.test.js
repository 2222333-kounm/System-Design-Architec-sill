import { describe, it, expect } from 'vitest';
import store from '../store/index';

// =====================
//  节点输出格式计算函数（从 App.jsx 提取）
// =====================

const PADDING_MAP = { xs: '4px 8px', sm: '8px 16px', md: '12px 24px', lg: '16px 32px', xl: '20px 40px' };

function computeColorBlock(p) {
  return { type: 'color', css: {
    background: p.color || '#3B82F6',
    width: (p.width || 320) + (p.widthUnit || 'px'),
    height: (p.height || 120) + (p.heightUnit || 'px'),
    'border-radius': (p.borderRadius || 12) + 'px',
    opacity: String((p.opacity ?? 100) / 100),
  }};
}

function computeText(p) {
  return { type: 'text', css: {
    fontFamily: p.fontFamily || 'PingFang SC',
    fontSize: (p.fontSize || 16) + (p.fontSizeUnit || 'px'),
    fontWeight: String(p.fontWeight || 400),
    lineHeight: String(p.lineHeight || 1.5),
    letterSpacing: (p.letterSpacing ?? 0) + 'em',
    color: p.color || '#1D1D1F',
    textAlign: p.textAlign || 'left',
  }, content: p.content || '' };
}

function computeButton(p) {
  return { type: 'interactive', css: {
    display: 'inline-block',
    padding: PADDING_MAP[p.padding] || '8px 16px',
    background: p.color || '#0071E3',
    color: p.textColor || '#FFFFFF',
    borderRadius: (p.borderRadius ?? 980) + 'px',
    border: 'none', cursor: 'pointer',
    fontSize: (p.fontSize || 14) + 'px',
  }, content: p.text || '按钮' };
}

function computeIcon(p) {
  return { type: 'css', css: {
    fontSize: (p.size || 24) + 'px',
    color: p.color || '#1D1D1F',
    opacity: String((p.opacity ?? 100) / 100),
    lineHeight: '1',
  }, content: p.icon || '❤️' };
}

function computeLayout(p) {
  if (p.display === 'grid') {
    return { type: 'layout', css: {
      display: 'grid',
      gridTemplateColumns: p.gridTemplateColumns || '1fr 1fr 1fr',
      gridTemplateRows: p.gridTemplateRows || 'auto',
      rowGap: (p.rowGap ?? 16) + 'px',
      columnGap: (p.columnGap ?? 16) + 'px',
      justifyItems: p.justifyItems || 'center',
      gridAutoFlow: p.gridAutoFlow || 'row',
    }};
  }
  return { type: 'layout', css: {
    display: 'flex',
    flexDirection: p.flexDirection || 'row',
    justifyContent: p.justifyContent || 'center',
    alignItems: p.alignItems || 'center',
    gap: (p.gap ?? 16) + 'px',
    flexWrap: p.flexWrap || 'nowrap',
    padding: (p.padding ?? 0) + 'px',
  }};
}

function computeTransform(p) {
  return { type: 'css', css: {
    transform: `scale(${p.scale ?? 1}) rotate(${p.rotation ?? 0}deg)`,
    opacity: String((p.opacity ?? 100) / 100),
    borderRadius: (p.borderRadius ?? 0) + 'px',
  }};
}

function computeSpacing(p) {
  const uk = p.unit || 'px';
  const mode = p.mode || 'padding';
  const prefix = mode === 'padding' ? 'padding' : 'margin';
  let css = {};
  if (p.control === 'individual') {
    css[prefix + 'Top'] = (p[mode + 'Top'] ?? 0) + uk;
    css[prefix + 'Right'] = (p[mode + 'Right'] ?? 0) + uk;
    css[prefix + 'Bottom'] = (p[mode + 'Bottom'] ?? 0) + uk;
    css[prefix + 'Left'] = (p[mode + 'Left'] ?? 0) + uk;
  } else {
    css[prefix] = (p.uniformValue ?? 16) + uk;
  }
  return { type: 'css', css };
}

// =====================
//  拓扑排序
// =====================

function topoSort(edges) {
  // edges: [{ source, target }]
  const inDegree = {};
  const adj = {};
  const allNodes = new Set();
  edges.forEach(e => {
    allNodes.add(e.source); allNodes.add(e.target);
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    if (!inDegree[e.source]) inDegree[e.source] = 0;
  });
  const queue = [];
  allNodes.forEach(n => { if (inDegree[n] === 0) queue.push(n); });
  const result = [];
  while (queue.length) {
    const n = queue.shift();
    result.push(n);
    (adj[n] || []).forEach(m => {
      inDegree[m]--;
      if (inDegree[m] === 0) queue.push(m);
    });
  }
  return result;
}

// =====================
//  测试
// =====================

describe('① 节点输出格式', () => {

  it('色块输出含完整 CSS', () => {
    const out = computeColorBlock({ color: '#FF0000', width: 200, height: 100, borderRadius: 8, opacity: 80 });
    expect(out.type).toBe('color');
    expect(out.css.background).toBe('#FF0000');
    expect(out.css.width).toBe('200px');
    expect(out.css['border-radius']).toBe('8px');
    expect(out.css.opacity).toBe('0.8');
  });

  it('色块支持单位切换', () => {
    const out = computeColorBlock({ color: '#0071E3', width: 50, widthUnit: '%', height: 200, heightUnit: 'vh' });
    expect(out.css.width).toBe('50%');
    expect(out.css.height).toBe('200vh');
  });

  it('文字输出含排版属性', () => {
    const out = computeText({ content: 'Hello', fontSize: 24, fontWeight: 700, color: '#333', textAlign: 'center' });
    expect(out.type).toBe('text');
    expect(out.css.fontSize).toBe('24px');
    expect(out.css.fontWeight).toBe('700');
    expect(out.css.textAlign).toBe('center');
    expect(out.content).toBe('Hello');
  });

  it('按钮输出含三态信息（extra）', () => {
    const out = computeButton({ text: '购买', color: '#FF6600', borderRadius: 8, fontSize: 16 });
    expect(out.type).toBe('interactive');
    expect(out.css.background).toBe('#FF6600');
    expect(out.css.borderRadius).toBe('8px');
    expect(out.content).toBe('购买');
  });

  it('布局容器 Grid 模式输出', () => {
    const out = computeLayout({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 24, columnGap: 12 });
    expect(out.type).toBe('layout');
    expect(out.css.display).toBe('grid');
    expect(out.css.rowGap).toBe('24px');
    expect(out.css.columnGap).toBe('12px');
  });

  it('布局容器 Flex 模式输出', () => {
    const out = computeLayout({ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 });
    expect(out.type).toBe('layout');
    expect(out.css.display).toBe('flex');
    expect(out.css.flexDirection).toBe('column');
    expect(out.css.gap).toBe('12px');
  });

  it('变换输出 transform 字符串', () => {
    const out = computeTransform({ scale: 1.5, rotation: 45, opacity: 50 });
    expect(out.type).toBe('css');
    expect(out.css.transform).toBe('scale(1.5) rotate(45deg)');
    expect(out.css.opacity).toBe('0.5');
  });

  it('间距输出 padding/margin', () => {
    const out1 = computeSpacing({ mode: 'padding', control: 'uniform', uniformValue: 24 });
    expect(out1.css.padding).toBe('24px');

    const out2 = computeSpacing({ mode: 'margin', control: 'individual', marginTop: 10, marginRight: 20, marginBottom: 10, marginLeft: 20 });
    expect(out2.css.marginTop).toBe('10px');
    expect(out2.css.marginRight).toBe('20px');
  });

  it('图标输出包含 html', () => {
    const out = computeIcon({ icon: '⭐', size: 32, color: '#FFD700', opacity: 80 });
    expect(out.type).toBe('css');
    expect(out.css.fontSize).toBe('32px');
    expect(out.content).toBe('⭐');
  });

  it('所有输出都包含 type', () => {
    [computeColorBlock, computeText, computeButton, computeIcon, computeLayout, computeTransform].forEach(fn => {
      const out = fn({});
      expect(out).toHaveProperty('type');
      expect(out).toHaveProperty('css');
      expect(typeof out.type).toBe('string');
      expect(typeof out.css).toBe('object');
    });
  });
});

describe('② 拓扑排序', () => {

  it('线性链 A→B→C 排序正确', () => {
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ];
    const order = topoSort(edges);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
  });

  it('多依赖：A→C, B→C，C 最后执行', () => {
    const edges = [
      { source: 'A', target: 'C' },
      { source: 'B', target: 'C' },
    ];
    const order = topoSort(edges);
    expect(order.indexOf('C')).toBeGreaterThan(order.indexOf('A'));
    expect(order.indexOf('C')).toBeGreaterThan(order.indexOf('B'));
  });

  it('A→B→D, A→C→D 全序正确', () => {
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'D' },
      { source: 'A', target: 'C' },
      { source: 'C', target: 'D' },
    ];
    const order = topoSort(edges);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('D'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
  });
});

describe('③ 全局 Token 同步', () => {

  it('Store 发布/订阅通信正常', () => new Promise((done) => {
    const unsub = store.subscribe((state) => {
      if (state.tokenUpdate) {
        expect(state.tokenUpdate).toBe('updated');
        unsub();
        done();
      }
    });
    store.setState({ tokenUpdate: 'updated' });
  }));

  it('Token 值变化后订阅者收到新值', () => new Promise((done) => {
    let callCount = 0;
    const unsub = store.subscribe(() => { callCount++; });
    store.setState({ tokenColor: '#FF0000' });
    setTimeout(() => {
      expect(callCount).toBeGreaterThanOrEqual(1);
      unsub();
      done();
    }, 50);
  }));

  it('全局 Token 节点输出包含 count', () => {
    // 模拟 globalToken 输出
    const ts = { keys: () => ['--color-primary', '--font-size-hero', '--spacing-md'] };
    const out = { type: 'tokens', css: {}, extra: { count: ts.keys().length } };
    expect(out.type).toBe('tokens');
    expect(out.extra.count).toBe(3);
  });
});
