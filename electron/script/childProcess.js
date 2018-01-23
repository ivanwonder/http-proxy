var {spawn} = require('child_process')
var {childProcess} = require('../../utils/map')

var spawnPromise = function (command, arg, option, listen) {
  let _res
  let _rej

  const promise = new Promise((resolve, reject) => {
    _res = resolve
    _rej = reject
  })
  const ls = spawn(command, arg, option)
  const id = new Date().getTime()

  ls.on('error', (error) => {
    _rej(error)
  })

  // ls.stdout.on('data', (data) => {
  //   ls.stdin.write(data);
  // })

  ls.on('message', function (message) {
    if (message.success) {
      childProcess.set(id, ls)
      _res(message, id)
    } else if (message.error) {
      _rej(message)
    } else {
      listen(id)
    }
  })

  return promise
}

var execReplaceProxy = function (port) {
  var spawn = require('child_process').spawn
  var sd = spawn('/usr/sbin/networksetup', ['-listallnetworkservices'])
  var grep = spawn('grep', ['Wi-Fi'])
  sd.stdout.on('data', data => {
    grep.stdin.write(data)
  })
  sd.on('close', (code) => {
    if (code !== 0) {
      console.log(`ps process exited with code ${code}`)
    }
    grep.stdin.end()
  })
  grep.stdout.on('data', (data) => {
    var name = data.toString().replace(/\s/g, '')
    var set = spawn('/usr/sbin/networksetup', ['-setautoproxyurl', name, `http://127.0.0.1:${port}/pac`])
    set.on('close', () => {
      spawn('/usr/sbin/networksetup', ['-setautoproxystate', name, 'on'])
    })
    set.stderr.on('data', () => {
      console.log(`ps stderr: ${data}`)
    })
  })

  grep.on('close', (code) => {
    if (code !== 0) {
      console.log(`grep process exited with code ${code}`)
    }
  })
}

module.exports = {
  spawnPromise,
  execReplaceProxy
}
