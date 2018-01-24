const MyStream = require('./MyStream')

const quitStream = new MyStream()
global.beforeQuitEvent = {
  register: function (args) {
    quitStream.pipe(args)
  },
  on: function (func) {
    quitStream.on(func)
  }
}
