/* ========================================
   Token 锁定/解锁状态管理
   每个节点实例维护自己的锁定状态表
   ======================================== */

;(function() {
  'use strict';

  var TokenLock = window.TokenLock = {};

  // 存储: nodeId -> { fieldName: { tokenName, locked, customValue } }
  var _locks = {};

  /**
   * 初始化一个节点的锁定状态
   * @param {string} nodeId
   * @param {Object} defaults - { fieldName: tokenName }
   */
  TokenLock.init = function(nodeId, defaults) {
    if (!_locks[nodeId]) _locks[nodeId] = {};
    Object.keys(defaults).forEach(function(field) {
      if (!_locks[nodeId][field]) {
        _locks[nodeId][field] = {
          tokenName: defaults[field],
          locked: true,
          customValue: null
        };
      }
    });
  };

  /**
   * 获取某个字段的值（如果是锁定状态则返回 Token 值，否则返回自定义值）
   * @param {string} nodeId
   * @param {string} field
   * @returns {string|null}
   */
  TokenLock.getValue = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    if (!state) return null;
    if (state.locked) {
      return window.TokenStore.get(state.tokenName) || null;
    }
    return state.customValue;
  };

  /**
   * 用户手动修改值 → 自动解锁
   * @param {string} nodeId
   * @param {string} field
   * @param {string} value
   */
  TokenLock.setCustom = function(nodeId, field, value) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    if (!state) return;
    if (state.locked) {
      state.locked = false;
      console.log('[TokenLock] ' + field + ' 已断开与 Token 的同步');
    }
    state.customValue = value;
  };

  /**
   * 重置为 Token 默认值 → 重新锁定
   * @param {string} nodeId
   * @param {string} field
   * @returns {string} 当前 Token 值
   */
  TokenLock.resetToToken = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    if (!state) return '';
    state.locked = true;
    state.customValue = null;
    return window.TokenStore.get(state.tokenName) || '';
  };

  /**
   * 检查某个字段是否锁定
   */
  TokenLock.isLocked = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    return state ? state.locked : false;
  };

  /**
   * 获取某个字段绑定的 Token 名
   */
  TokenLock.getTokenName = function(nodeId, field) {
    var state = _locks[nodeId] && _locks[nodeId][field];
    return state ? state.tokenName : null;
  };

  /**
   * 清理（节点删除时调用）
   */
  TokenLock.removeNode = function(nodeId) {
    delete _locks[nodeId];
  };

})();
