const app = getApp()

module.exports = {
  search (options) {
    app.ajax({
      url: '/procuct/search',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  searchNew (options) {
    app.ajax({
      url: '/procuct/search_new',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 消费者猜你喜欢
  recommend (options) {
    app.ajax({
      url: '/procuct/saleslist',
      type: 'post',
      data: options.data || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 员工端转发排行
  shareRank (options) {
    app.ajax({
      url: '/procuct/sharelist',
      type: 'post',
      data: options.data || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 获取商品详情
  getDetails (options) {
    app.ajax({
      url: '/procuct/details',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  getInfo (options) {
    app.ajax({
      url: '/procuct/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 分享
  transmit (options) {
    app.ajax({
      url: '/procuct/transmit',
      data: options.data || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 详情页促销
  discount (options) {
    app.ajax({
      url: '/discount/discount_rules',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 领取赠品列表
  discountGiftList (options) {
    app.ajax({
      url: '/discount/discount_gift_list',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 促销活动凑单商品列表页
  discountProductList (options) {
    app.ajax({
      url: '/discount/discount_product_list',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 小程序显示促销赠品详情
  discountProductRules (options) {
    app.ajax({
      url: '/discount/discount_product_rules',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 分享进店统计
  shareIn (options) {
    app.ajax({
      url: '/user/validenter',
      data: options.data || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 兑换券兑换商品
  exchangeProduct (options) {
    app.ajax({
      url: '/order/order/exchange_product',
      type: 'post',
      data: options.data || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 根据id查商品详情秒杀信息
  getSeckillDetails (options) {
    app.ajax({
      url: '/seckill/info_by_product',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }

}
