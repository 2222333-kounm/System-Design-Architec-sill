/* ========================================
   转换节点 — 类型/格式转换
   输入: input (any) | 输出: output (any)
   ======================================== */

;(function() {
  'use strict';

  if (typeof NodeBase === 'undefined') {
    console.warn('[Convert] NodeBase 未加载');
    return;
  }

  // =====================
  //  转换节点定义
  // =====================

  function ConvertNode() {
    this.addInput('input', 'any');
    this.addOutput('output', 'any');

    this.properties = {
      mode: 'text→css'
    };

    var that = this;

    // 转换模式（下拉列表）
    this.addWidget('combo', '模式', this.properties.mode, function(v) {
      that.properties.mode = v;
      that._markDirty();
    }, {
      values: ['text→css', 'color→css', 'image→css', 'css→text', 'object→json', 'json→object']
    });

    // 节点尺寸
    this.previewY = 60;
    this.size = [280, 120];
  }

  ConvertNode.title = '🔄 转换';
  ConvertNode.desc = '类型/格式转换 · text→css / color→css / image→css / css→text / object→json / json→object';

  ConvertNode.prototype = Object.create(NodeBase.prototype);
  ConvertNode.prototype.constructor = ConvertNode;

  /**
   * 节点执行 — 根据模式转换数据
   */
  ConvertNode.prototype.onExecute = function() {
    var input = this.getInputData(0);
    var mode = this.properties.mode;

    if (input == null || input === undefined) {
      this._lastOutput = this.buildOutput('error', null, { message: '转换失败: 输入为空' });
      this.setOutputData(0, this._lastOutput);
      return;
    }

    try {
      switch (mode) {
        case 'text→css':
          this._lastOutput = this._convertTextToCss(input);
          break;
        case 'color→css':
          this._lastOutput = this._convertColorToCss(input);
          break;
        case 'image→css':
          this._lastOutput = this._convertImageToCss(input);
          break;
        case 'css→text':
          this._lastOutput = this._convertCssToText(input);
          break;
        case 'object→json':
          this._lastOutput = this._convertObjectToJson(input);
          break;
        case 'json→object':
          this._lastOutput = this._convertJsonToObject(input);
          break;
        default:
          this._lastOutput = this.buildOutput('error', null, { message: '转换失败: 未知模式 ' + mode });
      }
    } catch (e) {
      this._lastOutput = this.buildOutput('error', null, { message: '转换失败: ' + (e.message || String(e)) });
    }

    this.setOutputData(0, this._lastOutput);
  };

  /**
   * text → css：将输入文本包装为 CSS content 属性
   * 输入期望：字符串
   * 输出：{ type: 'css', css: { content: '...' } }
   */
  ConvertNode.prototype._convertTextToCss = function(input) {
    var text = '';

    if (typeof input === 'string') {
      text = input;
    } else if (input.content) {
      text = String(input.content);
    } else if (input.text) {
      text = String(input.text);
    } else if (typeof input === 'object') {
      text = JSON.stringify(input);
    } else {
      text = String(input);
    }

    // 转义引号
    var escaped = text.replace(/"/g, '\\"').replace(/\n/g, '\\A ');
    return this.buildOutput('css', {
      content: '"' + escaped + '"'
    });
  };

  /**
   * color → css：将色值输入转换为 CSS 背景色
   * 输入期望：包含 color 字段的对象，或色值字符串
   * 输出：{ type: 'css', css: { background: '...' } }
   */
  ConvertNode.prototype._convertColorToCss = function(input) {
    var color = '';

    if (typeof input === 'string') {
      color = input;
    } else if (input && input.color) {
      color = input.color;
    } else if (input && input.background) {
      color = input.background;
    } else if (input && input.value) {
      color = input.value;
    } else {
      throw new Error('无法识别色值输入');
    }

    return this.buildOutput('css', {
      background: color
    });
  };

  /**
   * image → css：将图片输入转换为 CSS background-image
   * 输入期望：包含 url / src / image 字段的对象
   * 输出：{ type: 'css', css: { backgroundImage: 'url(...)' } }
   */
  ConvertNode.prototype._convertImageToCss = function(input) {
    var url = '';

    if (typeof input === 'string') {
      // 判断是否为已有 url() 格式
      if (input.indexOf('url(') === 0) {
        url = input;
      } else {
        url = 'url("' + input + '")';
      }
    } else if (input && input.url) {
      url = 'url("' + input.url + '")';
    } else if (input && input.src) {
      url = 'url("' + input.src + '")';
    } else if (input && input.image) {
      url = 'url("' + input.image + '")';
    } else if (input && input.backgroundImage) {
      url = input.backgroundImage;
    } else {
      throw new Error('无法识别图片输入');
    }

    return this.buildOutput('css', {
      backgroundImage: url,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    });
  };

  /**
   * css → text：从 CSS 对象中提取文本内容
   * 输入期望：{ type: 'css', css: { ... } } 或包含 content 属性的对象
   * 输出：{ type: 'text', extra: { content: '...' } }
   */
  ConvertNode.prototype._convertCssToText = function(input) {
    var text = '';

    if (input && input.css) {
      // 从 CSS 属性中提取
      if (input.css.content) {
        text = input.css.content.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"').replace(/\\A /g, '\n');
      } else {
        text = JSON.stringify(input.css);
      }
    } else if (typeof input === 'string') {
      text = input;
    } else if (input && input.content) {
      text = input.content;
    } else if (input && input.text) {
      text = input.text;
    } else {
      text = JSON.stringify(input);
    }

    return this.buildOutput('text', null, {
      content: text
    });
  };

  /**
   * object → json：将 JavaScript 对象序列化为 JSON 字符串
   * 输入期望：任意对象（含数组或基本类型）
   * 输出：{ type: 'text', extra: { json: '{...}' } }
   */
  ConvertNode.prototype._convertObjectToJson = function(input) {
    var jsonStr = JSON.stringify(input, null, 2);
    return this.buildOutput('text', null, {
      json: jsonStr,
      contentType: 'json',
      content: jsonStr
    });
  };

  /**
   * json → object：将 JSON 字符串解析为对象
   * 输入期望：JSON 格式字符串
   * 输出：原对象（直接通过）
   */
  ConvertNode.prototype._convertJsonToObject = function(input) {
    var str = '';

    if (typeof input === 'string') {
      str = input;
    } else if (input && input.json) {
      str = input.json;
    } else if (input && input.content) {
      str = input.content;
    } else if (input && typeof input === 'object') {
      // 已经是对象，直接返回
      return input;
    } else {
      str = String(input);
    }

    var parsed = JSON.parse(str);
    // 如果解析后是基本类型，包装为对象
    if (typeof parsed !== 'object' || parsed === null) {
      return this.buildOutput('text', null, {
        content: String(parsed),
        parsed: true
      });
    }

    // 直接透传解析后的对象，但包装为标准输出格式
    // 对于对象，输出 type 设为 'object'
    return this.buildOutput('object', null, {
      parsed: true,
      value: parsed
    });
  };

  /**
   * 节点内绘制预览 — 显示转换方向箭头和当前模式
   */
  ConvertNode.prototype.onDrawBackground = function(ctx) {
    if (this.flags.collapsed) return;

    var boxW = this.size[0] - 20;
    var boxH = 30;
    var x = 10;
    var y = this.previewY;

    // 浅灰背景
    ctx.fillStyle = '#F5F5F7';
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 6);
    ctx.fill();

    // 模式标签 — 左侧
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var label = this.properties.mode;
    ctx.fillText(label, x + 10, y + boxH / 2);

    // 箭头 — 右侧
    ctx.fillStyle = '#3B82F6';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('→', this.size[0] - 20, y + boxH / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  // 注册节点类型
  LiteGraph.registerNodeType('sill/convert', ConvertNode);

  console.log('[Convert] 转换节点已注册');
})();
