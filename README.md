#CainiaoPrint
菜鸟云打印交互模块  
根据文档实现 [https://open.taobao.com/doc.htm?docId=107014&docType=1](https://open.taobao.com/doc.htm?docId=107014&docType=1)  

##安装
```
npm install cainiao-print --save
```
##使用
```
import CainiaoPrint from 'cainiao-print';

const cainiao = new CainiaoPrint();  // 可选`constructor options`参见下面对象，默认留空即可

// 监听打印通知
cainiao.notifyPrintResult(response => {
 
});

// 获取打印机列表
cainiao.getPrinters().then(({defaultPrinter, printers}) => {
  console.log(defaultPrinter);    // 默认打印机
  console.log(printers);          // 打印机列表
});
```
###连接状态与监听
可以通过`cainiao.socket.readyState`判断与云打印的连接状态，参见[MDN WebSocket/readyState](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket/readyState)  
通过监听连接状态
```
cainiao.socket.addEventListener('open', () => {
  // 连接成功
});

cainiao.socket.addEventListener('close', () => {
  // 连接中断
});
```

##方法 
本模块将文档内提供的所有方法均封装成`Promise`，以便统一调用，如果连接中断，会一直`pending`等到连接上云打印客户端再发送请求
### cainiao.request(params) 统一请求入口
根据请求协议格式直接调用此方法发送请求，`requestID`,`version`可省略，下面代码以`getPrinters`举例
```
cainiao.request({cmd: 'getPrinters'}).then(response => {

});
```
### 1. cainiao.getPrinters() 获取打印机列表
```
cainiao.getPrinters().then(response => {
/*
  response = {
    'cmd': 'getPrinters',
    'requestID': '123456789',
    'defaultPrinter': 'XX快递打印机',
    'printers': [
      {'name': 'XX快递打印机'},
      {'name': 'YY物流打印机'},
    ],
  };
*/
});
```
### 2. cainiao.getPrinterConfig(printer) 获取打印机配置
```
cainiao.getPrinterConfig("打印机名称").then(response => {
/*
  response = {
    'cmd': 'getPrinterConfig',
    'requestID': '123456789',
    'status': 'success/failed',
    'msg': '如果出错，错误原因',
    'printer': {
      'name': '打印机名称',
      'needTopLogo': false,
      'needBottomLogo': false,
      'horizontalOffset': 1,
      'verticalOffset': 2,
      'forceNoPageMargins': true,
      'autoPageSize': false,
      'orientation': 0,
      'autoOrientation': false,
      'paperSize': {
        'width': 100,
        'height': 180,
      },
    },
  };
*/
});
```
### 3. cainiao.setPrinterConfig(printer) 设置打印机配置
`printer`对象参见上面`cainiao.getPrinterConfig`的`response.printer`
```
cainiao.setPrinterConfig(printer).then(response => {
/*
  response = {
    'cmd': 'setPrinterConfig',
    'requestID': '123456789',
    'status': 'success/failed',
    'msg': '如果成功，则为空;如果失败，则为失败原因',
    },
  };
*/
});
```
### 4. cainiao.print(task)  发送打印/预览数据
这个回调在数据发送给云打印客户端后触发，打印结果需要通过`cainiao.notifyPrintResult`监听通知  
```
cainiao.print(task).then(response => {
/*
  response = {
    'cmd': 'print',
    'requestID': '123458976',
    'taskID': '1',
    'status': 'success', //如果是打印，表示打印任务提交成功，如果是预览，表示预览PDF文件生成成功
    'previewURL': 'http://127.0.0.1/previewxxx.pdf', //如果是预览，会返回这个属性，表示预览PDF文件的URL地址，如果是打印命令，不返回此属性
    'previewImage': [   //如果是预览并且预览模式是previewType:image，会返回这个属性，表示预览图片的URL地址，如果是打印命令，不返回此属性
      'http://127.0.0.1/preview1.jpg',
      'http://127.0.0.1/preview2.jpg',
      'http://127.0.0.1/preview3.jpg',
    ],
  };
*/
});
```
`task` 请求数据格式（密文数据，针对菜鸟电子面单）如下:
```
{
  'taskID': '7293666',
  'preview': false,
  'printer': '',
  'previewType': 'pdf',
  'firstDocumentNumber': 10,
  'totalDocumentCount': 100,
  'documents': [{
    'documentID': '0123456789',
    'contents': [{
      'encryptedData': 'AES:rU904rj6UH2oqfSUb43+Z+XlOkZaULeerkScS5xbmfjZC78uvsMTa3g6l33hRAz/srsk0TObjJaJI5n4tAPV1uv7szIPQGPDhwD6MK+zvTVIfuQCMC8p+cUB5S4FmqDhNE45LRVAlaoaI5YK8QmWK1WorhwnPxOFH4Ws/ApobtzDLDJaW6uu1AMEdAejEhRTWL3B1fRhhcDxc3gX+DZF9jJUB++fb9JZqmocWRu0Fvi/b1BokQx7Xt/N+FpJVRI0//NNUQ9b/W4tqGFIbf2IM/Ez1S5hBru5gKGdFzs99ZgCKqtWa0DnOzrZDXroU1mhurtlulE8QbipInu63fkIwn3h9ZSK0sMyV5Jrk5x3MIJDHeW9pc/Tw4TnKTAU134jl+GbbpYysa0+jBARWRjombeKIFSVfp/zgp15jClClUU1Nz4alTi22LimY2qteQRG6G/rCHiYxPoBRdrtqZZxNSdnKG5yjSdtA2CEL1DJNg1QkFVSSsOuqcHLdrKl6oMR+aUN6wM3GQikmKSU/CH4hWCCXxFaJXvBYoSxZ63GrM/d+l6D4+9+rCxHJoEVsa2E1TMHLUOnN6CweSM+45lcBK19bbCUJDyky6nb1NbxrZGYhmfkrNzE2GN+Cz4iTAgxJlQxd1gVvS4v5nB7qNfb0Uhy9NTopdumxOS7NXFFg3RFdBfAJ0nLGnxECUvUihBC3pwsLGimrUnIF4174m6J6Ga6cQE+Pp1LXgtKf5zWJdWHkm2vQhazcAsQC8JJZFb1ESp1vIAvpy0d0YmGrLLzxWNciHlOa7vguFCVF3UbTFe8r1Mxyym9rqNrZDXWRtBija9yeliMERVFuOTRjlc0PVAzveexQmuD4ESTzMZPtbO0jos1EITKhHcV35Na7E4I7bEe3L2u5yuFuzDA5cc8OA8v761+xOI70bGXUwvFO2kCCiUFEzI9ksLIDTtydBTA94lf4MYH6m0ziRmAhAgcwm5QJFd2G4JzpFIK4+dLuEZamrYUcnHmWzDIg+HYIXh6g3S2maFU7dUtwYoerptOTiVg8FxRlUTx30NDTgjm7ll8vEJXHj7yd/gAO3Vm9P54OSMv8w+pzX3gtCkvthrkjlToT1jMRNJyuJAeSBf5jruzYLS68inlSE/ehT10zhaiBvaCqojZZ2Ux0JQGhbR/nQ==',
      'signature': '19d6f7759487e556ddcdd3d499af087080403277b7deed1a951cc3d9a93c42a7e22ccba94ff609976c5d3ceb069b641f541bc9906098438d362cae002dfd823a8654b2b4f655e96317d7f60eef1372bb983a4e3174cc8d321668c49068071eaea873071ed683dd24810e51afc0bc925b7a2445fdbc2034cdffb12cb4719ca6b7',
      'templateURL': 'http://cloudprint.cainiao.com/template/standard/101/123',
      'ver': 'waybill_print_secret_version_1',
    },
      {
        'data': {
          'value': '测试字段值需要配合自定义区变量名',
        },
        'templateURL': 'http://cloudprint.cainiao.com/template/customArea/440439',
      }],
  }],
}
```
`task` 请求数据格式（明文数据）如下:
```
{
  'taskID': '7293666',
  'preview': false,
  'printer': '',
  'previewType': 'pdf',
  'firstDocumentNumber': 10,
  'totalDocumentCount': 100,
  'documents': [{
    'documentID': '0123456789',
    'contents': [{
      'data': {
        'nick': '张三',
      },
      'templateURL': 'http://cloudprint.cainiao.com/template/standard/278250/1',
    }],
  }],
}
```
### 5. cainiao.notifyPrintResult(callback)  打印通知
```
cainiao.notifyPrintResult(response => {
/*
  response = {
    'cmd': 'notifyPrintResult',
    'printer': '中通打印机A',
    'taskID': '1',
    'taskStatus': 'printed',
    'printStatus': [
      {
        'documentID': '9890000112011',
        'status': 'success',
        'msg': 'if failed,some tips, if success ,nothing',
        'detail': '错误信息的补充描述',
      },
    ],
  };
*/
});
```
### 6. cainiao.getTaskStatus(taskID) 获取任务打印任务状态
```
cainiao.getTaskStatus(['12311', '12312']).then(response => {
/*
  response = {
    'cmd': 'getTaskStatus',
    'requestID': '123458976',
    'printStatus': [
      {
        'taskID': '12312',
        'detailStatus': [
          {
            'documentID': '9890000112011',
            'status': 'success',
            'msg': 'if failed ,some tips, if success or pending nothing',
            'printer': '中通打印机A',
          },
        ],
      },
    ],
  };
*/
});
```
### 7. cainiao.getGlobalConfig() 获取全局配置
```
cainiao.getGlobalConfig().then(response => {
/*
  response = {
    'cmd': 'getGlobalConfig',
    'requestID': '123458976',
    'status': 'success',
    'msg': 'return nothing when success, return some tips when failed',
    'notifyOnTaskFailure': true, // 打印任务失败时是否需要通知
  };
*/
});
```
### 8. cainiao.setGlobalConfig(options) 设置全局配置
```
cainiao.setGlobalConfig({notifyOnTaskFailure: true}).then(response => {
/*
  response = {
    'cmd': 'setGlobalConfig',
    'requestID': '123458976',
    'status': 'success',
    'msg': 'return nothing when success, return some tips when failed',
  };
*/
});
```
### 9. cainiao.getAgentInfo() 获取客户端版本信息
```
cainiao.getAgentInfo().then(response => {
/*
  response = {
    'cmd': 'getAgentInfo',
    'requestID': '123458976',
    'status': 'success',
    'msg': 'return nothing when success, return some tips when failed',
    'version': '0.2.8.3',
  };
*/
});
```

constructor options
```
{
  version = '1.0',
  httpUrl = 'ws://localhost:13528',
  httpsUrl = 'wss://localhost:13529',
  isHttps = 'https:' === document.location.protocol,
}
```


