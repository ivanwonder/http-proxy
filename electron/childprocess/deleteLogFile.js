const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

const _path = process.env.logPath // 日志路径
const logExpireTime = 24 * 60 * 60 * 1000

if (_path) {
  fs.readdir(_path, function (err, files) {
    if (err) throw err
    const regFileName = /(\d+)-server\.log/
    let length = files.length
    for (let i = 0; i < length; i++) {
      const fileCreateTime = files[i].match(regFileName)[1]
      if ((new Date()).getTime() - Number(fileCreateTime) > logExpireTime) {
        rimraf(path.join(_path, files[i]), function () {})
      }
    }
  })
}
