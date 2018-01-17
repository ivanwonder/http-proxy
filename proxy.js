var heapdump = require('heapdump')
var MiniProxy = require('./MiniProxy')
var fs = require('fs')
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
heapdump.writeSnapshot(function (err, filename) {
  if (err) console.log(err)
  console.log('dump written to', filename)
})

fs.writeFile(`9393.pid`, process.pid, (err) => {
  if (err) throw err
  console.log('The file has been saved!')
})
