const ApiComment = require('../../../../api/comment')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options) {
  const obj = { // 默认值
    tabList: ['待评价', '已评价'],
    tabIndex: 0,
    showTab: false,
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
    obj.tabIndex = +options.type
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
  },

  onShow () {
    this.resetPaginationAndList()
    this.getList()
  },

  getList () {
    let { result, dataList } = this.data
    if (this.data.tabIndex === 1) { // 已评价
      ApiComment.listMy({
        data: {
          pageNum: result.pageNum,
          pageSize: result.pageSize
        },
        success: res => {
          dataList = dataList.concat(res.data.dataList)
          this.setData({ dataList })
          this.setPagination(res.data)
        }
      })
    }
    if (this.data.tabIndex === 0) { // 待评价
      ApiComment.listMy2({
        data: {
          pageNum: result.pageNum,
          pageSize: result.pageSize,
          type: 0, // 待评价
          orderCode: this.data.options.orderCode
        },
        success: res => {
          dataList = dataList.concat(res.data.dataList)
          this.setData({ dataList })
          this.setPagination(res.data)
        }
      })
    }
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
