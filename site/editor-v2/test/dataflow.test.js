import { describe, it, expect } from 'vitest';

// =====================
//  端口兼容性映射（从 App.jsx 提取的纯函数）
// =====================

const PORT_GROUPS = {
  color: ['color', 'css'],
  image: ['image', 'css'],
  text: ['text', 'css'],
  css: ['css'],
  interactive: ['interactive', 'css'],
  any: ['color', 'image', 'text', 'css', 'interactive'],
  number: ['number'],
  layout: ['layout', 'css'],
  responsive: ['responsive', 'css'],
  merged: ['merged', 'css'],
  tokens: ['tokens', 'css'],
  video: ['video', 'css'],
  instance: ['instance', 'css'],
  masked: ['masked', 'image', 'css'],
};

function isPortCompatible(sourceType, targetType) {
  if (!sourceType || !targetType) return false;
  const allowed = PORT_GROUPS[sourceType];
  if (!allowed) return false;
  return allowed.indexOf(targetType) >= 0;
}

// =====================
//  循环检测算法（BFS）
// =====================

function wouldCreateCycle(links, fromId, toId) {
  // links: [{ source, target }]
  const adj = {};
  links.forEach(l => {
    if (!adj[l.source]) adj[l.source] = [];
    adj[l.source].push(l.target);
  });
  const visited = new Set();
  const queue = [toId];
  while (queue.length) {
    const id = queue.shift();
    if (id === fromId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    (adj[id] || []).forEach(n => queue.push(n));
  }
  return false;
}

// =====================
//  测试
// =====================

describe('循环依赖检测', () => {

  it('简单环: A→B→C→A', () => {
    const links = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'C', target: 'A' },
    ];
    expect(wouldCreateCycle(links, 'C', 'A')).toBe(true);
  });

  it('无环 DAG 通过', () => {
    const links = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ];
    // 添加 A→C 不会形成环（A→B→C 和 A→C 仍是 DAG）
    expect(wouldCreateCycle(links, 'A', 'C')).toBe(false);
  });

  it('自环（节点连自己）', () => {
    const links = [{ source: 'A', target: 'A' }];
    expect(wouldCreateCycle(links, 'A', 'A')).toBe(true);
  });

  it('空图无环', () => {
    expect(wouldCreateCycle([], 'A', 'B')).toBe(false);
  });

  it('复杂图有环', () => {
    const links = [
      { source: 'output', target: 'merge' },
      { source: 'merge', target: 'color' },
      { source: 'color', target: 'output' },
    ];
    expect(wouldCreateCycle(links, 'color', 'output')).toBe(true);
  });
});

describe('端口类型匹配', () => {

  it('color 可连 css', () => {
    expect(isPortCompatible('color', 'css')).toBe(true);
  });

  it('color 不可连 image', () => {
    expect(isPortCompatible('color', 'image')).toBe(false);
  });

  it('any 可连基础类型', () => {
    expect(isPortCompatible('any', 'color')).toBe(true);
    expect(isPortCompatible('any', 'image')).toBe(true);
    expect(isPortCompatible('any', 'text')).toBe(true);
    expect(isPortCompatible('any', 'css')).toBe(true);
    expect(isPortCompatible('any', 'interactive')).toBe(true);
  });

  it('null/undefined 返回 false', () => {
    expect(isPortCompatible(null, 'css')).toBe(false);
    expect(isPortCompatible('color', undefined)).toBe(false);
  });

  it('未知类型不可连', () => {
    expect(isPortCompatible('unknown', 'css')).toBe(false);
  });

  it('image 可连 masked', () => {
    expect(isPortCompatible('image', 'css')).toBe(true);
  });

  it('video 可连 css', () => {
    expect(isPortCompatible('video', 'css')).toBe(true);
  });
});
