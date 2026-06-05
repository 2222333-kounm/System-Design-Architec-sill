import { describe, it, expect } from 'vitest';
import store, { componentStore } from '../store/index';

describe('Store 基础操作', () => {

  it('set/get 基础操作', () => {
    store.setState({ testKey: 'hello' });
    expect(store.getState().testKey).toBe('hello');
  });

  it('subscribe 监听值变化', () => new Promise((done) => {
    const unsub = store.subscribe((state) => {
      expect(state.testSub).toBe(42);
      unsub();
      done();
    });
    store.setState({ testSub: 42 });
  }));

  it('unsubscribe 后不再触发', () => new Promise((done) => {
    let count = 0;
    const unsub = store.subscribe(() => { count++; });
    unsub();
    store.setState({ ignoreVal: true });
    setTimeout(() => { expect(count).toBe(0); done(); }, 50);
  }));

  it('多个 key 共存', () => {
    store.setState({ a: 1, b: 2 });
    expect(store.getState().a).toBe(1);
    expect(store.getState().b).toBe(2);
  });
});

describe('componentStore 操作', () => {

  afterEach(() => {
    // 清理所有组件
    const all = componentStore.list();
    all.forEach(c => componentStore.remove(c.id));
  });

  it('保存和列出组件', () => {
    const id = 'comp-1';
    componentStore.save(id, {
      id, name: 'Test Component',
      nodes: [{ id: 'n1', type: 'colorBlock', data: { properties: { color: '#FF0000' } } }],
      edges: [], slots: [], createdAt: new Date().toISOString(),
    });
    const list = componentStore.list();
    expect(list.some(c => c.id === id)).toBe(true);
    expect(list[0].name).toBe('Test Component');
  });

  it('获取单个组件', () => {
    componentStore.save('comp-2', { id: 'comp-2', name: 'Get Test', nodes: [], edges: [], slots: [], createdAt: '' });
    const got = componentStore.get('comp-2');
    expect(got).toBeDefined();
    expect(got.name).toBe('Get Test');
  });

  it('删除组件', () => {
    componentStore.save('comp-3', { id: 'comp-3', name: 'Delete Me', nodes: [], edges: [], slots: [], createdAt: '' });
    expect(componentStore.get('comp-3')).toBeDefined();
    componentStore.remove('comp-3');
    expect(componentStore.get('comp-3')).toBeUndefined();
  });

  it('createFromSelected 自动检测色块插槽', () => {
    const nodes = [{ id: 'n1', type: 'colorBlock', data: { properties: { color: '#0071E3' } } }];
    const id = componentStore.createFromSelected(nodes, [], 'My Block');
    const def = componentStore.get(id);
    expect(def.name).toBe('My Block');
    expect(def.nodes.length).toBe(1);
    expect(def.slots.some(s => s.field === 'color')).toBe(true);
  });
});
