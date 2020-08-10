const app = getApp()

// 商品分类树
exports.list = (options) => {
  app.ajax({
    url: '/procuct/category/list',
    type: 'get',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
