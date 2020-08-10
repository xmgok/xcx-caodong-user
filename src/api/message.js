const app = getApp()

module.exports = {
  // 我的消息
  myList (options) {
    app.ajax({
      url: '/user/message',
      type: 'get',
      ...options,
      success (res) {
        // res.data.dataList.forEach(item => {
        //   Object.keys(item).forEach(key => {
        //     item[key] = item[key] || ''
        //   })
        // })
        if (options.success) options.success(res)
      }
    })
  },
  // 我的消息-用户标记已读
  messageRead (options) {
    app.ajax({
      url: '/user/message/read',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  //  用户通知详情
  myListDetail (options) {
    app.ajax({
      url: '/user/message/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(item => {
          Object.keys(item).forEach(key => {
            item[key] = item[key] || ''
          })
        })
        if (options.success) options.success(res)
      }
    })
  }
}
