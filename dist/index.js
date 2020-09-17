'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * cainiao-print
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * MIT License
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * By asseek
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://open.taobao.com/doc.htm?docId=107014&docType=1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _socket = require('./socket.js');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CainiaoPrint = function () {
  function CainiaoPrint() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$version = _ref.version,
        version = _ref$version === undefined ? '1.0' : _ref$version,
        _ref$httpUrl = _ref.httpUrl,
        httpUrl = _ref$httpUrl === undefined ? 'ws://localhost:13528' : _ref$httpUrl,
        _ref$httpsUrl = _ref.httpsUrl,
        httpsUrl = _ref$httpsUrl === undefined ? 'wss://localhost:13529' : _ref$httpsUrl,
        _ref$isHttps = _ref.isHttps,
        isHttps = _ref$isHttps === undefined ? 'https:' === document.location.protocol : _ref$isHttps,
        _ref$reconnectInterva = _ref.reconnectInterval,
        reconnectInterval = _ref$reconnectInterva === undefined ? 2000 : _ref$reconnectInterva;

    _classCallCheck(this, CainiaoPrint);

    var socket = new _socket2.default(isHttps ? httpsUrl : httpUrl, { reconnectInterval: reconnectInterval });

    socket.addEventListener('open', function () {
      _this.startRequest();
    });

    socket.addEventListener('close', function () {
      _this.$requestQueue.forEach(function (req) {
        req.start = false;
      });
    });

    socket.addEventListener('message', function (event) {
      var response = eval('(' + event.data + ')');

      var index = _this.$requestQueue.findIndex(function (req) {
        return req.request.requestID === response.requestID;
      });
      if (index > -1) {
        _this.$requestQueue[index].resolve(response);
        _this.$requestQueue.splice(index, 1);
      }

      if (response.cmd === 'notifyPrintResult') {
        _this.$notifyPrintResult.forEach(function (callback) {
          callback(response);
        });
      }
    });

    this.socket = socket;
    this.version = version;
    this.$requestQueue = [];
    this.$notifyPrintResult = [];
  }

  /**
   * 取打印机列表
   * @returns {Promise<{defaultPrinter: string, printers: Array}>}
   */


  _createClass(CainiaoPrint, [{
    key: 'getPrinters',
    value: function getPrinters() {
      return this.request({ cmd: 'getPrinters' });
    }

    /**
     * 获取打印机配置
     * @param printer: string 打印机名称
     * @returns {Promise<{printer: {}}>}
     */

  }, {
    key: 'getPrinterConfig',
    value: function getPrinterConfig(printer) {
      return this.request({ cmd: 'getPrinters', printer: printer });
    }

    /**
     * 设置打印机配置
     * @param printer
     * @returns {Promise<{}>}
     */

  }, {
    key: 'setPrinterConfig',
    value: function setPrinterConfig(printer) {
      return this.request({ cmd: 'setPrinterConfig', printer: printer });
    }

    /**
     * 发送打印/预览数据协议
     * @param task
     * @returns {Promise<{taskID, status, previewURL, previewImage}>}
     */

  }, {
    key: 'print',
    value: function print(task) {
      return this.request({ cmd: 'print', task: task });
    }

    /**
     * 监听打印通知
     * @param callback: function ({printer, taskID, taskStatus, printStatus})=>{ }
     */

  }, {
    key: 'notifyPrintResult',
    value: function notifyPrintResult(callback) {
      if (typeof callback === 'function' && !this.$notifyPrintResult.includes(callback)) {
        this.$notifyPrintResult.push(callback);
      }
    }

    /**
     * 获取任务打印任务状态
     * @param taskID : array
     * @returns {Promise<{printStatus: []}>}
     */

  }, {
    key: 'getTaskStatus',
    value: function getTaskStatus(taskID) {
      return this.request({ cmd: 'getTaskStatus', taskID: taskID });
    }

    /**
     * 获取全局配置
     * @returns {Promise<{notifyOnTaskFailure: boolean 打印任务失败时是否需要通知}>}
     */

  }, {
    key: 'getGlobalConfig',
    value: function getGlobalConfig() {
      return this.request({ cmd: 'getGlobalConfig' });
    }

    /**
     * 设置全局配置
     * @param notifyOnTaskFailure
     * @returns {Promise<{status}>}
     */

  }, {
    key: 'setGlobalConfig',
    value: function setGlobalConfig(_ref2) {
      var notifyOnTaskFailure = _ref2.notifyOnTaskFailure;

      return this.request({ cmd: 'setGlobalConfig', notifyOnTaskFailure: notifyOnTaskFailure });
    }

    /**
     * 获取客户端版本信息
     * @returns {Promise<{version}>}
     */

  }, {
    key: 'getAgentInfo',
    value: function getAgentInfo() {
      return this.request({ cmd: 'getAgentInfo' });
    }

    /**
     * 统一请求入口
     * @param params : object {cmd, ...}
     * @returns {Promise<{}>}
     */

  }, {
    key: 'request',
    value: function request(params) {
      var _this2 = this;

      return new Promise(function (resolve) {
        _this2.$requestQueue.push({
          request: _extends({
            requestID: new Date().getTime() + ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1),
            version: _this2.version
          }, params),
          resolve: resolve,
          start: false
        });
        _this2.startRequest();
      });
    }

    /**
     * 请求发送
     */

  }, {
    key: 'startRequest',
    value: function startRequest() {
      var socket = this.socket,
          $requestQueue = this.$requestQueue;

      if (socket.readyState === WebSocket.OPEN && $requestQueue.length) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = $requestQueue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var req = _step.value;

            if (!req.start) {
              socket.send(JSON.stringify(req.request));
              req.start = true;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }]);

  return CainiaoPrint;
}();

exports.default = CainiaoPrint;