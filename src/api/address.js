const app = getApp()

// 收货地址列表
exports.list = (options) => {
  app.ajax({
    url: '/receiveaddress/list',
    type: 'get',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 带参收货地址列表查询
exports.paramList = (options) => {
  app.ajax({
    url: '/receiveaddress/paramlist',
    type: 'get',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 新增收货地址
exports.add = (options) => {
  let data = options.data || {}
  app.ajax({
    url: `/receiveaddress/${data.id ? 'update' : 'add'}`,
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 删除
exports.delete = (options) => {
  app.ajax({
    url: '/receiveaddress/delete',
    type: 'delete',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 获取地址详情
exports.info = (options) => {
  app.ajax({
    url: '/receiveaddress/info',
    type: 'get',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 物流公司
exports.express = (options) => {
  app.ajax({
    url: '/express/companylist',
    type: 'get',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
