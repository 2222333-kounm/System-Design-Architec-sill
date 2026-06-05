/* ========================================
   Store — 轻量发布订阅状态管理
   替代 window.* 全局变量
   ======================================== */

;(function() {
  'use strict';

  /**
   * 创建单一 Store 实例
   * 用法:
   *   Store.set('graph', graphRef)
   *   Store.get('graph')
   *   Store.subscribe('graph', fn)    // 值变化时回调
   *   Store.subscribe('graph:change', fn)  // 特定事件名
   *   Store.emit('preview:update', data)
   */
  var Store = window.Store = {};

  var _state = {};
  var _listeners = {};

  /**
   * 存值
   * @param {string} key
   * @param {*} value
   * @param {boolean} [silent=false] - 设为 true 时不触发回调
   */
  Store.set = function(key, value, silent) {
    var prev = _state[key];
    _state[key] = value;
    if (!silent) {
      // 通知值变化监听
      notify(key, value, prev);
      // 也通知通配符监听
      notify('*', { key: key, value: value, prev: prev });
    }
  };

  /**
   * 取值
   * @param {string} key
   * @returns {*}
   */
  Store.get = function(key) {
    return _state[key];
  };

  /**
   * 删除
   * @param {string} key
   */
  Store.remove = function(key) {
    delete _state[key];
  };

  /**
   * 订阅变更
   * @param {string} keyOrEvent - 'key' 或 'event:name'
   * @param {function} callback - (value, prevValue) 或 (data)
   * @returns {function} unsubscribe
   */
  Store.subscribe = function(keyOrEvent, callback) {
    if (!_listeners[keyOrEvent]) {
      _listeners[keyOrEvent] = [];
    }
    _listeners[keyOrEvent].push(callback);
    // 返回取消订阅函数
    return function() {
      var idx = _listeners[keyOrEvent].indexOf(callback);
      if (idx >= 0) _listeners[keyOrEvent].splice(idx, 1);
    };
  };

  /**
   * 一次性订阅
   */
  Store.once = function(keyOrEvent, callback) {
    var unsub;
    unsub = Store.subscribe(keyOrEvent, function() {
      callback.apply(null, arguments);
      if (unsub) unsub();
    });
  };

  /**
   * 触发事件（不依赖值变化）
   * @param {string} eventName
   * @param {*} data
   */
  Store.emit = function(eventName, data) {
    notify('event:' + eventName, data);
    notify('*', { event: eventName, data: data });
  };

  function notify(key, value, prev) {
    var list = _listeners[key];
    if (list) {
      list.forEach(function(fn) {
        try { fn(value, prev); } catch(e) { console.warn('[Store] listener error:', e); }
      });
    }
    // 也触发 key:change 事件（兼容 emit 风格）
    if (key.indexOf(':') < 0 && key.indexOf('event:') !== 0) {
      var changeList = _listeners[key + ':change'];
      if (changeList) {
        changeList.forEach(function(fn) {
          try { fn(value, prev); } catch(e) { console.warn('[Store] listener error:', e); }
        });
      }
    }
  }

  /**
   * 重置（清空所有状态和监听器）
   */
  Store.reset = function() {
    _state = {};
    _listeners = {};
  };

  /**
   * 获取当前状态快照
   */
  Store.snapshot = function() {
    return JSON.parse(JSON.stringify(_state));
  };

  console.log('[Store] 状态管理器已加载');
})();
