
Component({
  options: { },

  properties: {
    show: {
      type: Boolean,
      value: false
    },
    datas: { // 商品id集合
      type: Array,
      value: [],
      observer (newVal) {
        let currentItem = newVal.find(item => item.isChoose)
        this.setData({ list: newVal, currentId: currentItem.expressId })
      }
    }
  },

  data: {
    list: [],
    currentId: ''
  },

  methods: {
    onPurchaseClose () {
      this.setData({ show: false })
    },
    goToUse ({ currentTarget: { dataset: { id } } }) {
      if (this.data.currentId === id) return

      let list = this.data.list.map(item => {
        item.isChoose = 0
        if (item.expressId === id) {
          item.isChoose = 1
        }
        return item
      })

      this.triggerEvent('selected', { value: id })
      setTimeout(() => {
        this.setData({ list, show: false })
      }, 200)
    }
  }
})
