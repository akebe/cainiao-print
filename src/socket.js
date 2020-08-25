/**
 * Socket
 * MIT License
 * By asseek
 * 只为解决WebSocket不能断线重连而设计，没有完全兼容WebSocket属性方法
 */
class Socket {

  constructor(url, {reconnectInterval = 2000} = {}) {
    this.url = url;
    this.ws = null;
    this.reconnectInterval = reconnectInterval;
    this.$events = {
      open: [],
      message: [],
      error: [],
      close: [],
    };
    this.connect();
  }

  connect() {
    if (!this.ws) {
      const ws = new WebSocket(this.url);
      ws.onopen = e => {
        this.dispatchEvent('open', e);
      };
      ws.onmessage = e => {
        this.dispatchEvent('message', e);
      };
      ws.onerror = e => {
        this.dispatchEvent('error', e);
        if (this.ws === ws) {
          this.ws = null;
          this.reconnect();
        }
      };
      ws.onclose = e => {
        this.dispatchEvent('close', e);
        if (this.ws === ws) {
          this.ws = null;
          this.reconnect();
        }
      };
      this.ws = ws;
    }
  }

  reconnect() {
    const {ws, reconnectInterval} = this;
    if (!ws) {
      setTimeout(() => {
        this.connect();
      }, reconnectInterval);
    }
  }

  send(data) {
    const {ws} = this;
    if (ws) {
      return ws.send(data);
    } else {
      throw 'ERR : reconnect websocket';
    }
  }

  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  addEventListener(type, callback) {
    if (typeof callback === 'function' && this.$events[type] && !this.$events[type].includes(callback)) {
      this.$events[type].push(callback);
    }
  }

  removeEventListener(type, callback) {
    const index = (this.$events[type] || []).indexOf(callback);
    if (index > -1) {
      this.$events[type].splice(index, 1);
    }
  }

  dispatchEvent(type, event) {
    const method = `on${type}`;
    if (typeof this[method] === 'function') this[method](event);

    const callbacks = this.$events[type] || [];
    for (const callback of callbacks) {
      callback(event);
    }
  }
}

export default Socket;
