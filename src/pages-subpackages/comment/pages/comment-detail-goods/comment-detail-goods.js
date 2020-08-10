const ApiComment = require('../../../../api/comment')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options) {
  const obj = { // 默认值
    tabList: ['全部', '好评', '中评', '差评', '晒图'],
    tabIndex: 0,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
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
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  getList () {
    let { result, dataList, options } = this.data
    ApiComment.listGoods({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        productId: options.productId,
        type: this.data.tabIndex || ''
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination,

  previewImage ({ currentTarget: { dataset: { index, images } } }) {
    wx.previewImage({ current: index, urls: images })
  }
})
