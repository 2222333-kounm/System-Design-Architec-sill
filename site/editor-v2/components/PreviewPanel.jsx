import React from 'react';
import { useStore } from '../store';

/**
 * 右侧预览面板
 * 支持所有 20 种节点类型的渲染
 */
export default function PreviewPanel() {
  const previewData = useStore('previewData');

  const renderContent = () => {
    if (!previewData) {
      return (
        <div style={{ textAlign: 'center', color: '#4B5563', padding: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔌</div>
          <div style={{ fontSize: 13 }}>连接节点到「输出」即可预览</div>
        </div>
      );
    }

    if (previewData.type === 'error') {
      return (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#FCA5A5', padding: '12px 16px', borderRadius: 8, fontSize: 12,
        }}>
          ❌ {previewData.message || '未知错误'}
        </div>
      );
    }

    // 交互类型（按钮/转场/鼠标跟随）- 直接渲染 CSS
    if (previewData.type === 'interactive' && previewData.css) {
      return renderCssBlock(previewData, true);
    }

    // 文本类型 — 显示文字内容
    if (previewData.type === 'text' && previewData.css) {
      return renderCssBlock(previewData, false, previewData.content);
    }

    // 颜色类型 — 大色块居中
    if (previewData.type === 'color' && previewData.css) {
      return renderColorBlock(previewData.css);
    }

    // 图片/蒙版类型
    if (previewData.type === 'image' && previewData.css) {
      return renderCssBlock(previewData, true);
    }

    // 响应式 / 断点
    if (previewData.type === 'responsive') {
      return renderResponsive(previewData);
    }

    // Token 类型
    if (previewData.type === 'tokens') {
      return renderTokens(previewData);
    }

    // 布局类型
    if (previewData.type === 'layout') {
      return renderCssBlock(previewData, true);
    }

    // 合并类型
    if (previewData.type === 'merged') {
      return renderMerged(previewData);
    }

    // 通用 CSS 渲染
    if (previewData.css && Object.keys(previewData.css).length > 0) {
      return renderCssBlock(previewData, true);
    }

    // 有 extra 信息但无 CSS
    if (previewData.extra) {
      return renderExtra(previewData);
    }

    return (
      <div style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, padding: 20 }}>
        无法预览此数据类型
      </div>
    );
  };

  const handleCopy = () => {
    if (!previewData?.css) return;
    const styleStr = Object.entries(previewData.css)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');
    const css = `/* 从 Node Editor 导出 */\n.element {\n${styleStr}\n}`;
    navigator.clipboard.writeText(css).then(() => {
      const btn = document.querySelector('.preview-copy-btn');
      if (btn) { btn.textContent = '✅'; setTimeout(() => { btn.textContent = '📋'; }, 1500); }
    });
  };

  return (
    <div style={{
      width: '100%', height: '100%', background: '#181A20',
      display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        height: 28, background: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, flexShrink: 0,
      }}>
        <span style={{ color: '#6B7280', fontSize: 10, fontWeight: 500 }}>📱 预览</span>
        <div style={{ color: '#374151', fontSize: 8 }}>· {previewData?.type || '-'}</div>
        <div style={{ flex: 1 }} />
        <button onClick={handleCopy}
          className="preview-copy-btn"
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#6B7280', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}
          title="复制 CSS">📋</button>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, overflow: 'auto',
      }}>
        {renderContent()}
      </div>

      <div style={{
        height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)', color: '#374151', fontSize: 9, flexShrink: 0,
      }}>
        {previewData?._inherited
          ? `⬆ 继承自 ${previewData._parentId || '父级'} · 子节点可覆盖`
          : previewData?._via
          ? `经由 ${previewData._via} 节点 · 连接节点到输出节点`
          : '💡 连接节点到输出节点'}
      </div>
    </div>
  );
}

/* ---- 渲染函数 ---- */

function renderCssBlock(data, withShadow, content) {
  const css = data.css || {};
  const bg = css.background || css.backgroundColor;
  // 如果有 boxShadow 且要求显示，创建一个带阴影的盒子
  const boxShadow = css.boxShadow;
  const style = parseStyle(Object.entries(css).map(([k, v]) => `${k}:${v}`).join(';'));

  if (content) {
    return (
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
        <div style={{ ...style, padding: '12px', borderRadius: 8, minWidth: 60, textAlign: 'center' }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
      <div style={{
        ...style,
        width: css.width || (css.border || css.boxShadow ? undefined : '220px'),
        height: css.height || '80px',
        borderRadius: css.borderRadius || '8px',
        background: bg || (data.type === 'interactive' ? '#0071E3' : undefined),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: boxShadow || (withShadow ? '0 4px 12px rgba(0,0,0,0.15)' : undefined),
        color: css.color || '#fff', fontSize: css.fontSize || '14px',
        fontFamily: css.fontFamily, fontWeight: css.fontWeight,
      }}>
        {data.extra?.kind === 'mouse-follow' ? '🖱️ 鼠标交互' :
         data.extra?.kind === 'transition' ? '✨ 转场动画' :
         data.type === 'interactive' ? (data.content || '按钮') :
         data.type === 'layout' ? (css.display === 'grid' ? '🔲 Grid' : '⬜ Flex') : ''}
      </div>
    </div>
  );
}

function renderColorBlock(css) {
  const style = parseStyle(Object.entries(css).map(([k, v]) => `${k}:${v}`).join(';'));
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 150 }}>
      <div style={{
        ...style, width: css.width || '260px', height: css.height || '120px',
        borderRadius: css.borderRadius || '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'monospace',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          {css.background} · {css.width}×{css.height}
        </span>
      </div>
    </div>
  );
}

function renderResponsive(data) {
  const mq = data.extra?.mediaQuery || '(max-width: 734px)';
  const overrides = data.extra?.overrides || '';
  const lines = overrides.split('\n').filter(Boolean);

  return (
    <div style={{ width: '100%', padding: 8 }}>
      <div style={{
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 8, padding: 10, fontFamily: 'monospace', fontSize: 10, color: '#6EE7B7',
      }}>
        <div>@media {mq} {'{'}</div>
        {lines.length > 0 ? lines.map((l, i) => (
          <div key={i} style={{ paddingLeft: 12, color: '#94A3B8', fontSize: 9 }}>{l};</div>
        )) : <div style={{ paddingLeft: 12, color: '#4B5563', fontSize: 9 }}>/* 无覆盖样式 */</div>}
        <div>{'}'}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        <div style={{ width: 30, height: 40, background: 'rgba(16,185,129,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🖥</div>
        <span style={{ color: '#4B5563', alignSelf: 'center' }}>→</span>
        <div style={{ width: 20, height: 36, background: 'rgba(16,185,129,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>📱</div>
      </div>
    </div>
  );
}

function renderTokens(data) {
  const count = data.extra?.count || 0;
  return (
    <div style={{ width: '100%', textAlign: 'center', padding: 12 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🌐</div>
      <div style={{ color: '#6EE7B7', fontSize: 18, fontWeight: 600 }}>{count}</div>
      <div style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>个 Design Token</div>
      <div style={{ color: '#4B5563', fontSize: 9, marginTop: 8 }}>
        来自 tokens.css · 全局可用
      </div>
    </div>
  );
}

function renderMerged(data) {
  return (
    <div style={{ width: '100%', textAlign: 'center', padding: 12 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🗂️</div>
      <div style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 500 }}>
        合并 · {data.extra?.mode || '叠加'}
      </div>
      <div style={{ color: '#4B5563', fontSize: 9, marginTop: 4 }}>
        {data.extra?.mergedCount || '多路'} 数据源
      </div>
    </div>
  );
}

function renderExtra(data) {
  return (
    <div style={{ width: '100%', padding: 8 }}>
      <div style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10,
        fontFamily: 'monospace', fontSize: 9, color: '#94A3B8', lineHeight: 1.6,
      }}>
        {JSON.stringify(data.extra, null, 2)}
      </div>
    </div>
  );
}

/* ---- 工具函数 ---- */

function parseStyle(str) {
  if (!str) return {};
  const obj = {};
  str.split(';').forEach((s) => {
    const [k, ...v] = s.split(':');
    if (k && v.length) obj[k.trim()] = v.join(':').trim();
  });
  return obj;
}
