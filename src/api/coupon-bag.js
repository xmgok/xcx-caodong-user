const app = getApp()

export default {
  // 优惠券包领取
  acquire: (options) => {
    app.ajax({
      url: '/coupon_pack/acquire',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 小程序优惠券包列表
  listByStore: (options) => {
    app.ajax({
      url: '/coupon_pack/app_list',
      type: 'get',
      ...options,
      success (res) {
        // res.data.dataList.forEach(v => {
        //   if (v.price) {
        //     v._price_big = v.price.split('.')[0]
        //   }
        // })
        if (options.success) options.success(res)
      }
    })
  },

  // 小程序优惠券包详情
  info: (options) => {
    app.ajax({
      url: '/coupon_pack/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 小程序优惠券包列表
  infoList: (options) => {
    app.ajax({
      url: '/coupon_pack/app_detail_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 添加优惠券包转发|浏览
  forward: (options) => {
    app.ajax({
      url: '/coupon_pack/forward',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
