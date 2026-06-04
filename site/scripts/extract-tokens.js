#!/usr/bin/env node
/**
 * extract-tokens.js — DESIGN.md → tokens.css 自动提取工具
 *
 * 功能:
 *   1. parse   从 DESIGN.md 解析 Design Token，输出 css/tokens.json (Machine-readable)
 *   2. css     从 DESIGN.md 重新生成 css/tokens.css + css/tokens.json
 *   3. verify  验证 css/tokens.css 与 DESIGN.md 一致性
 *
 * 用法:
 *   node scripts/extract-tokens.js [parse|css|verify]
 *
 * 设计原则:
 *   - DESIGN.md 是唯一数据源 (Single Source of Truth)
 *   - tokens.css 完全由 DESIGN.md 驱动生成
 *   - 任何手改 tokens.css 的行为应当被 verify 检测到
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DESIGN_MD = path.join(ROOT, 'DESIGN.md');
const TOKENS_CSS = path.join(ROOT, 'css', 'tokens.css');
const TOKENS_JSON = path.join(ROOT, 'css', 'tokens.json');

// ============================================================
// Markdown 解析器
// ============================================================

function parseDesignMD(md) {
  const lines = md.split('\n');

  // 提取元数据 header（兼容中文：和英文: 冒号）
  const meta = {};
  const metaMatch = md.match(/^> \*\*([^*]+)[：:]\*\* (.+)$/gm);
  if (metaMatch) {
    metaMatch.forEach(m => {
      const [, key, val] = m.match(/^> \*\*([^*]+)[：:]\*\* (.+)$/) || [];
      if (key) meta[key.trim()] = val.trim();
    });
  }

  // 按标题分割为 sections
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentSection = { level, title, tokens: [], text: [], subtables: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.text.push(line);
    }
  }

  // 从 section 文本中解析 token 表格
  const tableRegex = /^\|(.+)\|\n\|[-| :]+\|\n(\|.+\|\n?)+/gm;
  const kvRegex = /[-*]\s*([^：]+)[：:]\s*`([^`]+)`/g;

  for (const section of sections) {
    const sectionText = section.text.join('\n');

    // 匹配表格
    tableRegex.lastIndex = 0;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(sectionText)) !== null) {
      const tableLines = tableMatch[0].trim().split('\n');
      if (tableLines.length < 3) continue;

      const headerCells = parseTableRow(tableLines[0]);
      if (headerCells.length < 2) continue;

      const schema = detectSchema(headerCells);

      for (let i = 2; i < tableLines.length; i++) {
        const cells = parseTableRow(tableLines[i]);
        if (cells.length < 2) continue;

        const stripped = cells.map(c => c.replace(/`/g, ''));
        const tokenIdx = stripped.findIndex(c => c.startsWith('--'));
        if (tokenIdx === -1) continue;

        const tokenName = stripped[tokenIdx].trim();
        const tokenValue = schema.valueIdx >= 0
          ? stripped[schema.valueIdx].trim() : '';
        const tokenDesc = schema.descIdx >= 0
          ? cells[schema.descIdx].trim() : '';

        const extra = {};
        if (schema.extras) {
          for (const [key, idx] of Object.entries(schema.extras)) {
            if (idx >= 0 && idx < stripped.length) {
              extra[key] = stripped[idx].trim();
            }
          }
        }

        if (tokenValue) {
          section.tokens.push({
            name: tokenName,
            value: tokenValue,
            description: tokenDesc,
            ...extra,
            source: section.title
          });
        }
      }
    }

    // 从 section 中解析非表格 Key-Value（如按钮状态色)
    // 只匹配紧跟在表格后面的 KV，且 key 和 value 都在同一行，value 为颜色值
    kvRegex.lastIndex = 0;
    let kvMatch;
    while ((kvMatch = kvRegex.exec(sectionText)) !== null) {
      // 忽略被 ` 包围的代码引用行（如暗色模式说明中的 `--color-xxx`: `#xxx` → `#xxx`）
      const lineStart = Math.max(0, kvMatch.index - 5);
      const linePrefix = sectionText.slice(lineStart, kvMatch.index);
      if (linePrefix.includes('`') || linePrefix.includes('→') || linePrefix.includes('->')) continue;

      const key = kvMatch[1].trim();
      const val = kvMatch[2].trim();
      // 必须看起来像 CSS 值
      if (/^[#\d]|^(rgb|hsl|var\b)/i.test(val) &&
          !section.tokens.find(t => t.name === key || t.name === `--${key}`)) {
        section.tokens.push({
          name: `--${key}`,
          value: val,
          description: '',
          source: section.title
        });
      }
    }
  }

  return { meta, sections };
}

function parseTableRow(row) {
  return row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}

function detectSchema(header) {
  const lowered = header.map(h => h.toLowerCase().trim());
  const valueIdx = lowered.findIndex(h => /色值|映射值|值|尺寸|数值/i.test(h));
  const descIdx = lowered.findIndex(h => /用途/i.test(h));

  const extras = {};
  const lineHeightIdx = lowered.findIndex(h => /行高/i.test(h));
  if (lineHeightIdx >= 0 && lineHeightIdx !== valueIdx) extras.lineHeight = lineHeightIdx;

  const fontWeightIdx = lowered.findIndex(h => /字重/i.test(h));
  if (fontWeightIdx >= 0) extras.fontWeight = fontWeightIdx;

  const letterSpacingIdx = lowered.findIndex(h => /字间距/i.test(h));
  if (letterSpacingIdx >= 0) extras.letterSpacing = letterSpacingIdx;

  const deviceIdx = lowered.findIndex(h => /设备/i.test(h));
  if (deviceIdx >= 0) extras.device = deviceIdx;

  const columnsIdx = lowered.findIndex(h => /列数/i.test(h));
  if (columnsIdx >= 0) extras.columns = columnsIdx;

  return { valueIdx, descIdx, extras };
}

// ============================================================
// 生成 tokens.json (Machine-readable)
// ============================================================

function extractAllTokens(parsed) {
  const CATEGORIES = [
    { key: 'brandColors',     title: '1. 颜色系统 — 品牌主色板',      match: n => /^--color-primary-\d+$/.test(n) },
    { key: 'buttonState',     title: '按钮状态色',                    match: n => /^--color-(primary|button)-(hover|active)$/.test(n) },
    { key: 'accentColors',    title: '2. 颜色系统 — 辅助色板',        match: n => /^--color-(secondary|accent|success|warning|error|info)-\d+$/.test(n) },
    { key: 'neutralLight',    title: '3. 颜色系统 — 中性色板（亮色模式）', match: n => /^--color-neutral-\w+$/.test(n) },
    { key: 'darkPalette',     title: '4. 颜色系统 — 中性色板（暗色模式）', match: n => /^--color-dark-/.test(n) },
    { key: 'semanticColors',  title: '5. 颜色系统 — 语义色别名',      match: n => /^--color-(bg|text|link|border|button)/.test(n) },
    { key: 'fontFamily',      title: '6. 排版系统 — 字体家族',         match: n => /^--font-family-/.test(n) },
    { key: 'fontSize',        title: '7. 排版系统 — 字号层级',         match: n => /^--font-size-/.test(n) },
    { key: 'fontWeight',      title: '8. 排版系统 — 字重映射',         match: n => /^--font-weight-/.test(n) },
    { key: 'spacing',         title: '9. 间距系统',                    match: n => /^--spacing-/.test(n) },
    { key: 'breakpoint',      title: '10. 断点系统',                   match: n => /^--breakpoint-/.test(n) },
    { key: 'shadow',          title: '11. 阴影系统',                   match: n => /^--shadow-/.test(n) },
    { key: 'radius',          title: '12. 圆角系统',                   match: n => /^--radius-/.test(n) },
    { key: 'nav',             title: '13. 导航',                       match: n => /^--nav-/.test(n) },
  ];

  const categorized = {};
  for (const cat of CATEGORIES) {
    categorized[cat.key] = { title: cat.title, tokens: {} };
  }

  // 收集所有 Token（完整 CSS 变量名）
  const allTokens = {};
  for (const section of parsed.sections) {
    for (const t of section.tokens) {
      const fullName = t.name.startsWith('--') ? t.name : `--${t.name}`;
      if (!allTokens[fullName]) {
        allTokens[fullName] = {
          value: t.value, description: t.description, source: t.source
        };
        if (t.lineHeight) allTokens[fullName].lineHeight = t.lineHeight;
        if (t.fontWeight) allTokens[fullName].fontWeight = t.fontWeight;
        if (t.letterSpacing) allTokens[fullName].letterSpacing = t.letterSpacing;
      }
    }
  }

  // 分类入库（key 去掉 -- 前缀）
  for (const [fullName, data] of Object.entries(allTokens)) {
    for (const cat of CATEGORIES) {
      if (cat.match(fullName)) {
        categorized[cat.key].tokens[fullName.slice(2)] = data;
        break;
      }
    }
  }

  let totalCount = 0;
  for (const cat of CATEGORIES) {
    totalCount += Object.keys(categorized[cat.key].tokens).length;
  }

  return {
    meta: {
      version: parsed.meta['版本'] || 'unknown',
      generatedAt: new Date().toISOString().split('T')[0],
      source: 'DESIGN.md',
      totalTokens: totalCount
    },
    categories: CATEGORIES.map(c => c.key),
    categorized,
    raw: allTokens
  };
}

// ============================================================
// 生成 tokens.css
// ============================================================

function generateCSS(allTokens) {
  const lines = [];

  lines.push('/* ========================================');
  lines.push('   Apple 中国官网设计系统 — Design Token');
  lines.push(`   自动生成自 DESIGN.md v${allTokens.meta.version}`);
  lines.push(`   生成日期: ${allTokens.meta.generatedAt}`);
  lines.push('   ======================================== */');
  lines.push('');
  lines.push(':root {');
  lines.push('  color-scheme: light dark;');
  lines.push('  accent-color: var(--color-primary-500);');
  lines.push('');

  for (const catKey of allTokens.categories) {
    const cat = allTokens.categorized[catKey];
    const entries = Object.entries(cat.tokens);
    if (entries.length === 0) continue;

    lines.push('  /* ========================================');
    lines.push(`     ${cat.title}`);
    lines.push('     ======================================== */');
    lines.push('');
    for (const [name, t] of entries) {
      const comment = t.description ? `  /* ${t.description} */` : '';
      const extra = [];
      if (t.lineHeight) extra.push(`行高 ${t.lineHeight}`);
      if (t.fontWeight) extra.push(`字重 ${t.fontWeight}`);
      if (t.letterSpacing) extra.push(`字间距 ${t.letterSpacing}`);
      const extraComment = extra.length > 0 ? ` (${extra.join(', ')})` : '';
      lines.push(`  --${name}: ${t.value};${comment}${extraComment}`);
    }
    lines.push('');
  }

  lines.push('}');
  lines.push('');

  // 暗色模式覆盖
  const darkOverrides = [
    ['--color-bg-primary', '#000000'],
    ['--color-bg-card', '#1D1D1F'],
    ['--color-neutral-150', '#1D1D1F'],
    ['--color-neutral-200', '#333336'],
    ['--color-neutral-300', '#333336'],
    ['--color-text-primary', '#F5F5F7'],
    ['--color-text-secondary', '#86868B'],
    ['--color-text-tertiary', '#6E6E73'],
    ['--color-text-inverse', '#F5F5F7'],
    ['--color-link', '#2997FF'],
    ['--color-link-hover', '#2997FF'],
    ['--color-border', '#333336'],
    ['--color-button-dark', '#F5F5F7'],
    ['--color-button-dark-hover', '#FFFFFF'],
    ['--color-button-dark-active', '#86868B'],
  ];

  lines.push('/* ========================================');
  lines.push('   暗色模式 — 变量覆盖');
  lines.push('   ======================================== */');
  lines.push('');
  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push('  :root:not([data-theme]) {');
  for (const [name, val] of darkOverrides) {
    lines.push(`    ${name}: ${val};`);
  }
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push(':root[data-theme="dark"] {');
  for (const [name, val] of darkOverrides) {
    lines.push(`  ${name}: ${val};`);
  }
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// 验证 tokens.css 与 DESIGN.md 一致性
// ============================================================

function verifyConsistency(parsed, existingCSS) {
  const issues = [];

  // 1. 从 DESIGN.md 构建预期 Token 映射（有效CSS变量名，表格值优先）
  const validTokenRegex = /^--[a-z][\w-]*$/;
  const expectedMap = new Map();
  for (const section of parsed.sections) {
    for (const t of section.tokens) {
      if (validTokenRegex.test(t.name) && !expectedMap.has(t.name)) {
        expectedMap.set(t.name, { value: t.value, source: t.source });
      }
    }
  }

  // 2. 从 tokens.css 只提取 :root 块中的变量（排除暗色模式覆盖）
  const rootOnly = existingCSS
    .replace(/@media\s+\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?\}\s*\}/g, '')
    .replace(/:root\[data-theme="dark"\]\s*\{[\s\S]*?\}\s*/g, '');
  const cssVarRegex = /(--[\w-]+):\s*([^;]+);/g;
  const cssVars = {};
  let m;
  while ((m = cssVarRegex.exec(rootOnly)) !== null) {
    const name = m[1];
    if (name === 'color-scheme' || name === 'accent-color') continue;
    cssVars[name] = m[2].trim();
  }

  // 3. 检查 DESIGN.md 中的 token 是否都在 :root 中
  for (const [name, expected] of expectedMap) {
    const cssVal = cssVars[name];
    if (cssVal === undefined) {
      issues.push({ type: 'missing', token: name, message: `在 tokens.css :root 中缺失` });
    } else if (cssVal !== expected.value &&
               !expected.value.includes('…') && !expected.value.includes('-') &&
               /^[#\d]/.test(expected.value)) {
      issues.push({
        type: 'mismatch',
        token: name,
        expected: expected.value,
        actual: cssVal,
        message: `值不一致: DESIGN.md="${expected.value}" vs tokens.css="${cssVal}"`
      });
    }
  }

  // 4. 检查是否有多余变量
  const knownExtras = [
    '--color-primary-hover', '--color-primary-active',
    '--color-link-hover', '--color-link-dark',
    '--color-button-dark-hover', '--color-button-dark-active',
    '--color-button-primary-hover', '--color-button-primary-active',
    '--color-button-dark', '--color-button-dark-hover', '--color-button-dark-active',
    '--font-family-mono'
  ];
  for (const name of Object.keys(cssVars)) {
    if (!expectedMap.has(name) && !knownExtras.includes(name)) {
      issues.push({ type: 'extra', token: name, message: `在 tokens.css 中存在但 DESIGN.md 中未定义` });
    }
  }

  return { issues, totalExpected: expectedMap.size, totalCSS: Object.keys(cssVars).length };
}

// ============================================================
// 主入口
// ============================================================

function main() {
  const cmd = process.argv[2] || 'parse';

  if (!fs.existsSync(DESIGN_MD)) {
    console.error(`错误: 未找到 ${DESIGN_MD}`);
    console.error('请确保在项目根目录运行此脚本。');
    process.exit(1);
  }

  const md = fs.readFileSync(DESIGN_MD, 'utf-8');
  const parsed = parseDesignMD(md);
  const allTokens = extractAllTokens(parsed);

  switch (cmd) {
    case 'parse':
      handleParse(allTokens);
      break;
    case 'css':
      handleCSS(allTokens);
      break;
    case 'verify':
      handleVerify(parsed);
      break;
    default:
      console.log(`用法: node scripts/extract-tokens.js [parse|css|verify]`);
      console.log('');
      console.log('  parse   解析 DESIGN.md 并输出 tokens.json (Machine-readable)');
      console.log('  css     从 DESIGN.md 重新生成 css/tokens.css + css/tokens.json');
      console.log('  verify  验证 css/tokens.css 与 DESIGN.md 一致性');
      process.exit(0);
  }
}

function handleParse(allTokens) {
  fs.writeFileSync(TOKENS_JSON, JSON.stringify(allTokens, null, 2), 'utf-8');
  console.log(`✅ 已生成 ${TOKENS_JSON}`);
  console.log(`   版本: v${allTokens.meta.version}`);
  console.log(`   Token 总数: ${allTokens.meta.totalTokens}`);
  for (const catKey of allTokens.categories) {
    const count = Object.keys(allTokens.categorized[catKey].tokens).length;
    if (count > 0) {
      console.log(`   ${allTokens.categorized[catKey].title}: ${count}`);
    }
  }
}

function handleCSS(allTokens) {
  const css = generateCSS(allTokens);
  fs.writeFileSync(TOKENS_CSS, css, 'utf-8');
  const lineCount = css.split('\n').length;
  console.log(`✅ 已生成 ${TOKENS_CSS}`);
  console.log(`   行数: ${lineCount}`);
  console.log(`   版本: v${allTokens.meta.version}`);

  // 同时生成 JSON
  handleParse(allTokens);
}

function handleVerify(parsed) {
  if (!fs.existsSync(TOKENS_CSS)) {
    console.error(`❌ 未找到 ${TOKENS_CSS}，无法验证。`);
    console.log('   先运行 node scripts/extract-tokens.js css 生成。');
    process.exit(1);
  }

  const existingCSS = fs.readFileSync(TOKENS_CSS, 'utf-8');
  const { issues, totalExpected, totalCSS } = verifyConsistency(parsed, existingCSS);

  console.log(`📊 验证结果:`);
  console.log(`   DESIGN.md Token 数: ${totalExpected}`);
  console.log(`   tokens.css 变量数: ${totalCSS}`);
  console.log(`   问题数: ${issues.length}`);
  console.log('');

  if (issues.length === 0) {
    console.log('✅ DESIGN.md 与 tokens.css 完全一致！');
    return;
  }

  const missing = issues.filter(i => i.type === 'missing');
  const mismatch = issues.filter(i => i.type === 'mismatch');
  const extra = issues.filter(i => i.type === 'extra');

  if (missing.length > 0) {
    console.log(`❌ 缺失 Token (${missing.length}):`);
    missing.forEach(i => console.log(`   - ${i.token}: ${i.message}`));
    console.log('');
  }
  if (mismatch.length > 0) {
    console.log(`⚠️ 值不匹配 (${mismatch.length}):`);
    mismatch.forEach(i => console.log(`   - ${i.token}: ${i.message}`));
    console.log('');
  }
  if (extra.length > 0) {
    console.log(`ℹ️  额外变量 (${extra.length}):`);
    extra.forEach(i => console.log(`   - ${i.token}: ${i.message}`));
    console.log('');
  }

  if (missing.length > 0) {
    console.log('建议运行 node scripts/extract-tokens.js css 重新生成。');
    process.exit(1);
  }
}

main();
