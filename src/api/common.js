const app = getApp()

module.exports = {
  // 订阅消息。
  subscribeMsg (options) {
    app.ajax({
      url: '/mp/minapp/subscribe_msg/templates',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 首页弹窗
  popup (options) {
    app.ajax({
      url: '/index/popup',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
