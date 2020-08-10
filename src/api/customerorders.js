const app = getApp()

// 订单与消费
exports.count = (options) => {
  app.ajax({
    url: '/customerorders/count',
    type: 'get',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
// 我的图标
exports.history = (options) => {
  app.ajax({
    url: '/assetuser/history',
    type: 'get',
    params: options.params,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
