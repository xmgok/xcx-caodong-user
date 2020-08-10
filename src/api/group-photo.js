const app = getApp()

module.exports = {
  info (options) {
    app.ajax({
      url: '/group_photo/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  forward (options) {
    app.ajax({
      url: '/group_photo/forward',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  record (options) {
    app.ajax({
      url: '/group_photo/record',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
