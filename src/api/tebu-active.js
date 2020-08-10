const app = getApp()

module.exports = {
  // LED显示什么
  show (options) {
    app.ajax({
      url: '/lighten/show',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 是否显示首页中间弹窗。
  is_fht_activity (options) {
    app.ajax({
      url: '/lighten/is_fht_activity',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 活动详情
  info (options) {
    app.ajax({
      url: '/lighten/info',
      type: 'get',
      ...options,
      success (res) {
        res.data.price = res.data.price.split('.')[0]
        if (options.success) options.success(res)
      }
    })
  },
  // 点亮并评论
  lighten (options) {
    app.ajax({
      url: '/lighten/lighten',
      type: 'post',
      ...options,
      success (res) {
        if (res.data) {
          res.data.timeArr = String(res.data.time).split('')
          console.log(res.data.timeArr)
        }
        if (options.success) options.success(res)
      },
      complete (res) {
        if (options.complete) options.complete(res)
      }
    })
  },
  // 留言列表
  message_list (options) {
    app.ajax({
      url: '/lighten/message_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
