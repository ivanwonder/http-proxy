var http = require('http')
var url = require('url')
var fs = require('fs')
var port

function MiniProxy (options) {
  this.port = options.port || 9393
  this.onServerError = options.onServerError || function () {}
  this.onBeforeRequest = options.onBeforeRequest || function () {}
  this.onBeforeResponse = options.onBeforeResponse || function () {}
  this.onRequestError = options.onRequestError || function () {}
}
MiniProxy.prototype.start = function () {
  var server = http.createServer()

  server.on('request', this.requestHandler)
  server.on('connect', this.connectHandler)

  server.on('error', this.onServerError)
  server.on('beforeRequest', this.onBeforeRequest)
  server.on('beforeResponse', this.onBeforeResponse)
  server.on('requestError', this.onRequestError)

  server.listen(this.port)
  port = this.port
}

MiniProxy.prototype.requestHandler = function (req, res) {
  try {
    var self = this // this -> server
    var path = req.headers.path || url.parse(req.url).path
    var requestOptions = {
      host: req.headers.host.split(':')[0],
      port: req.headers.host.split(':')[1] || 80,
      path: path,
      method: req.method,
      headers: req.headers
    }

    // check if pac.txt exist
    if (requestOptions.method.toLocaleLowerCase() === 'get' && requestOptions.port === (port + '') && requestOptions.path === '/pac') {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      })
      fs.readFile('./pac', 'UTF-8', function (err, data) {
        if (err) throw err
        res.write(data)
        res.end()
      })
      return
    }

    // u can change request param here
    self.emit('beforeRequest', requestOptions)
    requestRemote(requestOptions, req, res, self)
  } catch (e) {
    console.log('requestHandlerError' + e.message)
  }

  function requestRemote (requestOptions, req, res, proxy) {
    var remoteRequest = http.request(requestOptions, function (remoteResponse) {
      remoteResponse.headers['proxy-agent'] = 'Easy Proxy 1.0'

      // write out headers to handle redirects
      res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers)

      // u can change resonse here
      proxy.emit('beforeResponse', remoteResponse)
      remoteResponse.pipe(res)
      // Res could not write, but it could close connection
      res.pipe(remoteResponse)
    })

    remoteRequest.on('error', function (e) {
      proxy.emit('requestError', e, req, res)

      res.writeHead(502, 'Proxy fetch failed')
      //            res.end();
      //            remoteRequest.end();
    })

    req.pipe(remoteRequest)

    // Just in case if socket will be shutdown before http.request will connect
    // to the server.
    res.on('close', function () {
      remoteRequest.abort()
    })
  }
}

MiniProxy.prototype.connectHandler = function (req, socket, head) {
  function ontargeterror (e) {
    console.log(req.url + ' Tunnel error: ' + e)
    _synReply(socket, 502, 'Tunnel Error', {}, function () {
      try {
        socket.end()
      } catch (e) {
        console.log('end error' + e.message)
      }
    })
  }

  function connectRemote (requestOptions, socket) {
    const reqProxy = http.request(requestOptions)
    reqProxy.end()

    reqProxy.on('connect', (res, socketProxy, head) => {
      _synReply(socket, 200, 'Connection established', {
        'Connection': 'keep-alive',
        'Proxy-Agent': 'Easy Proxy 1.0'
      },
      function (error) {
        if (error) {
          console.log('syn error', error.message)
          socketProxy.end()
          socket.end()
          return
        }
        socketProxy.pipe(socket)
        socket.pipe(socketProxy)

        socket.on('end', () => {
          console.log(req.url + ' socket end')
        })
        socketProxy.on('end', () => {
          console.log(req.url + ' socketProxy end')
        })
      })
    })
    reqProxy.on('error', ontargeterror)
  }

  try {
    var self = this

    var requestOptions = {
      port: 1080,
      hostname: '127.0.0.1',
      method: 'CONNECT',
      path: req.url
    }

    self.emit('beforeRequest', requestOptions)
    connectRemote(requestOptions, socket)
  } catch (e) {
    console.log('connectHandler error: ' + e.message)
  }
}

function _synReply (socket, code, reason, headers, cb) {
  try {
    var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n'
    var headerLines = ''
    for (var key in headers) {
      headerLines += key + ': ' + headers[key] + '\r\n'
    }
    socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb)
  } catch (error) {
    cb(error)
  }
}

module.exports = MiniProxy