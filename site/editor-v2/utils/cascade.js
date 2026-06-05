/**
 * 样式继承与覆盖（CSS 级联）
 * 推断父子关系 → 父级 CSS 传递给子级 → 子级可覆盖
 */

// 布局容器类型（可作为父级）
const PARENT_TYPES = ['layoutContainer'];

// 可继承的 CSS 属性
const INHERITED_PROPS = [
  'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
  'letterSpacing', 'textAlign', 'gap', 'padding',
];

/**
 * 从节点和边推断父子关系
 * 父 → 子 = layoutContainer 通过 items-in 端口连接到子节点
 */
export function buildHierarchy(nodes, edges) {
  const parentMap = {}; // childId → parentId
  const childrenMap = {}; // parentId → [childId]

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode || !PARENT_TYPES.includes(sourceNode.type)) return;

    const parentId = sourceNode.id;
    const childId = edge.target;

    parentMap[childId] = parentId;
    if (!childrenMap[parentId]) childrenMap[parentId] = [];
    if (!childrenMap[parentId].includes(childId)) {
      childrenMap[parentId].push(childId);
    }
  });

  return { parentMap, childrenMap };
}

/**
 * 获取节点的最终 CSS（父级继承 + 自身覆盖）
 * @param {string} nodeId
 * @param {Array} nodes
 * @param {Object} parentMap - childId → parentId
 * @param {Object} nodeCssMap - nodeId → { css output }
 * @returns {Object} merged CSS
 */
export function getMergedCss(nodeId, nodes, parentMap, nodeCssMap) {
  // 从自身开始
  const ownCss = nodeCssMap[nodeId] || {};

  // 向上查找父级
  let currentId = nodeId;
  const chain = [];
  while (parentMap[currentId]) {
    chain.unshift(parentMap[currentId]);
    currentId = parentMap[currentId];
  }

  // 从根父级开始合并
  let merged = {};
  chain.forEach(parentId => {
    const parentCss = nodeCssMap[parentId] || {};
    // 只继承可继承的属性
    INHERITED_PROPS.forEach(prop => {
      if (parentCss[prop] !== undefined && merged[prop] === undefined) {
        merged[prop] = parentCss[prop];
      }
    });
  });

  // 自身属性覆盖父级
  merged = { ...merged, ...ownCss };

  return merged;
}

/**
 * 计算 "inherit from parent(...)" 标注
 */
export function getInheritInfo(nodeId, parentMap, nodeCssMap) {
  if (!parentMap[nodeId]) return null;
  const parentId = parentMap[nodeId];
  const parentNode = { id: parentId };
  return {
    parentId,
    label: `继承自 ${parentId}`,
  };
}
