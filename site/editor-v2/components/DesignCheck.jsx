import React, { useState, useCallback } from 'react';

/**
 * 设计规范检查面板
 * 遍历画布节点 → 对比 Token → 输出不一致列表 → 一键修复
 */
export default function DesignCheck({ open, onClose, nodes, onUpdateNode }) {
  const [issues, setIssues] = useState([]);
  const [checked, setChecked] = useState(false);

  // 从 TokenReader 获取 Token 值
  const getTokenMap = useCallback(() => {
    const tr = window.TokenReader;
    if (!tr) return { colors: [], fontSizes: [], fontFamilies: [], radii: [], spacings: [] };
    const all = tr.getAll();
    const colors = [], fontSizes = [], fontFamilies = [], radii = [], spacings = [];

    Object.entries(all).forEach(([k, v]) => {
      if (k.startsWith('--color-')) colors.push({ key: k, value: v.toLowerCase() });
      if (k.startsWith('--font-size-')) fontSizes.push({ key: k, value: v });
      if (k.startsWith('--font-family-')) fontFamilies.push({ key: k, value: v });
      if (k.startsWith('--radius-')) radii.push({ key: k, value: v });
      if (k.startsWith('--spacing-')) spacings.push({ key: k, value: v });
    });
    return { colors, fontSizes, fontFamilies, radii, spacings };
  }, []);

  const runCheck = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      setIssues([{ type: 'info', message: '画布上没有节点' }]);
      setChecked(true);
      return;
    }

    const tokens = getTokenMap();
    const found = [];

    nodes.forEach(node => {
      if (node.type === 'output') return;
      const p = node.data?.properties || {};
      const name = node.type;

      // 颜色检测
      const colorProps = ['color', 'background', 'textColor', 'hoverColor', 'activeColor'];
      colorProps.forEach(prop => {
        const val = p[prop];
        if (!val || typeof val !== 'string') return;
        const valLower = val.toLowerCase();
        // 检查是否在 Token 色板中
        const match = tokens.colors.some(t => t.value === valLower);
        if (!match) {
          // 找到最接近的 Token
          const closest = tokens.colors.find(t => t.value.includes(valLower.slice(0, 3))) || tokens.colors[0];
          found.push({
            nodeId: node.id,
            nodeName: name,
            prop,
            currentValue: val,
            suggestion: closest?.key || '',
            category: 'color',
            label: `${getNodeLabel(name)}.${prop} = ${val}`,
          });
        }
      });

      // 字号检测
      if (p.fontSize) {
        const val = String(p.fontSize) + (p.fontSizeUnit || 'px');
        const match = tokens.fontSizes.some(t => t.value === val);
        if (!match && tokens.fontSizes.length > 0) {
          found.push({
            nodeId: node.id, nodeName: name, prop: 'fontSize',
            currentValue: val, suggestion: tokens.fontSizes[2]?.key || '',
            category: 'typography', label: `${getNodeLabel(name)}.fontSize = ${val}`,
          });
        }
      }
    });

    if (found.length === 0) {
      found.push({ type: 'success', message: '✅ 所有节点均符合设计规范' });
    }

    setIssues(found);
    setChecked(true);
  }, [nodes, getTokenMap]);

  const fixIssue = useCallback((index) => {
    const issue = issues[index];
    if (!issue || !issue.suggestion) return;
    const tr = window.TokenReader;
    if (!tr) return;
    const tokenVal = tr.get(issue.suggestion);
    if (!tokenVal) return;

    // 更新节点属性
    onUpdateNode(issue.nodeId, { ...nodes.find(n => n.id === issue.nodeId)?.data?.properties, [issue.prop]: tokenVal });

    // 标记已修复
    setIssues(prev => prev.map((iss, i) => i === index ? { ...iss, fixed: true } : iss));
  }, [issues, nodes, onUpdateNode]);

  const fixAll = useCallback(() => {
    issues.forEach((iss, i) => {
      if (!iss.fixed && iss.suggestion) fixIssue(i);
    });
  }, [issues, fixIssue]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 520, maxHeight: '70vh', background: 'rgba(22,24,30,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>📐 设计规范检查</h2>
          <span style={{ color: '#4B5563', fontSize: 10, marginLeft: 8 }}>{nodes?.length || 0} 节点</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B7280', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>✕</button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8 }}>
          <button onClick={runCheck}
            style={{ flex: 1, background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            🔍 开始检查
          </button>
          {issues.filter(i => !i.fixed && i.suggestion).length > 0 && (
            <button onClick={fixAll}
              style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: 11, cursor: 'pointer' }}>
              全部修复
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {!checked && (
            <div style={{ textAlign: 'center', color: '#4B5563', fontSize: 11, padding: 20 }}>
              点击「开始检查」分析画布节点是否符合全局 Token 规范
            </div>
          )}

          {checked && issues.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6EE7B7', fontSize: 12, padding: 20, background: 'rgba(16,185,129,0.05)', borderRadius: 8 }}>
              ✅ 画布整洁，无规范问题
            </div>
          )}

          {issues.filter(i => i.label).map((iss, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', marginBottom: 4,
              borderRadius: 6, background: iss.fixed ? 'rgba(16,185,129,0.05)' : iss.type === 'success' ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.08)',
              opacity: iss.fixed ? 0.6 : 1,
            }}>
              <span style={{ color: iss.fixed ? '#6EE7B7' : '#FCD34D', fontSize: 12 }}>
                {iss.fixed ? '✅' : iss.type === 'success' ? '✅' : '⚠️'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#E2E8F0', fontSize: 10 }}>{iss.label}</div>
                {iss.suggestion && (
                  <div style={{ color: '#4B5563', fontSize: 8, marginTop: 2 }}>
                    建议: <span style={{ color: '#93C5FD', fontFamily: 'monospace' }}>{iss.suggestion}</span>
                    {` (${iss.category})`}
                  </div>
                )}
              </div>
              {iss.suggestion && !iss.fixed && (
                <button onClick={() => fixIssue(i)}
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 9, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  修复
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getNodeLabel(type) {
  const labels = {
    colorBlock: '色块', text: '文字', button: '按钮', icon: '图标',
    layoutContainer: '布局容器', spacing: '间距', breakpoint: '断点',
    transform: '变换', mask: '蒙版', border: '边框', shadow: '阴影',
    mouseFollow: '鼠标跟随', transition: '转场',
    convert: '转换', merge: '合并', globalToken: '全局Token', output: '输出',
  };
  return labels[type] || type;
}
