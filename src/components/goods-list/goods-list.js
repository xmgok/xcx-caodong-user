// const ApiProduct = require('../../api/product')
// const ApiUser = require('../../api/user')

Component({
  options: {},

  properties: {
    list: {
      type: Array,
      value: [],
      observer (newVal) {
        this.setData({ listData: newVal })
      }
    },
    showDivider: {
      type: Boolean,
      value: true
    }
  },

  data: {
    show: false,
    productId: '',
    transmitUrl: '',
    imgList: [],
    checkIdList: '',
    showShare: false,
    listData: [],
    typeObj: {
      1: 'ui-mark_new', 2: 'ui-mark_other', 3: 'ui-mark_coupon'
    }
  },

  methods: {
    bindPurchase (e) {
      const index = e.currentTarget.dataset.index
      this.setData({ productId: '' })
      setTimeout(() => {
        wx.hideTabBar()
      }, 100)
      this.setData({
        show: true,
        productId: this.data.listData[index].id
      })
    },
    onPurchaseClose () {
      wx.showTabBar()
    },
    goodsPurchaseSelected ({ detail }) {
      this.setData({ show: false })
      wx.showTabBar()
      let goods = [
        {
          productId: detail.spec.productId,
          specId: detail.spec.id,
          productNum: detail.quantity
        }
      ]
      wx.setStorage({
        key: 'to-order-confirm',
        data: goods,
        success () {
          wx.navigateTo({ url: '../order-confirm/order-confirm' })
        }
      })
    }
  }
})
