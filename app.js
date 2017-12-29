var express = require('express')
var app = express()
var cors = require('cors')
var path = require('path')

var proxy = require('http-proxy-middleware')
var bodyParser = require('body-parser')

const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
// Create database instance and start server
const adapter = new FileAsync('data.json')

const log4js = require('log4js')
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'application.log' }
  },
  categories: {
    default: { appenders: [ 'out', 'app' ], level: 'debug' }
  }
})

const logger = log4js.getLogger()

var event = {
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['access-control-allow-origin'] = '*'
  },
  onProxyReq: function (proxyReq, req, res) {

  }
}

var options = Object.assign({
  // target: 'http://116.76.254.13:9000',
  target: 'http://125.88.98.37:9000',
  // target: 'http://192.168.0.27:8080',
  // target: 'http://192.168.1.82:8183',
  // target: 'http://dev.market.hooray.cn',
  logLevel: 'debug'
}, event)

app.use(express.static(path.join('./static')))
app.use('/tar', express.static(path.join('./tarSource'))) // 托管tar静态文件目录

// 收集错误上报日志
app.use('/log', cors(), bodyParser.urlencoded({ extended: true }), (req, res, next) => {
  logger.debug((req.method.toUpperCase() === 'POST' && req.body) || (req.method.toUpperCase() === 'GET' && req.query))
  res.sendStatus(200)
})

app.use('/**/queryActInfo.do', cors(), function (req, res, next) {
  low(adapter).then(db => {
    res.send(db.get('response').value())
  })
})

app.use('*', cors(), proxy(options))

app.listen(3000)
