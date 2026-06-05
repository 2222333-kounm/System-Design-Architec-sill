import { describe, it, expect } from 'vitest';
import { componentStore } from '../store/index';

/**
 * 组件实例递归引用检测
 * A 引用 B → B 引用 A → 死循环
 */

function detectComponentCycle(componentId, visited, store) {
  if (visited.has(componentId)) return true;
  const def = store.get(componentId);
  if (!def) return false;
  visited.add(componentId);
  // 遍历组件中的所有节点，看是否有 instance 类型引用其他组件
  for (const node of def.nodes) {
    if (node.type === 'instance' && node.data?.properties?.componentId) {
      if (detectComponentCycle(node.data.properties.componentId, visited, store)) {
        return true;
      }
    }
  }
  visited.delete(componentId);
  return false;
}

describe('组件实例递归引用检测', () => {

  afterEach(() => {
    const all = componentStore.list();
    all.forEach(c => componentStore.remove(c.id));
  });

  it('无环引用通过检测', () => {
    // A 引用 B，B 没有引用其他
    componentStore.save('comp-a', {
      id: 'comp-a', name: 'Component A', nodes: [
        { id: 'n1', type: 'colorBlock', data: { properties: { color: '#FF0000' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    componentStore.save('comp-b', {
      id: 'comp-b', name: 'Component B', nodes: [
        { id: 'n2', type: 'colorBlock', data: { properties: { color: '#00FF00' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    expect(detectComponentCycle('comp-a', new Set(), componentStore)).toBe(false);
    expect(detectComponentCycle('comp-b', new Set(), componentStore)).toBe(false);
  });

  it('检测到直接环：A 引用 B，B 引用 A', () => {
    componentStore.save('comp-a', {
      id: 'comp-a', name: 'Component A', nodes: [
        { id: 'n1', type: 'instance', data: { properties: { componentId: 'comp-b' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    componentStore.save('comp-b', {
      id: 'comp-b', name: 'Component B', nodes: [
        { id: 'n2', type: 'instance', data: { properties: { componentId: 'comp-a' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    expect(detectComponentCycle('comp-a', new Set(), componentStore)).toBe(true);
  });

  it('检测到间接环：A→B→C→A', () => {
    componentStore.save('comp-a', {
      id: 'comp-a', name: 'A', nodes: [
        { id: 'n1', type: 'instance', data: { properties: { componentId: 'comp-b' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    componentStore.save('comp-b', {
      id: 'comp-b', name: 'B', nodes: [
        { id: 'n2', type: 'instance', data: { properties: { componentId: 'comp-c' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    componentStore.save('comp-c', {
      id: 'comp-c', name: 'C', nodes: [
        { id: 'n3', type: 'instance', data: { properties: { componentId: 'comp-a' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    expect(detectComponentCycle('comp-a', new Set(), componentStore)).toBe(true);
  });

  it('自引用检测：A 引用自己', () => {
    componentStore.save('comp-self', {
      id: 'comp-self', name: 'Self', nodes: [
        { id: 'n1', type: 'instance', data: { properties: { componentId: 'comp-self' } } },
      ], edges: [], slots: [], createdAt: '',
    });
    expect(detectComponentCycle('comp-self', new Set(), componentStore)).toBe(true);
  });
});
