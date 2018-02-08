var { getOptions } = require('loader-utils')
var validateOptions = require('schema-utils')

const schema = {
  type: 'object',
  properties: {
    test: {
      type: 'string'
    }
  }
}

module.exports = function (source) {
  const options = getOptions(this)

  validateOptions(schema, options, 'Example Loader')

  console.log('ivan: ')
  console.log(this)

  // Apply some transformations to the source...

  return source
}
