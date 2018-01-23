const {childProcess} = require('../utils/map')
const path = require('path')
const {app} = require('electron')
const {_isWindows, _buildByWebpack} = require('../utils/platform')

function openProxy (args, listen) {
  let _rej
  let _res
  const _promise = new Promise((resolve, reject) => {
    _rej = reject
    _res = resolve
  })

  const fork = require('child_process').fork
  const _ls = fork(path.join(_buildByWebpack ? app.getAppPath() : path.join(__dirname, '../'), './openProxy.js'), [], {
    detached: !!_isWindows
  })
  const id = new Date().getTime()

  _ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
    _rej({error: code})
  })

  _ls.on('error', function (e) {
    console.log('error: ' + e)
    _rej({error: e})
  })

  _ls.on('message', function (message) {
    if (message.success) {
      childProcess.set(id, _ls)
      _res(message, id)
    } else if (message.error) {
      _rej(message)
    } else {
      listen(id)
    }
  })

  _ls.send({ open: {
    port: args.port,
    proxyPort: args.proxyPort,
    youtubeProxyPort: args.youtubeProxyPort,
    id
  } })

  return _promise
}

module.exports = openProxy
