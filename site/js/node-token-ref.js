/* ========================================
   @token 引用解析工具
   "@color-primary-500" → "#3B82F6"
   ======================================== */

;(function() {
  'use strict';

  var TokenRef = window.TokenRef = {};

  TokenRef.resolve = function(str) {
    if (typeof str !== 'string') return str;
    if (str.indexOf('@') < 0) return str;
    var ts = window.TokenStore;
    return str.replace(/@([\w-]+)/g, function(match, tokenName) {
      var val = ts.get(tokenName);
      if (val) return val;
      val = ts.get('--' + tokenName);
      if (val) return val;
      return match;
    });
  };

  TokenRef.hasRef = function(str) {
    return typeof str === 'string' && str.indexOf('@') >= 0;
  };

  TokenRef.extractRefs = function(str) {
    if (typeof str !== 'string') return [];
    var matches = str.match(/@([\w-]+)/g);
    if (!matches) return [];
    return matches.map(function(m) { return m.slice(1); });
  };
})();
