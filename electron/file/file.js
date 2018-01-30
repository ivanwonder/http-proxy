const fs = require('fs')
const settings = require('electron-settings')
const parameter = require('../../utils/parameter').setting
const path = require('path')
const {_buildByWebpack} = require('../../utils/platform')

class MyFile {
  constructor (id) {
    const fileName = path.join(MyFile.path, `./${id}-server.log`)
    let fileArray = settings.get(parameter.logFile, [])
    fileArray.push(path.resolve(fileName))
    settings.set(parameter.logFile, fileArray)

    this.writeAble = fs.createWriteStream(fileName)
  }

  close () {
    this.writeAble.close()
  }
}

MyFile.getAllLogFile = function () {
  return settings.get(parameter.logFile)
}

MyFile.getLogFileById = function (id) {

}

MyFile.path = path.join(_buildByWebpack ? require('electron').app.getAppPath() : path.resolve(), 'log')

module.exports = MyFile
