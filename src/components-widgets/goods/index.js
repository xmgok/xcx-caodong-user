const ApiProduct = require('../../api/product')
const priceCtrl = require('../../utils/price')

Component({
  properties: {
    result: {
      type: Object,
      value: {},
      observer () {
        this.setLookMoreDataStr()
      }
    }
  },
  data: {
    lookMoreDataStr: encodeURIComponent(JSON.stringify({})),
    recommendList: []
  },
  attached () {
    this.setLookMoreDataStr()
    this.getList()
  },
  methods: {
    setLookMoreDataStr () {
      const lookMoreDataStr = encodeURIComponent(JSON.stringify(this.data.result))
      this.setData({ lookMoreDataStr })
    },
    formatPrice (list) {
      return list.map(item => {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(item.price)
        item.priceInteger = int
        item.priceDecimal = dec
        return item
      })
    },
    getList () {
      const result = this.data.result
      const search = result.search
      let data = {
        pageNum: 1,
        pageSize: 6
      }
      if (+result.searchType === 2) { // 按商品搜索
        data.productIdList = result.productList
      }
      if (+result.searchType === 1) { // 按条件搜索
        data.categoryList = search.categoryList.length ? search.categoryList : undefined
        data.labelList = search.labelList.length ? search.labelList : undefined
        data.startPrice = search.startPrice || undefined
        data.endPrice = search.endPrice || undefined
      }
      ApiProduct.searchNew({
        data,
        success: ({ data }) => {
          this.setData({ recommendList: this.formatPrice(data.dataList), totalCount: data.totalCount })
        }
      })
    }
  }
})
