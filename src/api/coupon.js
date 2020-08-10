const app = getApp()

export default {
  // 优惠券进入领取通知
  getInform: (options) => {
    app.ajax({
      url: '/coupon/coupon/get_inform',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  listByStore: (options) => {
    app.ajax({
      url: '/coupon/list_by_store',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          if (v.price) {
            v._price_big = v.price.split('.')[0]
          }
        })
        if (options.success) options.success(res)
      }
    })
  },

  // type 类型:1-未使用 2-已使用 3-已过期
  couponMy: (options) => {
    app.ajax({
      url: '/coupon/my_coupon',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // type 类型:1-未使用 2-已使用 3-已过期
  couponMyNew: (options) => {
    app.ajax({
      url: '/coupon/my_coupon_new',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // ids 商品id集合 array
  couponPopup: (options) => {
    app.ajax({
      url: '/coupon/list_by_product',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  couponGoods: (options) => {
    app.ajax({
      url: '/coupon/product_by_couponid',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // id 优惠券
  couponGet: (options) => {
    let data = options.data || {}
    app.ajax({
      url: '/coupon/get',
      data,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  couponInfo: (options) => {
    app.ajax({
      url: '/coupon/info',
      type: 'get',
      params: options.params || {},
      success (res) {
        res.data.forEach(v => {
          v.isGet = Number(v.isGet)
        })
        if (options.success) options.success(res)
      }
    })
  },

  couponInfoMy: (options) => {
    app.ajax({
      url: '/coupon/my_coupon_info',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  cardSign: (options) => {
    app.ajax({
      url: '/mp/wechat/card_sign',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }

}
