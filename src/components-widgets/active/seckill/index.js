const priceCtrl = require('../../../utils/price')
const ApiSeckill = require('../../../api/seckill')

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  data: {
    page: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: []
  },
  attached () {
    this.getList()
  },
  methods: {
    formatPrice (list) {
      return list.map(item => {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(item.activePrice)
        item.priceInteger = int
        item.priceDecimal = dec
        return item
      })
    },
    getList () {
      const page = this.data.page
      ApiSeckill.list({
        data: {
          pageNum: page.pageNum,
          pageSize: page.pageSize,
          status: 2
        },
        success: ({ data }) => {
          this.setData({ dataList: this.data.dataList.concat(this.formatPrice(data.dataList)) })
          this.setPagination(data)
        }
      })
    },

    setPagination (data = {}) {
      this.setData({
        page: {
          totalPage: data.totalPage,
          totalCount: data.totalCount,
          pageNum: data.pageNum,
          pageSize: this.data.page.pageSize
        }
      })
    },

    setCurPageIncrement () {
      let { page } = this.data
      page.pageNum++
      this.setData({ page })
    },

    bindscrolltolower () {
      let { page } = this.data
      this.setCurPageIncrement()
      if (page.pageNum > page.totalPage) return
      this.getList()
    },
    goJoin (e) {
      const item = e.currentTarget.dataset.item
      if (item.id) {
        wx.navigateTo({
          url: `/pages/product/product?activeType=seckill&activeId=${item.id}&id=${item.productId}`
        })
      }
    },

    goDetail (e) {
      const dataset = e.currentTarget.dataset
      wx.navigateTo({ url: dataset.url })
    }
  }
})
