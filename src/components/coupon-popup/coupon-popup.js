import ApiCoupon from '../../api/coupon'

Component({
  options: {},

  properties: {
    show: {
      type: Boolean,
      value: false
    },
    ids: { // 商品id集合
      type: Array,
      value: []
    },
    productCode: { // 商品编号
      type: String,
      value: ''
    },
    type: { // 商品id集合
      type: Number,
      value: 2
    },
    couponIds: {
      type: Array,
      value: []
    },
    getType: {
      type: Number,
      value: 1
    },
    activityId: {
      type: Number,
      value: 0
    }
  },

  data: {
    list: []
  },

  ready () {
    this.getCouponList()
  },

  methods: {
    onPurchaseClose () {
      this.setData({ show: false })
      this.triggerEvent('close')
    },
    getCouponList () {
      const couponIds = this.data.couponIds
      ApiCoupon[couponIds.length ? 'couponInfo' : 'couponPopup']({
        params: {
          ids: couponIds.length ? couponIds : this.data.ids,
          type: this.data.type,
          productCode: this.data.productCode
        },
        success: res => {
          let list = res.data.map(item => {
            if (item.price) {
              item['_price_big'] = item.price.split('.')[0]
              item['_price_small'] = item.price.split('.')[1]
            }
            return item
          })
          this.setData({ list })
        }
      })
    },
    goToUse ({ currentTarget: { dataset: { id } } }) {
      ApiCoupon.couponGet({
        data: { id },
        success: res => {
          wx.showToast({ title: res.message, icon: 'none' })
          this.getCouponList()
        }
      })
    }
  }
})
