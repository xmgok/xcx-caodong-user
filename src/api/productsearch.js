const app = getApp()

exports.clear = (options) => {
  app.ajax({
    url: '/productsearch/clear',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.list = (options) => {
  app.ajax({
    url: '/productsearch/list',
    type: 'get',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
