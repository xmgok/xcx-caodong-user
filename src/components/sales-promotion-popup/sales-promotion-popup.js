// import ApiCoupon from '../../api/coupon'

Component({
  options: {},

  properties: {
    show: {
      type: Boolean,
      value: false
    },
    datas: { // 商品id集合
      type: Object,
      value: {}
    }
  },

  methods: {
    onPurchaseClose () {
      this.setData({
        show: false
      })
    },
    navigate ({ currentTarget: { dataset } }) {
      const { category, type, id } = dataset
      switch (category) {
        case 'rule':
          wx.navigateTo({
            url: `/pages/gift-goods/gift-goods?id=${id}&type=${type}`
          })
          break
        case 'gift':
          wx.navigateTo({ url: `/pages/product/product?id=${id}&type=1` })
          break
      }
    }
  }
})
