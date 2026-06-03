# 使用指南：设计系统架构师 Skill

## 如何调用此 Skill

### 方式一：直接使用（推荐）

在 Claude Code 中直接输入以下内容：

```
/design-system-architect 请分析这个网页 https://example.com 并生成设计系统文档
```

或上传一张设计截图：

```
/design-system-architect 请分析这张截图的设计风格，生成完整的 DESIGN.md
```

### 方式二：手动加载

```markdown
请加载 skills/design-system-architect 技能，分析我的输入并生成 DESIGN.md
```

---

## 输入类型说明

### 1. 网页链接分析

**要求**：
- 链接必须可公开访问（无需登录）
- 页面应有完整的 UI 设计元素

**示例指令**：
```
请分析 https://stripe.com 的设计风格，提取颜色系统、排版规则和组件样式，
输出一份完整的 DESIGN.md 文档。
```

### 2. 设计截图分析

**要求**：
- 图片格式：PNG、JPG、WebP
- 分辨率建议 ≥ 800px
- 截图应清晰展示配色、排版和组件

**示例指令**：
```
[上传设计截图]
请分析这张截图的设计语言，识别配色方案、字体风格和布局逻辑，
生成标准 DESIGN.md 文档。
```

---

## 输出使用方式

生成的 `DESIGN.md` 文件可直接：

1. **作为 Claude Code 上下文**：在生成 UI 代码前加载 DESIGN.md
2. **指导前端开发**：提供给前端开发者作为设计规范
3. **驱动 AI 代码生成**：让 AI 严格遵循 DESIGN.md 中的 Token 生成组件代码

### 在 Claude Code 中使用 DESIGN.md

```markdown
请参考项目根目录的 DESIGN.md 设计规范，
基于其中的 Design Token 生成一个登录页面组件。
```

---

## 验证 checklist

输出 DESIGN.md 后，请检查：

- [ ] 所有颜色使用十六进制格式（`#RRGGBB`）
- [ ] Token 命名符合 `--category-name-weight` 规范
- [ ] 包含 6 个核心章节（主题/颜色/排版/组件/布局/禁忌）
- [ ] 组件状态完整（normal/hover/active/disabled）
- [ ] 字体指定了具体家族和尺寸（px/rem）
- [ ] 间距和尺寸使用统一单位
- [ ] Markdown 语法正确，AI 可解析
- [ ] 信息完全基于输入素材，无臆测内容

---

## 快速参考示例

### 分析网页 → DESIGN.md（30 秒流程）

```
1. 用户提供 URL
2. Claude 加载 design-system-architect 技能
3. 执行感知层分析（提取颜色/字体/间距/组件样式）
4. 匹配风格库（识别设计流派）
5. 构建 3 层 Token 体系
6. 输出 DESIGN.md
```

### 分析截图 → DESIGN.md（视觉分析流程）

```
1. 用户上传截图
2. Claude 加载 design-system-architect 技能
3. 执行多模态分析（配色/字体/布局/流派识别）
4. 匹配风格库 + 行业推理
5. 构建设计 Token
6. 输出 DESIGN.md
```
