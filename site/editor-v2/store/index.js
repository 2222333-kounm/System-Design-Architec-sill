import { useCallback, useSyncExternalStore } from 'react';

/**
 * 简单全局 store，与 V1 的 lib/store.js 兼容
 */
function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (partial) => {
      state = { ...state, ...partial };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset: () => {
      state = { ...initialState };
      listeners.forEach((fn) => fn(state));
    },
  };
}

const store = createStore({
  nodes: [],
  edges: [],
  previewData: null,
  selectedNode: null,
  nodeCount: 0,
  components: {},  // { id: { id, name, nodes, edges, slots, createdAt } }
  instancesRef: {}, // instance node data cache
});

/** 组件定义管理 */
export const componentStore = {
  list: () => Object.values(store.getState().components || []),
  get: (id) => store.getState().components?.[id],
  save: (id, def) => { const c = { ...store.getState().components, [id]: def }; store.setState({ components: c }); },
  remove: (id) => { const c = { ...store.getState().components }; delete c[id]; store.setState({ components: c }); },
  /** 从画布选中节点创建组件定义 */
  createFromSelected: (nodes, edges, name) => {
    const id = 'comp-' + Date.now();
    const def = { id, name: name || '未命名组件', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), slots: [], createdAt: new Date().toISOString() };
    def.nodes.forEach((n) => {
      if (n.type === 'text') def.slots.push({ nodeId: n.id, field: 'content', label: (n.data?.properties?.content || '').slice(0, 16) || '文字' });
      if (n.type === 'colorBlock') def.slots.push({ nodeId: n.id, field: 'color', label: '色值' });
      if (n.type === 'button') def.slots.push({ nodeId: n.id, field: 'text', label: '按钮文字' });
    });
    componentStore.save(id, def);
    return id;
  },
};

/** React Hook: 订阅 store 中某个 key */
export function useStore(key) {
  const getSnapshot = useCallback(() => store.getState()[key], [key]);
  return useSyncExternalStore(store.subscribe, getSnapshot);
}

/** 更新 store */
export function setStore(partial) {
  store.setState(partial);
}

/** 暴露全局（与 V1 桥接） */
window.StoreV2 = store;

export default store;
