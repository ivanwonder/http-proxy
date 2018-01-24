function redueStream (stream, func) {
  let _func = stream.reduceRight((accumulator, currentValue) => {
    return currentValue(accumulator)
  }, func)

  return _func
}

class MyStream {
  constructor () {
    this._streamArray = []
  }

  pipe (args) {
    if (Array.isArray(args)) {
      this._streamArray.concat(args)
    } else if (typeof args === 'function') {
      this._streamArray.push(args)
    } else {
      throw new Error('the args must function or array the ele is function!')
    }

    return this
  }

  on (func) {
    if (typeof func !== 'function') throw new Error('args must be a function!')
    redueStream(this._streamArray, func)()
  }
}

module.exports = MyStream
