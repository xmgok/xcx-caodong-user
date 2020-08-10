import business from '../../../../utils/business'
const ApiMessage = require('../../../../api/message')
const {
  NUMBER_TO_ZHCN
} = require('../../../../utils/consts')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options, self) {
  const obj = { // 默认值
    loginId: wx.getStorageSync('loginId'),
    tabList: ['全部', '二级', '三级'],
    tabIndex: 0,
    NUMBER_TO_ZHCN,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    resData: {},
    options: {},
    txtOBJ: {
      1: '吸粉任务',
      2: '转发任务',
      3: '业绩任务'
    }

  }
  if (options) { // 根据options重置默认值
    obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = {
      ...options,
      ...business.sceneParse(options.scene)
    }
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
  onShow () {
    this.setData(getDefaultData(this.options, this))
    this.getList()
  },
  getList () {
    let {
      result,
      dataList,
      options
    } = this.data
    ApiMessage.myListDetail({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        type: options.type
      },
      success: res => {
        const data = res.data
        dataList = dataList.concat(data.dataList)
        this.setData({
          dataList
        })
        this.setPagination(data)
      }
    })
  },
  // 任务详情
  goOrderDetail ({
    currentTarget
  }) {
    const taskId = currentTarget.dataset.taskId
    const id = currentTarget.dataset.id
    const type = currentTarget.dataset.subType
    ApiMessage.messageRead({
      data: {
        id: id
      },
      success: res => {
        this.resetPaginationAndList()
        this.getList()
      }
    })
    let url = ''
    if (type === 1) {
      url = '/pages/task-step-fans/task-step-fans'
    }
    if (type === 2) {
      url = '/pages/task-step/task-step'
    }
    if (type === 3) {
      url = '/pages/task-step-kpi/task-step-kpi'
    }
    wx.navigateTo({
      url: url + '?id=' + taskId
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
