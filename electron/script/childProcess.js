var {spawn} = require('child_process')
var {childProcess} = require('../../utils/map')
const {_isWindows} = require('../../utils/platform')

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
    set.stderr.on('data', (data) => {
      console.log(`ps stderr: ${data}`)
    })
  })

  grep.on('close', (code) => {
    if (code !== 0) {
      console.log(`grep process exited with code ${code}`)
    }
  })
}

var execReplaceProxyOnWindow = function (port, close, listen) {
  let _spawn = spawn
  spawn = function (command, args, options) {
    let _option = {shell: true}
    // if (close) _option.detached = true
    return _spawn(command, args, options || _option)
  }

  function getArgs () {
    return ['add', '"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"', '/v', 'ProxyEnable', '/t', 'REG_DWORD', '/d', '0', '/f']
  }

  let _args = getArgs()

  if (!close) {
    var enableProxy = spawn('reg', _args)
    enableProxy.stderr.on('data', function (data) {
      console.log(`ps stderr: ${data}`)
    })

    enableProxy.on('close', function () {
      console.log('close')
    })
  }

  _args = getArgs()
  _args[3] = 'AutoConfigURL'
  if (close) {
    _args[0] = 'delete'
    _args.splice(4, 4)
  } else {
    // _args[3] = 'AutoConfigURL'
    _args[7] = `"http://127.0.0.1:${port}/pac"`
    _args.splice(4, 2)
  }
  const setPacConfig = spawn('reg', _args)
  setPacConfig.on('close', function () {
    console.log('close')
    listen && listen()
  })

  if (!close) {
    _args = getArgs()
    _args[3] = 'ProxyOverride'
    _args[5] = 'REG_SZ'
    _args[7] = '""'
    spawn('reg', _args)
  }
}

var getScriptOfSetPacURL = function (port) {
  return _isWindows ? `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /d "http://127.0.0.1:${port}/pac" /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyOverride /t REG_SZ /d "" /f` : ''
}

var getScriptOfDeletePacURL = function () {
  return _isWindows ? `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /f` : ''
}

function waitForChildProcessClose (cp) {
  return new Promise((resolve, reject) => {
    cp.on('close', (code) => {
      resolve(code)
    })
    cp.on('error', e => {
      reject(e)
    })
    cp.kill()
  })
}

module.exports = {
  spawnPromise,
  execReplaceProxy,
  execReplaceProxyOnWindow,
  getScriptOfSetPacURL,
  getScriptOfDeletePacURL,
  waitForChildProcessClose
}
