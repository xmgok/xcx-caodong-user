import { PAGINATION } from '../../../../utils/consts'

const ApiSeller = require('../../../../api/seller')
const mixinsPagination = require('../../../../utils/mixins-pagination')
// const ApiProduct = require('../../../../api/product')
const ApiUser = require('../../../../api/user')
const ApiAddress = require('../../../../api/category')

function getDefaultData (options) {
  const obj = { // 默认值
    keyword: '',
    tabList: ['全部', '未开始', '进行中', '已结束'],
    tabIndex: 2,
    showTab: false,
    result: PAGINATION,
    dataList: [],
    categoryList: [],
    categoryIndex: -1,
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
    options.type = options.type || obj.tabIndex
    obj.tabIndex = options.type
  }
  return obj
}

Page({
  // data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
    this.getCategory()
  },

  getCategory () {
    ApiAddress.list({
      success: ({ data }) => {
        wx.hideLoading()
        this.setData({ categoryList: data })
        wx.stopPullDownRefresh()
      }
    })
  },

  getList () {
    let { result, dataList, options, categoryList, categoryIndex } = this.data
    ApiSeller.getProdCommissions({
      data: {
        categoryId: categoryIndex === -1 ? '' : categoryList[categoryIndex].id,
        keyword: this.data.keyword,
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        status: options.type
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },

  handleSearchConfirm ({ detail }) {
    this.setData({ keyword: detail || '' })
    this.resetPaginationAndList()
    this.getList()
  },

  bindChange (e) {
    const arr = e.detail.value.split('-')
    this.setData({
      year: arr[0],
      month: arr[1]
    })
    this.resetPaginationAndList()
    this.getList()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination,

  switchTab2 ({ currentTarget }) {
    const dataset = currentTarget.dataset
    this.setData({ categoryIndex: dataset.index })
    this.resetPaginationAndList()
    this.getList()
  },

  onShareAppMessage ({ from, target }) {
    let shareParams = {}
    if (from === 'button' && !target.dataset.activeType) {
      const product = this.data.shareData
      // ApiProduct.transmit({
      //   data: {
      //     id: product.productId,
      //     mids: [] // 为空数组，会报系统异常。
      //   }
      // })
      ApiUser.transferAdd({
        data: {
          productId: product.id,
          productCode: product.productCode || '',
          price: product.price || 0,
          addPrice: 0
        }
      })
      shareParams = {
        path: `/pages/product/product?id=${product.id}&empid=${wx.getStorageSync('loginId')}&storeId=${wx.getStorageSync('storeId')}`,
        title: product.name || '',
        imageUrl: product.imgUrl
      }
    }
    return shareParams
  },

  close () {
    this.setData({ showShare: false })
  },
  showShare (e) {
    const dataset = e.currentTarget.dataset
    const resData = dataset.item
    this.setData({
      shareData: resData,
      showShare: true,
      checkIdList: [],
      imgList: [resData.productImg]
    })
  }
})
