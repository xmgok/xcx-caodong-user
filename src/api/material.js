const app = getApp()

// 发现列表
exports.list = (options = {}) => {
  app.ajax({
    url: '/material/list_app',
    type: 'get',
    params: options.params,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 单张素材详情
exports.info = (options = {}) => {
  app.ajax({
    url: '/material/info',
    type: 'get',
    params: options.params,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 素材上报
exports.report = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/material/report',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 图片下载修改图片的使用次数
exports.updateusetotal = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/material/updateusetotal',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 图片上传
exports.updatematerialtag = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/material/updatematerialtag',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
