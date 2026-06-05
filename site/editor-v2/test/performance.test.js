import { describe, it, expect } from 'vitest';

/**
 * 大量节点性能测试（纯函数层面）
 * 验证 100+ 节点时的拓扑排序和端口匹配性能
 */

function topoSort(edges) {
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

function isPortCompatible(sourceType, targetType, PORT_GROUPS) {
  if (!sourceType || !targetType) return false;
  const allowed = PORT_GROUPS[sourceType];
  if (!allowed) return false;
  return allowed.indexOf(targetType) >= 0;
}

function wouldCreateCycle(links, fromId, toId) {
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

const PORT_GROUPS = {
  color: ['color', 'css'], image: ['image', 'css'], text: ['text', 'css'],
  css: ['css'], interactive: ['interactive', 'css'], any: ['color', 'image', 'text', 'css', 'interactive'],
};

describe('大量节点性能 (100+)', () => {

  it('拓扑排序 1000 条边 < 50ms', () => {
    const edges = [];
    for (let i = 0; i < 1000; i++) {
      edges.push({ source: `n${i}`, target: `n${i + 1}` });
    }
    const start = performance.now();
    const result = topoSort(edges);
    const elapsed = performance.now() - start;
    expect(result.length).toBe(1001);
    expect(elapsed).toBeLessThan(50);
  });

  it('循环检测 500 节点链 < 50ms', () => {
    const links = [];
    for (let i = 0; i < 500; i++) {
      links.push({ source: `n${i}`, target: `n${i + 1}` });
    }
    // 检测从 n500 连回 n0 是否成环
    const start = performance.now();
    const hasCycle = wouldCreateCycle(links, 'n0', 'n500');
    const elapsed = performance.now() - start;
    expect(hasCycle).toBe(false);
    expect(elapsed).toBeLessThan(50);
  });

  it('端口匹配 10000 次调用 < 100ms', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      isPortCompatible('color', 'css', PORT_GROUPS);
      isPortCompatible('color', 'image', PORT_GROUPS);
      isPortCompatible('any', 'text', PORT_GROUPS);
      isPortCompatible('unknown', 'css', PORT_GROUPS);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('100 个节点 Store 操作 < 200ms', () => {
    const start = performance.now();
    const nodes = [];
    for (let i = 0; i < 100; i++) {
      nodes.push({ id: `n${i}`, type: 'colorBlock', data: { properties: { color: '#000' } } });
    }
    // 模拟 store setState
    let state = { nodes, edges: [] };
    state = { ...state, nodes: [...state.nodes, { id: 'n100', type: 'text', data: {} }] };
    const elapsed = performance.now() - start;
    expect(state.nodes.length).toBe(101);
    expect(elapsed).toBeLessThan(200);
  });
});
