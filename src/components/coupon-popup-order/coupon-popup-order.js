Component({
  options: {},

  properties: {
    show: {
      type: Boolean,
      value: false
    },
    datas: { // 商品id集合
      type: Array,
      value: [],
      observer (newVal) {
        let currentId = this.data.currentId
        let list = newVal.map(item => {
          if (item.price) {
            item['_price_big'] = item.price.split('.')[0]
            item['_price_small'] = item.price.split('.')[1]
          }
          if (item.isChoose) {
            currentId = item.couponCustomerId
          }
          return item
        })
        this.setData({ list, currentId })
      }
    }
  },

  data: {
    list: [],
    currentId: '',
    checkedNot: false
  },

  methods: {
    onPurchaseClose () {
      this.setData({ show: false })
    },
    goToUse (e) {
      const item = e.detail.item
      const id = item.couponCustomerId
      if (this.data.currentId === id || item.disabledExplain) return
      let list = this.data.list.map(item => {
        item.isChoose = 0
        if (item.couponCustomerId === id) {
          item.isChoose = 1
        }
        return item
      })
      this.triggerEvent('selected', { value: id })
      setTimeout(() => {
        this.setData({ list, show: false, checkedNot: false })
      }, 50)
    },
    notUse () {
      let list = this.data.list.map(item => {
        item.isChoose = 0
        return item
      })
      this.setData({
        currentId: '',
        list,
        checkedNot: true,
        show: false
      })
      this.triggerEvent('selected', { value: -1 })
    }
  }
})
