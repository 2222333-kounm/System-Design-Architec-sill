# 🎨 Design System Architect

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License MIT">
  <img src="https://img.shields.io/badge/Claude%20Code-Skill-8A2BE2" alt="Claude Code Skill">
</p>

> Reverse-engineer complete design systems from webpage URLs or design screenshots. Generate structured **Design Tokens** and a **DESIGN.md** specification document — bridging the gap between visual design and code implementation.

---

## 📦 Installation

### Option 1: Install as a Skill

```bash
# Clone into your Claude Code skills directory
git clone https://github.com/2222333-kounm/System-Design-Architec-sill.git \
  .claude/skills/design-system-architect
```

### Option 2: Use in your project

```bash
git clone https://github.com/2222333-kounm/System-Design-Architec-sill.git
cd System-Design-Architec-sill
```

---

## 🚀 Quick Start

### Analyze a Webpage

Run this in Claude Code:

```
/design-system-architect Analyze https://stripe.com and extract its
color system, typography rules, and component styles.
Generate a complete DESIGN.md document.
```

### Analyze a Design Screenshot

Upload a screenshot and run:

```
/design-system-architect Analyze this screenshot's design language,
identify the color palette, font styles, and layout logic.
Generate a standard DESIGN.md document.
```

---

## 🧩 Core Capabilities

| Capability | Description |
|-----------|-------------|
| **🔍 Perception Layer Analysis** | Extract CSS computed styles from web pages (colors, fonts, spacing, components) or identify palettes, typography, and layout from screenshots |
| **🧠 Design Matching & Reasoning** | Built-in library of 10 major design styles + industry-specific rules (finance, e-commerce, SaaS, etc.) for automatic style matching |
| **🏗️ Three-Layer Token System** | Global Token → Alias Token → Component Token, following industry naming conventions |
| **📝 Standardized Output** | Generates a 6-chapter DESIGN.md that AI tools can read directly for code generation |

---

## 📋 Output Preview

The generated `DESIGN.md` includes 6 core chapters:

| Chapter | Content |
|---------|---------|
| **Visual Theme Overview** | Design style, core philosophy, use cases |
| **Color System** | Brand palette (5 shades), auxiliary palette (6 colors), neutral palette (6 shades), semantic aliases |
| **Typography System** | Font families, type scale (h1–caption), font weight mapping |
| **Component Styles** | Primary/secondary buttons (4 states each), inputs, cards, navigation |
| **Layout Principles** | Spacing system, breakpoints, 12-column grid, shadow levels, border-radius system |
| **Design Guidelines** | Do's & Don'ts (WCAG AA compliance) |

---

## ⚙️ Workflow

```
Input ──→ Perception Layer Analysis ──→ Design Matching & Reasoning ──→ Token Construction ──→ Output DESIGN.md
(URL/img)    (extract raw styles)         (match design style)          (3-layer tokens)         (full document)
```

1. **Receive Input** — Accepts a webpage URL or design screenshot
2. **Perception Analysis** — Extracts colors, fonts, spacing, component styles
3. **Design Matching** — Matches against 10 design style libraries + industry-specific rules
4. **Token Construction** — Builds Global → Alias → Component design tokens
5. **Output DESIGN.md** — Generates a complete design specification document from the standard template

---

## 📁 Project Structure

```
skills/design-system-architect/
├── SKILL.md              # Core skill definition (workflow, constraints, naming)
├── DESIGN-TEMPLATE.md    # Output template (6-chapter standard structure)
├── style-library.md      # Design style library (10 styles + matching guide)
└── usage-guide.md        # Usage guide (invocation, checklist, quick reference)
```

---

## 🎨 Built-in Style Library

| Style | Industry Fit |
|-------|-------------|
| Minimalist | Luxury, design studios, SaaS |
| Glassmorphism | Creative studios, gaming, entertainment |
| Neumorphism | Personal tools, music players |
| Flat Design | Consumer apps, education platforms |
| Material Design | Android apps, cross-platform tools |
| Corporate / Enterprise | Banking, insurance, B2B SaaS |
| E-commerce / Retail | Online stores, promotions |
| Tech / SaaS Modern | Startups, AI products |
| Content / Media | News, blogs, documentation |
| Gaming / Entertainment | Game platforms, esports, streaming |

---

## 📄 License

[MIT](LICENSE) © 2222333-kounm
