/**
 * CSS → Tailwind 类名映射表
 * 将 CSS 属性/值对转换为对应的 Tailwind 工具类
 */

const COLOR_TO_TAILWIND = {
  '#0071E3': 'blue-600', '#0066CC': 'blue-700', '#004080': 'blue-900',
  '#B8DAFF': 'blue-200', '#E8F4FD': 'blue-50',
  '#1D1D1F': 'gray-900', '#424245': 'gray-700', '#6E6E73': 'gray-500',
  '#86868B': 'gray-400', '#D2D2D7': 'gray-300', '#E8E8ED': 'gray-200',
  '#F5F5F7': 'gray-100', '#FAFAFC': 'gray-50', '#FFFFFF': 'white',
  '#000000': 'black',
  '#B64400': 'orange-700', '#03A10E': 'green-600', '#FFE045': 'yellow-300',
  '#E30000': 'red-600', '#2997FF': 'blue-400',
  '#3B82F6': 'blue-500', '#FF0000': 'red-500', '#00FF00': 'green-500',
  '#0000FF': 'blue-500', '#FF6600': 'orange-500',
};

export function cssToTailwind(prop, value) {
  const v = String(value).toLowerCase();
  const p = prop.toLowerCase();

  if (p === 'display' && v === 'flex') return 'flex';
  if (p === 'display' && v === 'grid') return 'grid';
  if (p === 'display' && v === 'inline-block') return 'inline-block';
  if (p === 'display' && v === 'none') return 'hidden';

  if (p === 'flex-direction' && v === 'row') return 'flex-row';
  if (p === 'flex-direction' && v === 'column') return 'flex-col';
  if (p === 'flex-wrap' && v === 'wrap') return 'flex-wrap';
  if (p === 'flex-wrap' && v === 'nowrap') return 'flex-nowrap';

  if (p === 'justify-content') {
    const map = { 'flex-start': 'justify-start', 'center': 'justify-center', 'flex-end': 'justify-end', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly' };
    return map[v];
  }
  if (p === 'align-items') {
    const map = { 'flex-start': 'items-start', 'center': 'items-center', 'flex-end': 'items-end', 'stretch': 'items-stretch' };
    return map[v];
  }

  if (p === 'text-align') {
    const map = { 'left': 'text-left', 'center': 'text-center', 'right': 'text-right' };
    return map[v];
  }

  if (p === 'font-weight') {
    const n = parseInt(v);
    if (n === 400) return 'font-normal';
    if (n === 500) return 'font-medium';
    if (n === 600) return 'font-semibold';
    if (n === 700) return 'font-bold';
    if (n === 300) return 'font-light';
    if (n >= 100 && n <= 900) return `font-${['thin','extralight','light','normal','medium','semibold','bold','extrabold','black'][Math.round(n/100)-1] || 'normal'}`;
  }

  if (p === 'opacity') {
    const n = Math.round(parseFloat(v) * 100);
    if (n === 100) return '';
    if (n > 0) return `opacity-${Math.round(n / 10) * 10}`;
    return 'opacity-0';
  }

  if (p === 'border-style' || p === 'border') {
    if (v.includes('solid')) return 'border-solid';
    if (v.includes('dashed')) return 'border-dashed';
    if (v.includes('dotted')) return 'border-dotted';
  }

  if (p === 'cursor' && v === 'pointer') return 'cursor-pointer';

  if (p === 'position') {
    if (v === 'relative') return 'relative';
    if (v === 'absolute') return 'absolute';
    if (v === 'fixed') return 'fixed';
  }

  if (p === 'overflow') {
    if (v === 'hidden') return 'overflow-hidden';
    if (v === 'auto') return 'overflow-auto';
    if (v === 'scroll') return 'overflow-scroll';
  }

  // 颜色值匹配
  if (/^#/.test(v)) {
    const tw = COLOR_TO_TAILWIND[value.toUpperCase()] || COLOR_TO_TAILWIND[value.toLowerCase()];
    if (tw) {
      if (p === 'color' || p === 'text-color') return `text-${tw}`;
      if (p === 'background' || p === 'background-color') return `bg-${tw}`;
      if (p.includes('border') && !p.includes('radius')) return `border-${tw}`;
    }
  }

  return null; // 无法映射
}

export function buildTailwindClasses(cssProps) {
  const classes = [];
  Object.entries(cssProps).forEach(([k, v]) => {
    const tw = cssToTailwind(k, v);
    if (tw) classes.push(tw);
  });
  return [...new Set(classes)].join(' ');
}
