import business from '../../utils/business'
const productApi = require('../../api/product')
const ApiProductsearch = require('../../api/productsearch')
const priceCtrl = require('../../utils/price')
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
const DEFAULT_SORT = 1

Page({
  data: {
    userType: '',
    categoryId: '',
    keyword: '',
    showHistory: true,
    history: [],
    goodsList: [],
    shareData: null,
    pageNum: DEFAULT_SORT,
    pageSize: 5,
    loading: false,
    reachBottom: false,
    lookMoreData: {},
    // 排序
    sort: 1,
    sortList: [
      { label: '销量', down: 1 },
      { label: '新品', down: 5 },
      { label: '价格', up: 3, down: 4 }
    ]
  },

  onLoad ({ lookMoreData, categoryId = '', categoryName = '', keyword = '', sort = '', scene = '', title = '' }) {
    scene = business.sceneParse(scene)
    categoryId = scene.categoryId || categoryId
    categoryName = scene.categoryName || categoryName
    keyword = scene.keyword || keyword
    sort = scene.sort || sort || this.data.sort
    wx.hideShareMenu()
    if (title) {
      wx.setNavigationBarTitle({ title })
    } else {
      wx.setNavigationBarTitle({ title: (categoryName || '搜索') })
    }
    const hasQuery = !!(categoryId || keyword)
    this.setData({
      lookMoreData: lookMoreData ? JSON.parse(decodeURIComponent(lookMoreData)) : {},
      categoryId,
      keyword,
      sort,
      showHistory: !hasQuery,
      userType: wx.getStorageSync('userType')
    })

    this.getList() // 这里有问题可以问宋fan
    // if (hasQuery) this.getList()
    // ApiProductsearch.list({
    //   success: ({ data = [] }) => {
    //     const history = data.map((item) => item.content)
    //     this.setData({ history })
    //   }
    // })
  },

  getList () {
    if (this.data.reachBottom || this.data.loading) return
    this.setData({ loading: true, showHistory: false })

    const data = {
      categoryId: this.data.categoryId || undefined,
      keyword: this.data.keyword || undefined,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }
    const result = this.data.lookMoreData
    const search = result.search
    if (+result.searchType === 2) { // 按商品搜索
      data.productIdList = result.productList
    }
    if (+result.searchType === 1) { // 按条件搜索
      data.categoryList = search.categoryList.length ? search.categoryList : undefined
      data.labelList = search.labelList.length ? search.labelList : undefined
      data.startPrice = search.startPrice || undefined
      data.endPrice = search.endPrice || undefined
    }
    if (this.data.sort) {
      data.sort = this.data.sort
    }
    if (this.data.userType === 'staff') { // 导购搜索商品出佣金字段 - 需要这个字段
      data.showCommision = 1
    }
    productApi.searchNew({
      data: data,
      success: ({ data }) => {
        this.setData({
          goodsList: this.data.goodsList.concat(this.formatPrice(data.dataList)),
          loading: false,
          reachBottom: (data.dataList.length < this.data.pageSize),
          pageNum: ++this.data.pageNum
        })
      }
    })
  },
  // 价格格式化
  formatPrice (list) {
    return list.map(item => {
      const { int, dec } = priceCtrl.currency(item.price)
      item.priceInteger = int
      item.priceDecimal = dec
      if (item.commission && item.commission === '0.00') {
        item.commission = ''
      }
      return item
    })
  },
  handleSearchConfirm ({ detail }) {
    this.setData({ keyword: detail })
    this._doSearch()
  },
  bindTagTap ({ target: { dataset: { value } } }) {
    this.setData({ keyword: value })
    this._doSearch()
  },
  _doSearch () {
    this.setData({ keyword: this.data.keyword, pageNum: 1, loading: false, reachBottom: false, goodsList: [] })
    this.getList()
  },
  onReachBottom () {
    this.getList()
  },
  productSelect ({ detail }) {
    this.setData({ shareData: detail })
  },
  handleDeleteHistory () {
    wx.showModal({
      content: '确定要删除历史记录吗？',
      success: ({ confirm }) => {
        if (!confirm) return
        ApiProductsearch.clear(({
          success: ({ message = '' }) => {
            wx.showToast({ title: message, icon: 'none', duration: 1000 })
            this.setData({ history: [] })
          }
        }))
      }
    })
  },
  onShareAppMessage () {
    const empId = wx.getStorageSync('empidCommission')
    let shareParams = {}
    const { product, checkIdList, imgList } = this.data.shareData
    ApiProduct.transmit({
      data: {
        id: product.id,
        mids: checkIdList
      }
    })
    ApiUser.transferAdd({
      data: {
        productId: product.id,
        productCode: product.productCode || '',
        price: product.price || 0,
        addPrice: 0
      }
    })
    shareParams = {
      path: `/pages/product/product?id=${product.id}${empId ? `&empid=${empId}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      title: product.name || '',
      imageUrl: imgList[0]
    }
    return shareParams
  },
  // 排序
  sortChange ({ currentTarget: { dataset: { index } } }) {
    const { sort, sortList } = this.data
    const item = sortList[index]
    let sortTo = ''

    if (item.up) {
      if (sort === item.down) {
        sortTo = item.up
      } else if (sort === item.up) {
        sortTo = DEFAULT_SORT
      } else {
        sortTo = item.down
      }
    } else {
      if (sort !== item.down) {
        sortTo = item.down
      } else {
        sortTo = sort === DEFAULT_SORT ? '' : DEFAULT_SORT
      }
    }

    this.setData({ sort: sortTo })
    this._doSearch()
  }
})
