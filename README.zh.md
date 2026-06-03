# 🎨 Design System Architect (设计系统架构师)

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License MIT">
  <img src="https://img.shields.io/badge/Claude%20Code-Skill-8A2BE2" alt="Claude Code Skill">
</p>

> 从网页截图或 URL 自动提取视觉设计元素，生成结构化 **Design Token** 体系和 **DESIGN.md** 规范文档。桥接视觉设计与代码实现之间的鸿沟。

---

## 📦 安装

### 方式一：作为独立 Skill 安装

```bash
# 克隆到 Claude Code 的 skills 目录
git clone https://github.com/2222333-kounm/System-Design-Architec-sill.git \
  .claude/skills/design-system-architect
```

### 方式二：在当前项目中使用

```bash
git clone https://github.com/2222333-kounm/System-Design-Architec-sill.git
cd System-Design-Architec-sill
```

---

## 🚀 快速使用

### 分析网页链接

在 Claude Code 中执行：

```
/design-system-architect 请分析 https://stripe.com 的设计风格，
提取颜色系统、排版规则和组件样式，输出完整的 DESIGN.md 文档。
```

### 分析设计截图

直接上传截图并执行：

```
/design-system-architect 请分析这张截图的设计语言，
识别配色方案、字体风格和布局逻辑，生成标准 DESIGN.md 文档。
```

---

## 🧩 核心能力

| 能力 | 说明 |
|------|------|
| **🔍 感知层分析** | 从网页提取 CSS 计算样式（颜色、字体、间距、组件），或从截图识别配色、排版、布局 |
| **🧠 设计匹配推理** | 内置 10 种主流设计风格库，结合行业规则（金融、电商、SaaS 等）自动匹配最佳风格 |
| **🏗️ 三层 Token 体系** | Global Token → Alias Token → Component Token，遵循行业命名规范 |
| **📝 标准化输出** | 生成 6 章完整 DESIGN.md，AI 可直接读取并用于代码生成 |

---

## 📋 输出内容预览

生成的 `DESIGN.md` 包含 6 大核心章节：

| 章节 | 内容 |
|------|------|
| **视觉主题概述** | 设计流派、核心理念、适用场景 |
| **颜色系统** | 品牌色板（5 阶）、辅助色板（6 色）、中性色板（6 阶）、语义别名 |
| **排版系统** | 字体家族、字号层级（h1–caption）、字重映射 |
| **组件样式** | 主/次按钮（含 4 状态）、输入框、卡片、导航 |
| **布局原则** | 间距系统、断点系统、12 列栅格、阴影层级、圆角系统 |
| **设计禁忌** | Do's & Don'ts（遵循 WCAG AA 标准） |

---

## ⚙️ 工作流程

```
输入素材 ──→ 感知层分析 ──→ 设计推理与匹配 ──→ Token 体系构建 ──→ 输出 DESIGN.md
 (URL/图片)    (提取原始样式)    (匹配风格流派)      (三层Token)        (完整文档)
```

1. **接收输入素材** — 支持网页 URL 或设计截图
2. **感知层分析** — 提取颜色、字体、间距、组件样式等原始数据
3. **设计推理与匹配** — 匹配 10 种设计风格库 + 行业特定规则优化
4. **Token 体系构建** — Global → Alias → Component 三层 Design Token
5. **输出 DESIGN.md** — 按标准模板生成完整的设计规范文档

---

## 📁 项目结构

```
skills/design-system-architect/
├── SKILL.md              # 核心技能定义（工作流/约束/命名规范）
├── DESIGN-TEMPLATE.md    # 输出模板（6 章节标准结构）
├── style-library.md      # 设计风格库（10 种主流风格 + 匹配决策指南）
└── usage-guide.md        # 使用指南（调用方式 / 验证清单 / 快速参考）
```

---

## 🎨 内置风格库

| 风格 | 适用行业 |
|------|---------|
| 极简主义 | 奢侈品、设计工作室、SaaS |
| 毛玻璃效果 | 创意工作室、游戏、娱乐 |
| 新拟态 | 个人工具、音乐播放器 |
| 扁平设计 | 大众 App、教育平台 |
| Material Design | 安卓应用、跨平台工具 |
| 金融/企业专业风 | 银行、保险、B2B SaaS |
| 电商/零售 | 电商平台、促销活动 |
| 科技/SaaS 现代风 | 科技创业、AI 产品 |
| 内容/媒体 | 新闻、博客、文档站点 |
| 游戏/娱乐 | 游戏平台、电竞、流媒体 |

---

## 📄 许可

[MIT](LICENSE) © 2222333-kounm
