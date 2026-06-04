/* ========================================
   Token 读取工具 — 从 tokens.css 读取 CSS 变量
   提供 get/set/watch/keys/search/getFavorites/refresh
   ======================================== */

;(function() {
  'use strict';

  var TokenStore = window.TokenStore = {};

  var _cache = {};
  var _watchers = {};
  var _initialized = false;

  function refreshCache() {
    var styles = getComputedStyle(document.documentElement);
    _cache = {};
    for (var i = 0; i < styles.length; i++) {
      var name = styles[i];
      if (name.indexOf('--') === 0) {
        _cache[name] = styles.getPropertyValue(name).trim();
      }
    }
    _initialized = true;
  }

  TokenStore.get = function(name) {
    if (!_initialized) refreshCache();
    if (name.indexOf('--') !== 0) name = '--' + name;
    return _cache[name] || '';
  };

  TokenStore.keys = function() {
    if (!_initialized) refreshCache();
    return Object.keys(_cache).filter(function(k) {
      return k.indexOf('--') === 0;
    });
  };

  TokenStore.getFavorites = function() {
    if (!_initialized) refreshCache();
    var result = {
      color: ['--color-primary-500', '--color-primary-700', '--color-primary-900',
              '--color-secondary-500', '--color-accent-500',
              '--color-success-500', '--color-warning-500', '--color-error-500',
              '--color-neutral-50', '--color-neutral-300', '--color-neutral-500',
              '--color-neutral-700', '--color-neutral-900',
              '--color-bg-primary', '--color-text-primary', '--color-text-secondary',
              '--color-border'],
      typography: ['--font-size-hero', '--font-size-h1', '--font-size-h2',
                   '--font-size-body', '--font-size-small', '--font-size-caption',
                   '--font-family-display', '--font-family-sans', '--font-family-mono',
                   '--font-weight-regular', '--font-weight-medium',
                   '--font-weight-semibold', '--font-weight-bold'],
      spacing: ['--spacing-xs', '--spacing-sm', '--spacing-md', '--spacing-lg',
                '--spacing-xl', '--spacing-2xl'],
      radius: ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full']
    };
    var filtered = {};
    Object.keys(result).forEach(function(cat) {
      filtered[cat] = result[cat].filter(function(k) { return _cache[k] !== undefined; });
    });
    return filtered;
  };

  TokenStore.search = function(keyword) {
    if (!_initialized) refreshCache();
    var kw = keyword.toLowerCase();
    var result = [];
    Object.keys(_cache).forEach(function(k) {
      if (k.indexOf(kw) >= 0) {
        result.push({ name: k, value: _cache[k] });
      }
    });
    return result;
  };

  TokenStore.watch = function(name, callback) {
    if (!_watchers[name]) _watchers[name] = [];
    _watchers[name].push(callback);
  };

  TokenStore.set = function(name, value) {
    if (name.indexOf('--') !== 0) name = '--' + name;
    _cache[name] = value;
    var list = _watchers[name];
    if (list) list.forEach(function(cb) { cb(value); });
  };

  TokenStore.refresh = function() {
    refreshCache();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshCache);
  } else {
    refreshCache();
  }
})();
