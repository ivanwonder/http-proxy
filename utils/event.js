const EventEmitter = require('events')

module.exports = {
  mainWindowMessage: new EventEmitter(),
  proxyServerEvent: new EventEmitter()
}
