import business from '../../utils/business'
const ApiActivity = require('../../api/activity')
const pagination = require('../../utils/mixins-pagination')

function getDefaultData (options, self) {
  const obj = { // 默认值
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
    // obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getList()
  },

  getList () {
    let { result, dataList, options } = this.data
    ApiActivity.getFansList({
      data: {
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

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...pagination
})
