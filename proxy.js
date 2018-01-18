var MiniProxy = require('./MiniProxy')
var fs = require('fs')
var os = require('os')
var argv = require('yargs')
  .default({serverPort: 1080, youtubeProxyPort: 63321})
  .argv

var myProxy = new MiniProxy({
  'port': 9393,
  serverPort: argv.serverPort,
  youtubeProxyPort: argv.youtubeProxyPort,
  'onBeforeRequest': function (requestOptions) {
    console.log('proxy request : ' + (requestOptions.requestAddress || '') + '|' + (requestOptions.path || '') + '|' + (requestOptions.port || ''))
  }
})

myProxy.start()
console.log('proxy start at 9393')

if (os.platform() !== 'win32') {
  var heapdump = require('heapdump')
  heapdump.writeSnapshot(function (err, filename) {
    if (err) console.log(err)
    console.log('dump written to', filename)
  })
}

fs.writeFile(`9393.pid`, process.pid, (err) => {
  if (err) throw err
  console.log('The file has been saved!')
})
