'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Socket
 * MIT License
 * By asseek
 * 只为解决WebSocket不能断线重连而设计，没有完全兼容WebSocket属性方法
 */
var Socket = function () {
  function Socket(url) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$reconnectInterva = _ref.reconnectInterval,
        reconnectInterval = _ref$reconnectInterva === undefined ? 2000 : _ref$reconnectInterva;

    _classCallCheck(this, Socket);

    this.url = url;
    this.ws = null;
    this.reconnectInterval = reconnectInterval;
    this.$events = {
      open: [],
      message: [],
      error: [],
      close: []
    };
    this.connect();
  }

  _createClass(Socket, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      if (!this.ws) {
        var ws = new WebSocket(this.url);
        ws.onopen = function (e) {
          _this.dispatchEvent('open', e);
        };
        ws.onmessage = function (e) {
          _this.dispatchEvent('message', e);
        };
        ws.onerror = function (e) {
          _this.dispatchEvent('error', e);
          if (_this.ws === ws) {
            _this.ws = null;
            _this.reconnect();
          }
        };
        ws.onclose = function (e) {
          _this.dispatchEvent('close', e);
          if (_this.ws === ws) {
            _this.ws = null;
            _this.reconnect();
          }
        };
        this.ws = ws;
      }
    }
  }, {
    key: 'reconnect',
    value: function reconnect() {
      var _this2 = this;

      var ws = this.ws,
          reconnectInterval = this.reconnectInterval;

      if (!ws) {
        setTimeout(function () {
          _this2.connect();
        }, reconnectInterval);
      }
    }
  }, {
    key: 'send',
    value: function send(data) {
      var ws = this.ws;

      if (ws) {
        return ws.send(data);
      } else {
        throw 'ERR : reconnect websocket';
      }
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(type, callback) {
      if (typeof callback === 'function' && this.$events[type] && !this.$events[type].includes(callback)) {
        this.$events[type].push(callback);
      }
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, callback) {
      var index = (this.$events[type] || []).indexOf(callback);
      if (index > -1) {
        this.$events[type].splice(index, 1);
      }
    }
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(type, event) {
      var method = 'on' + type;
      if (typeof this[method] === 'function') this[method](event);

      var callbacks = this.$events[type] || [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var callback = _step.value;

          callback(event);
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
  }, {
    key: 'readyState',
    get: function get() {
      return this.ws ? this.ws.readyState : WebSocket.CLOSED;
    }
  }]);

  return Socket;
}();

exports.default = Socket;