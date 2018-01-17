var MiniProxy = require('./MiniProxy')
var argv = require('yargs')
  .default({serverPort: 1080})
  .argv

var myProxy = new MiniProxy({
  'port': 9393,
  serverPort: argv.serverPort,
  'onBeforeRequest': function (requestOptions) {
    console.log('proxy request : ' + (requestOptions.requestAddress || '') + '|' + (requestOptions.path || ''))
  }
})

myProxy.start()
console.log('proxy start at 9393')
