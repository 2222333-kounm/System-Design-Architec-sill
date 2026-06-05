import { describe, it, expect } from 'vitest';
import { cssToTailwind, buildTailwindClasses } from '../utils/tailwind-map';

describe('Tailwind 映射', () => {

  it('display: flex → flex', () => {
    expect(cssToTailwind('display', 'flex')).toBe('flex');
  });

  it('display: grid → grid', () => {
    expect(cssToTailwind('display', 'grid')).toBe('grid');
  });

  it('text-align: center → text-center', () => {
    expect(cssToTailwind('text-align', 'center')).toBe('text-center');
  });

  it('font-weight: 700 → font-bold', () => {
    expect(cssToTailwind('font-weight', '700')).toBe('font-bold');
  });

  it('颜色 #0071E3 → bg-blue-600', () => {
    expect(cssToTailwind('background', '#0071E3')).toBe('bg-blue-600');
  });

  it('颜色 #1D1D1F → text-gray-900', () => {
    expect(cssToTailwind('color', '#1D1D1F')).toBe('text-gray-900');
  });

  it('justify-content: center → justify-center', () => {
    expect(cssToTailwind('justify-content', 'center')).toBe('justify-center');
  });

  it('align-items: flex-start → items-start', () => {
    expect(cssToTailwind('align-items', 'flex-start')).toBe('items-start');
  });

  it('未知属性返回 null', () => {
    expect(cssToTailwind('unknown-prop', 'value')).toBeNull();
  });

  it('buildTailwindClasses 合并多值去重', () => {
    const classes = buildTailwindClasses({ display: 'flex', 'justify-content': 'center', 'align-items': 'center' });
    expect(classes).toContain('flex');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('items-center');
  });
});
