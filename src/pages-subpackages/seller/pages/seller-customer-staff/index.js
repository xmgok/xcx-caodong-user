import { PAGINATION } from '../../../../utils/consts'

const ApiSeller = require('../../../../api/seller')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options) {
  const obj = { // 默认值
    tabList: ['全部', '二级', '三级'],
    tabIndex: 0,
    showTab: false,
    result: PAGINATION,
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
  // data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  getList () {
    let { result, dataList, options } = this.data
    ApiSeller.getMyGuides({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        status: options.type
      },
      success: res => {
        const data = res.data
        dataList = dataList.concat(data.dataList)
        this.setData({ dataList })
        this.setPagination(data)
      }
    })
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

  ...mixinsPagination
})
