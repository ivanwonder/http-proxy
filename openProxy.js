const MiniProxy = require('./MiniProxy')

// var myProxy = new MiniProxy({
//   'port': 9394,
//   serverPort: 60447,
//   youtubeProxyPort: 60447,
//   'onBeforeRequest': function (requestOptions) {
//     console.log('proxy request : ' + (new Date()).toLocaleString() + '|' + (requestOptions.requestAddress || '') + '|' + (requestOptions.path || '') + '|' + (requestOptions.port || ''))
//   }
// })

// myProxy.start()

process.on('message', (m) => {
  const config = m.open
  if (config) {
    var myProxy = new MiniProxy({
      'port': config.port,
      serverPort: config.proxyPort,
      youtubeProxyPort: config.youtubeProxyPort,
      'onBeforeRequest': function (requestOptions) {
        console.log('proxy request : ' + (new Date()).toLocaleString() + '|' + (requestOptions.requestAddress || '') + '|' + (requestOptions.path || '') + '|' + (requestOptions.port || ''))
      },
      'onServerError': function (e) {
        process.send({ error: e.message })
      },
      'onListening': function () {
        process.send({success: 1})
      }
    })

    myProxy.start()
  }
})
