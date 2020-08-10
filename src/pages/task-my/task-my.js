const ApiTask = require('../../api/task')
const mixinsPagination = require('../../utils/mixins-pagination')

function getDefaultData (options) {
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
    ApiTask.getList({
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

  goTaskDetail ({ currentTarget: { dataset: { item } } }) {
    if (+item.status !== 2) {
      return
    }
    let url = ''
    if (+item.type === 1) {
      url = '/pages/task-step-fans/task-step-fans'
    }
    if (+item.type === 2) {
      url = '/pages/task-step/task-step'
    }
    if (+item.type === 3) {
      url = '/pages/task-step-kpi/task-step-kpi'
    }
    wx.navigateTo({
      url: url + '?id=' + item.id
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
