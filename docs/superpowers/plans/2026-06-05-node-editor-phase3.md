# 节点编辑器 Phase 3 — 变换组件 6 个节点

**Goal:** 在现有节点编辑器中新增 6 个变换/特效节点类型（变换/蒙版/边框/阴影/鼠标跟随/转场），更新右键菜单分组。

**Architecture:** 在 `site/js/node-engine.js` 的图标节点和全局 Token 节点之间插入 6 个节点，更新右键分组在"变换特效"组下。

---

## Task 1-6: 在 node-engine.js 中插入 6 个变换节点

**Files:**
- Modify: `site/js/node-engine.js`

在图标节点注册（`LiteGraph.registerNodeType('sill/icon', IconNode)`）之后，全局 Token 节点构造函数之前插入全部 6 个节点。

### 变换节点
- input: css, output: css
- Widgets: 缩放(number, 0.1-5, step 0.1), 旋转(number, -360-360), 透明度(slider, 0-100), 圆角(number, 0-9999)
- 功能: 在传入 CSS 上叠加 transform/opacity/border-radius

### 蒙版节点
- input: image, output: image
- Widgets: 形状(combo: 矩形/圆形/渐变), 羽化(number, 0-100), 反转(toggle)
- 功能: 对图片数据应用蒙版效果

### 边框节点
- input: css, output: css
- Widgets: 线型(combo: 实线/虚线/点线), 粗细(number, 0-20), 颜色(color), 圆角(number, 0-9999)
- 功能: 在传入 CSS 上叠加 border 属性

### 阴影节点
- input: css, output: css
- Widgets: 类型(combo: 投影/内阴影), X偏移, Y偏移, 模糊, 扩展, 颜色(color)
- 功能: 在传入 CSS 上叠加 box-shadow

### 鼠标跟随节点
- input: css, output: interactive
- Widgets: 效果(combo: 视差/发光/3D倾斜), 强度(number, 0-1, step 0.05), 范围(number, 50-500)
- 功能: 生成鼠标交互行为数据

### 转场节点
- input: css, output: interactive
- Widgets: 触发(combo: hover/click), 变换类型(combo: 缩放/位移/淡入), 时长(number, 0.1-5, step 0.1), 缓动(combo: ease-out/ease-in/linear)
- 功能: 生成过渡/动画交互行为数据

### 更新右键分组
新增"变换特效"分组：
```
'基础组件': [...],
'变换特效': ['sill/transform', 'sill/mask', 'sill/border', 'sill/shadow', 'sill/mouse-follow', 'sill/transition'],
'工具': [...],
'全局控制': [...]
```
