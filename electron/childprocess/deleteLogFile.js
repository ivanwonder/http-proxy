const fs = require('fs')
const path = require('path')

const _path = process.env.logPath
console.log(_path)
if (_path) {
  fs.readdir(_path, function (err, files) {
    console.log(err)
    if (err) throw err
    console.log(_path)
  })
}
