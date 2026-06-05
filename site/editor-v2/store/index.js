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
});

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
