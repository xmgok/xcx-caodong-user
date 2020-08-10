const app = getApp()

module.exports = {
  // 瓜分券详情
  info (options) {
    app.ajax({
      url: '/dist_coupon/get_info',
      type: 'POST',
      ...options,
      success (res) {
        res.data._myPrice = (res.data.myPrice || '').split('.')[0]
        res.data._issueTime = (res.data.issueTime || '').split(' ')[0]
        res.data._issueEndTime = (res.data.issueEndTime || '').split(' ')[0]
        res.data._beginTime = (res.data.beginTime || '').split(' ')[0].split('-').join('.')
        res.data._endTime = (res.data.endTime || '').split(' ')[0].split('-').join('.')
        if (options.success) options.success(res)
      }
    })
  },
  // 发起瓜分券
  create (options) {
    app.ajax({
      url: '/dist_coupon/add_record',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 瓜分新红包。
  reCreate (options) {
    app.ajax({
      url: '/dist_coupon/new_open',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 瓜分券在首页弹窗中展示。
  homeList (options) {
    app.ajax({
      url: '/dist_coupon/home_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
