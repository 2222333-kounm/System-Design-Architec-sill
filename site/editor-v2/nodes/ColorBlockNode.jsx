import React, { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * 色块节点 — React Flow 自定义节点
 * 对应 V1 的 sill/color-block
 */
function ColorBlockNode({ data, selected }) {
  const p = data.properties || {};
  const color = p.color || '#3B82F6';
  const width = p.width || 320;
  const height = p.height || 120;
  const borderRadius = p.borderRadius || 12;
  const opacity = (p.opacity ?? 100) / 100;

  const onChange = useCallback(
    (key, value) => {
      data.onChange?.(data.id, { ...p, [key]: value });
    },
    [data, p]
  );

  return (
    <div
      className={`color-block-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#2A2D35',
        border: `2px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12,
        width: 300,
        boxShadow: selected
          ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 24px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.2)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'rgba(59,130,246,0.15)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <Handle type="target" position={Position.Left} id="color-in" style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginRight: 6 }} />
        <span style={{ flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 12, fontWeight: 600 }}>🎨 色块</span>
        <Handle type="source" position={Position.Right} id="color-out" style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginLeft: 6 }} />
      </div>

      {/* 参数区 */}
      <div style={{ padding: 12 }}>
        {/* 色值 */}
        <ParamRow label="色值">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange('color', e.target.value)}
            style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 }}
          />
          <span style={{ color: '#94A3B8', fontSize: 10, fontFamily: 'monospace', marginLeft: 6 }}>{color}</span>
        </ParamRow>

        {/* 宽度 */}
        <ParamRow label="宽度">
          <SliderRange value={width} min={40} max={800} onChange={(v) => onChange('width', v)} unit="px" />
        </ParamRow>

        {/* 高度 */}
        <ParamRow label="高度">
          <SliderRange value={height} min={20} max={600} onChange={(v) => onChange('height', v)} unit="px" />
        </ParamRow>

        {/* 圆角 */}
        <ParamRow label="圆角">
          <SliderRange value={borderRadius} min={0} max={9999} onChange={(v) => onChange('borderRadius', v)} unit="px" />
        </ParamRow>

        {/* 不透明度 */}
        <ParamRow label="不透明度">
          <SliderRange value={p.opacity ?? 100} min={0} max={100} onChange={(v) => onChange('opacity', v)} unit="%" />
        </ParamRow>
      </div>

      {/* 底部预览 */}
      <div style={{ padding: '0 12px 12px' }}>
        <div
          style={{
            background: color,
            opacity: opacity,
            borderRadius: Math.min(borderRadius, 16),
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontFamily: 'monospace' }}>
            {color} · {width}×{height}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 参数行 */
function ParamRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ color: '#6B7280', fontSize: 10, width: 50, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>{children}</div>
    </div>
  );
}

/** 滑块 + 数值输入 + 单位 */
function SliderRange({ value, min, max, onChange, unit }) {
  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 3, accentColor: '#3B82F6' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{
          width: 36,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 4,
          padding: '2px 4px',
          color: '#E2E8F0',
          fontSize: 10,
          textAlign: 'right',
          outline: 'none',
        }}
      />
      <span style={{ color: '#4B5563', fontSize: 8, width: 20 }}>{unit}</span>
    </>
  );
}

export default memo(ColorBlockNode);
