const ApiProduct = require('../../../api/product')
const priceCtrl = require('../../../utils/price')

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  data: {
    recommendList: []
  },
  attached () {
    this.getRecommend()
  },
  methods: {
    formatPrice (list) {
      return list.map(item => {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(item.price)
        item.priceInteger = int
        item.priceDecimal = dec
        return item
      })
    },
    getRecommend () {
      ApiProduct.recommend({
        data: {
          pageNum: 1,
          pageSize: 10
        },
        success: ({ data }) => {
          this.setData({ recommendList: this.formatPrice(data.dataList), totalCount: data.totalCount })
        }
      })
    }
  }
})
