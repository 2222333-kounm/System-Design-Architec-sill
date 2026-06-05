/* ========================================
   TokenReader — 从 tokens.css 读取/写入 CSS 变量
   V2 版（替代 V1 的 node-token.js）
   ======================================== */

;(function() {
  'use strict';

  var TokenReader = window.TokenReader = {};

  var _cache = {};

  function refreshCache() {
    var styles = getComputedStyle(document.documentElement);
    _cache = {};
    for (var i = 0; i < styles.length; i++) {
      var name = styles[i];
      if (name.indexOf('--') === 0) {
        _cache[name] = styles.getPropertyValue(name).trim();
      }
    }
  }

  TokenReader.get = function(name) {
    if (Object.keys(_cache).length === 0) refreshCache();
    if (name.indexOf('--') !== 0) name = '--' + name;
    return _cache[name] || '';
  };

  TokenReader.keys = function() {
    if (Object.keys(_cache).length === 0) refreshCache();
    return Object.keys(_cache).filter(function(k) { return k.indexOf('--') === 0; });
  };

  TokenReader.getAll = function() {
    if (Object.keys(_cache).length === 0) refreshCache();
    return JSON.parse(JSON.stringify(_cache));
  };

  TokenReader.set = function(name, value) {
    if (name.indexOf('--') !== 0) name = '--' + name;
    document.documentElement.style.setProperty(name, value);
    _cache[name] = value;
  };

  TokenReader.refresh = refreshCache;

  TokenReader.exportCSS = function() {
    var all = TokenReader.getAll();
    var lines = [':root {'];
    var lastCat = '';
    Object.keys(all).forEach(function(k) {
      var cat = k.split('-')[1] || '';
      if (cat !== lastCat) {
        lines.push('');
        lastCat = cat;
      }
      lines.push('  ' + k + ': ' + all[k] + ';');
    });
    lines.push('}');
    return lines.join('\n');
  };

  TokenReader.getCategories = function() {
    var all = TokenReader.getAll();
    var cats = {};
    Object.keys(all).forEach(function(k) {
      var cat = '其他';
      if (k.indexOf('--color-') === 0) cat = '颜色';
      else if (k.indexOf('--font-') === 0) cat = '排版';
      else if (k.indexOf('--spacing-') === 0) cat = '间距';
      else if (k.indexOf('--radius-') === 0) cat = '圆角';
      else if (k.indexOf('--breakpoint-') === 0) cat = '断点';
      else if (k.indexOf('--shadow-') === 0) cat = '阴影';
      else if (k.indexOf('--nav-') === 0) cat = '导航';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push({ name: k, value: all[k] });
    });
    return cats;
  };

  refreshCache();
  console.log('[TokenReader] 已加载，' + Object.keys(_cache).length + ' 个 Token');
})();
