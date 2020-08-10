import Apicart from '../../api/cart'

Component({
  options: {},

  properties: {
    show: {
      type: Boolean,
      value: false
    },
    ids: { // 商品id集合
      type: Number,
      value: 0,
      observer (newval) {
        this.setData({
          id: newval
        })
      }
    }
  },

  data: {
    checked: false,
    goodsData: {}
  },

  attached () {
    Apicart.checkGift({
      params: {
        productId: this.data.ids
      },
      success: ({ data }) => {
        this.setData({
          goodsData: data || {}
        })
      }
    })
  },

  methods: {
    onPurchaseClose () {
      this.setData({
        show: false
      })
      this.triggerEvent('gaveawayClose')
    },
    doCheck () {
      this.setData({ checked: !this.data.checked })
    },
    sure () {
      this.triggerEvent('gaveawaySure',
        {
          checked: this.data.checked,
          specid: this.data.goodsData.specificationList[0].id
        }
      )
    }
  }
})
