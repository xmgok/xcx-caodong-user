import { padStart } from '../../utils/index'
const ApiSeller = require('../../api/seller')
const mixinsPagination = require('../../utils/mixins-pagination')

function getDefaultData (options) {
  const date = new Date()
  const year = date.getFullYear()
  const month = padStart(date.getMonth() + 1)
  const endDate = year + '-' + month
  const obj = { // 默认值
    year,
    month,
    endDate,
    tabList: ['全部', '未开始', '进行中', '已结束'],
    tabIndex: 2,
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
    ApiSeller.getWithdraws({
      data: {
        year: this.data.year,
        month: this.data.month,
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        status: options.type
      },
      success: res => {
        let { ramount, wamount, gamount } = res.data
        dataList = dataList.concat(res.data.dataList)
        this.setData({
          dataList,
          ramount,
          wamount,
          gamount
        })
        this.setPagination(res.data)
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
