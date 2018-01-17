var MiniProxy = require('./MiniProxy')

var myProxy = new MiniProxy({
  'port': 9393,
  'onBeforeRequest': function (requestOptions) {
    console.log('proxy request : ' + (requestOptions.requestAddress || '') + '|' + (requestOptions.path || ''))
  }
})

myProxy.start()
console.log('proxy start at 9393')
