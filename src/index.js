/**
 * cainiao-print
 * MIT License
 * By asseek
 * https://open.taobao.com/doc.htm?docId=107014&docType=1
 */
import Socket from './socket.js';

class CainiaoPrint {

  constructor(
    {
      version = '1.0',
      httpUrl = 'ws://localhost:13528',
      httpsUrl = 'wss://localhost:13529',
      isHttps = 'https:' === document.location.protocol,
      reconnectInterval = 2000,
    } = {}) {
    const socket = new Socket(isHttps ? httpsUrl : httpUrl, {reconnectInterval});

    socket.addEventListener('open', () => {
      this.startRequest();
    });

    socket.addEventListener('close', () => {
      this.$requestQueue.forEach(req => {
        req.start = false;
      });
    });

    socket.addEventListener('message', event => {
      const response = eval(`(${event.data})`);

      const index = this.$requestQueue.findIndex(req => req.request.requestID === response.requestID);
      if (index > -1) {
        this.$requestQueue[index].resolve(response);
        this.$requestQueue.splice(index, 1);
      }

      if (response.cmd === 'notifyPrintResult') {
        this.$notifyPrintResult.forEach(callback => {
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
  getPrinters() {
    return this.request({cmd: 'getPrinters'});
  }

  /**
   * 获取打印机配置
   * @param printer: string 打印机名称
   * @returns {Promise<{printer: {}}>}
   */
  getPrinterConfig(printer) {
    return this.request({cmd: 'getPrinters', printer});
  }

  /**
   * 设置打印机配置
   * @param printer
   * @returns {Promise<{}>}
   */
  setPrinterConfig(printer) {
    return this.request({cmd: 'setPrinterConfig', printer});
  }

  /**
   * 发送打印/预览数据协议
   * @param task
   * @returns {Promise<{taskID, status, previewURL, previewImage}>}
   */
  print(task) {
    return this.request({cmd: 'print', task});
  }

  /**
   * 监听打印通知
   * @param callback: function ({printer, taskID, taskStatus, printStatus})=>{ }
   */
  notifyPrintResult(callback) {
    if (typeof callback === 'function' && !this.$notifyPrintResult.includes(callback)) {
      this.$notifyPrintResult.push(callback);
    }
  }

  /**
   * 获取任务打印任务状态
   * @param taskID : array
   * @returns {Promise<{printStatus: []}>}
   */
  getTaskStatus(taskID) {
    return this.request({cmd: 'getTaskStatus', taskID});
  }

  /**
   * 获取全局配置
   * @returns {Promise<{notifyOnTaskFailure: boolean 打印任务失败时是否需要通知}>}
   */
  getGlobalConfig() {
    return this.request({cmd: 'getGlobalConfig'});
  }

  /**
   * 设置全局配置
   * @param notifyOnTaskFailure
   * @returns {Promise<{status}>}
   */
  setGlobalConfig({notifyOnTaskFailure}) {
    return this.request({cmd: 'setGlobalConfig', notifyOnTaskFailure});
  }

  /**
   * 获取客户端版本信息
   * @returns {Promise<{version}>}
   */
  getAgentInfo() {
    return this.request({cmd: 'getAgentInfo'});
  }

  /**
   * 统一请求入口
   * @param params : object {cmd, ...}
   * @returns {Promise<{}>}
   */
  request(params) {
    return new Promise((resolve => {
      this.$requestQueue.push({
        request: {
          requestID: new Date().getTime() + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
          version: this.version,
          ...params,
        },
        resolve,
        start: false,
      });
      this.startRequest();
    }));
  }

  /**
   * 请求发送
   */
  startRequest() {
    const {socket, $requestQueue} = this;
    if (socket.readyState === WebSocket.OPEN && $requestQueue.length) {
      for (const req of $requestQueue) {
        if (!req.start) {
          socket.send(JSON.stringify(req.request));
          req.start = true;
        }
      }
    }
  }
}

export default CainiaoPrint;
