
var _isWindows
var _isMacintosh
var _isLinux
var _isRootUser
if (typeof process === 'object') {
  _isWindows = (process.platform === 'win32')
  _isMacintosh = (process.platform === 'darwin')
  _isLinux = (process.platform === 'linux')
  _isRootUser = !_isWindows && (process.getuid() === 0)
}

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

module.exports = {
  _isLinux,
  _isMacintosh,
  _isRootUser,
  _isWindows,
  isProd
}
