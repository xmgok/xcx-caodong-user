const ApiBargain = require('../../../api/bargain')
const priceCtrl = require('../../../utils/price')

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
        const { int, dec } = priceCtrl.currency(item.minPrice)
        item.priceInteger = int
        item.priceDecimal = dec
        return item
      })
    },
    getList () {
      const page = this.data.page
      ApiBargain.list({
        data: {
          // type: 3, // 1我的砍价 2我的进行中 3所有进行中 不传查所有的
          pageNum: page.pageNum,
          pageSize: page.pageSize
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
      if (item.recordId) {
        wx.navigateTo({
          url: `/pages-subpackages/promotion/pages/bargain-detail/index?id=${item.recordId}`
        })
        return
      }
      ApiBargain.create({
        data: {
          reduceId: item.reduceId // 砍价ID
        },
        success: ({ data }) => {
          wx.navigateTo({
            url: `/pages-subpackages/promotion/pages/bargain-detail/index?id=${data}`
          })
        }
      })
    },

    goDetail (e) {
      const dataset = e.currentTarget.dataset
      if (dataset.recordId) wx.navigateTo({ url: dataset.url })
    }
  }
})
