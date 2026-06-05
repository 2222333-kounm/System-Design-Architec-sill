import React from 'react';
import { useStore } from '../store';

/**
 * 右侧预览面板
 * 监听 lastOutput 渲染内容
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
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#FCA5A5',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 12,
        }}>
          ❌ {previewData.message || '未知错误'}
        </div>
      );
    }

    if (previewData.css) {
      const styleStr = Object.entries(previewData.css)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${k}:${v}`)
        .join(';');

      if (previewData.type === 'color') {
        return (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 150 }}>
            <div style={{ ...parseStyle(styleStr), display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </div>
        );
      }

      return (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <div style={parseStyle(styleStr)}>{previewData.content || ''}</div>
        </div>
      );
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
    navigator.clipboard.writeText(css);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#181A20',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        height: 28,
        background: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: 6,
        flexShrink: 0,
      }}>
        <span style={{ color: '#6B7280', fontSize: 10, fontWeight: 500 }}>📱 预览</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleCopy}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#6B7280',
            width: 26,
            height: 26,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          title="复制 CSS"
        >
          📋
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      }}>
        {renderContent()}
      </div>

      <div style={{
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        color: '#374151',
        fontSize: 9,
        flexShrink: 0,
      }}>
        💡 连接节点到输出节点
      </div>
    </div>
  );
}

function parseStyle(str) {
  if (!str) return {};
  const obj = {};
  str.split(';').forEach((s) => {
    const [k, ...v] = s.split(':');
    if (k && v.length) obj[k.trim()] = v.join(':').trim();
  });
  return obj;
}
