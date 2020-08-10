const app = getApp()

module.exports = {
  // 验证提货码
  selftakeInfo (options) {
    app.ajax({
      url: '/selftake/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 自提核销查询
  selftakeValidateTake (options) {
    app.ajax({
      url: '/selftake/validate_take',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  totalTakeOrderToday (options) {
    app.ajax({
      url: '/order/order/total_take_order_today',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 订单预览
  preview: (options) => {
    app.ajax({
      url: '/order/preview',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      },
      fail (res) {
        if (options.fail) options.fail(res)
      }
    })
  },

  // 创建订单
  create: (options) => {
    app.ajax({
      url: '/order/create',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      },
      fail (res) {
        if (options.fail) options.fail(res)
      }
    })
  },

  // 支付
  payment: (options) => {
    app.ajax({
      url: '/order/payment',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      },
      fail (res) {
        if (options.fail) options.fail(res)
      }
    })
  },

  // 订单详情
  info: (options) => {
    app.ajax({
      url: '/order/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 订单列表
  list: (options) => {
    app.ajax({
      url: '/order/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 取消订单
  cancel: (options) => {
    app.ajax({
      url: '/order/cancel',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 删除订单
  delete: (options) => {
    app.ajax({
      url: '/order/delete',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 确认收货
  delivery: (options) => {
    app.ajax({
      url: '/order/delivery',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 申请售后价格
  customPrice: (options) => {
    app.ajax({
      url: '/orderreturn/calculate',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  expressDetail: (options) => {
    app.ajax({
      url: '/express/detail',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  parcelList: (options) => {
    app.ajax({
      url: '/express/parcel_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 获取自提订单统计数据
  totalTakeOrder: (options) => {
    app.ajax({
      url: '/order/order/total_take_order',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 获取自提订单统计数据
  totalStateNumber: (options) => {
    app.ajax({
      url: '/order/order/total_state_number',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 确认发货
  deliverApp: (options) => {
    app.ajax({
      url: '/order/order/deliver_app',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 读取快递类型
  getExpressInfo: (options) => {
    app.ajax({
      url: '/order/order/get_express_info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 获取详情
  deliverPageInfo: (options) => {
    app.ajax({
      url: '/order/order/deliver_page_info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
