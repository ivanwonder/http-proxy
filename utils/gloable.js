const MyStream = require('./MyStream')

const quitStream = new MyStream()
const quitStreamFuncMap = new Map()

global.beforeQuitEvent = {
  register: function (args, id) {
    quitStream.pipe(args)
    id && quitStreamFuncMap.set(id, args)
  },
  on: function (func) {
    quitStream.on(func)
  },
  remove: function (id) {
    const func = quitStreamFuncMap.get(id)
    quitStream.remove(func)
    quitStreamFuncMap.delete(id)
  }
}
