const app = getApp()

module.exports = {
  // 文章列表
  articleList (options) {
    app.ajax({
      url: '/article/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 文章详情
  articleInfo (options) {
    app.ajax({
      url: '/article/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
