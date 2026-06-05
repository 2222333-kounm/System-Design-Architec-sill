import { describe, it, expect } from 'vitest';

const PARENT_TYPES = ['layoutContainer'];
const INHERITED_PROPS = [
  'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
  'letterSpacing', 'textAlign', 'gap', 'padding',
];

function buildHierarchy(nodes, edges) {
  const parentMap = {};
  const childrenMap = {};
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode || !PARENT_TYPES.includes(sourceNode.type)) return;
    const parentId = sourceNode.id;
    const childId = edge.target;
    parentMap[childId] = parentId;
    if (!childrenMap[parentId]) childrenMap[parentId] = [];
    if (!childrenMap[parentId].includes(childId)) childrenMap[parentId].push(childId);
  });
  return { parentMap, childrenMap };
}

function getMergedCss(nodeId, nodes, parentMap, nodeCssMap) {
  const ownCss = nodeCssMap[nodeId] || {};
  let currentId = nodeId;
  const chain = [];
  while (parentMap[currentId]) {
    chain.unshift(parentMap[currentId]);
    currentId = parentMap[currentId];
  }
  let merged = {};
  chain.forEach(parentId => {
    const parentCss = nodeCssMap[parentId] || {};
    INHERITED_PROPS.forEach(prop => {
      if (parentCss[prop] !== undefined && merged[prop] === undefined) {
        merged[prop] = parentCss[prop];
      }
    });
  });
  merged = { ...merged, ...ownCss };
  return merged;
}

describe('样式继承与覆盖', () => {

  it('子节点从父级继承 fontSize', () => {
    const nodes = [
      { id: 'parent', type: 'layoutContainer' },
      { id: 'child', type: 'text' },
    ];
    const edges = [{ source: 'parent', target: 'child' }];
    const { parentMap } = buildHierarchy(nodes, edges);

    expect(parentMap['child']).toBe('parent');

    const merged = getMergedCss('child', nodes, parentMap, {
      parent: { fontSize: '24px' },
      child: { color: '#333' },
    });
    expect(merged.fontSize).toBe('24px');
    expect(merged.color).toBe('#333');
  });

  it('子节点 override 父级的 color', () => {
    const nodes = [
      { id: 'parent', type: 'layoutContainer' },
      { id: 'child', type: 'text' },
    ];
    const edges = [{ source: 'parent', target: 'child' }];
    const { parentMap } = buildHierarchy(nodes, edges);

    const merged = getMergedCss('child', nodes, parentMap, {
      parent: { color: '#666', fontSize: '16px' },
      child: { color: '#FF0000' },
    });
    // 子节点 color 应覆盖父级
    expect(merged.color).toBe('#FF0000');
    // fontSize 应继承
    expect(merged.fontSize).toBe('16px');
  });

  it('没有父级的节点不受影响', () => {
    const nodes = [{ id: 'alone', type: 'colorBlock' }];
    const { parentMap } = buildHierarchy(nodes, []);
    expect(parentMap['alone']).toBeUndefined();

    const merged = getMergedCss('alone', nodes, parentMap, {
      alone: { background: '#FF0000' },
    });
    expect(merged.background).toBe('#FF0000');
  });

  it('多级级联: 祖父→父→子', () => {
    const nodes = [
      { id: 'grandpa', type: 'layoutContainer' },
      { id: 'parent', type: 'layoutContainer' },
      { id: 'child', type: 'text' },
    ];
    const edges = [
      { source: 'grandpa', target: 'parent' },
      { source: 'parent', target: 'child' },
    ];
    const { parentMap } = buildHierarchy(nodes, edges);
    expect(parentMap['parent']).toBe('grandpa');
    expect(parentMap['child']).toBe('parent');

    const merged = getMergedCss('child', nodes, parentMap, {
      grandpa: { color: '#333', fontWeight: '700' },
      parent: { fontSize: '20px' },
      child: { color: '#FF0000' },
    });
    expect(merged.color).toBe('#FF0000'); // 子级覆盖
    expect(merged.fontSize).toBe('20px'); // 从父级继承
    expect(merged.fontWeight).toBe('700'); // 从祖父级继承
  });
});
