/* eslint-disable no-unused-vars */
function uploadError (url) {
  // console.log(1)
  Pubsub && Pubsub.sub && Pubsub.sub('ServiceException', function (name, error) {
    // var url = 'http://192.168.0.22:3000/log'
    url += ('?name=' + error.toString() + '&stack=' + error.stack)
    var img = new Image()
    img.onload = img.onerror = function () {
      img = null
    }
    img.src = encodeURI(url)// 发送数据到后台cgi
  })
}
