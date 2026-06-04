# 🎨 Design System Architect — Sill

> Apple 中国官网首页重构 + design-system-architect Skill

---

## 目录结构

```
sill/
├── site/                          ← 项目产出（Apple 官网重构页面）
│   ├── index.html                 ← 首页
│   ├── css/
│   │   ├── tokens.css             ← Design Token（自动生成自 DESIGN.md）
│   │   ├── tokens.json            ← Machine-readable Token 数据
│   │   └── style.css              ← 组件样式
│   ├── images/                    ← 图片资源 + 占位图
│   ├── scripts/
│   │   └── extract-tokens.js      ← DESIGN.md → Code 自动提取工具
│   ├── DESIGN.md                  ← 设计系统规范（Single Source of Truth）
│   ├── README.md                  ← 英文说明
│   ├── README.zh.md               ← 中文说明
│   ├── Background.md              ← 项目背景
│   └── 改进.md                    ← 改进建议与跟踪
│
├── skills/
│   └── design-system-architect/   ← Claude Code Skill 定义
│       ├── SKILL.md
│       ├── DESIGN-TEMPLATE.md
│       ├── style-library.md
│       └── usage-guide.md
│
├── .claude/                       ← Claude Code 配置
└── .gitignore
```

## 快速开始

```bash
# 打开 Apple 官网重构页面
cd site
open index.html

# 验证 Design Token 一致性
cd site
node scripts/extract-tokens.js verify

# 从 DESIGN.md 重新生成 tokens.css
node scripts/extract-tokens.js css
```

## 许可证

MIT © 2222333-kounm
