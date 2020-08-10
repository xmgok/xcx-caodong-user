import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options, self) {
  const obj = { // 默认值
    tabList: ['全部', '待分配', '待服务', '已完成', '已取消', '已关闭'],
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
    options: {},
    closeShow: false,
    memo: '', // 关闭原因
    jobType: ''// 0店员 1店长
  }
  if (options) { // 根据options重置默认值
    obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad () {
    console.log(this.data.jobType)
  },

  onShow () {
    this.setData(getDefaultData(this.options, this))
    this.setData({
      jobType: wx.getStorageSync('jobType')
    })
    this.getList()
  },

  // 关闭预约单
  close ({ currentTarget }) {
    let code = currentTarget.dataset.code
    this.setData({
      closeShow: true,
      code: code
    })
  },
  closeSubmit () {
    if (!this.data.memo) return
    ApiBooking.close({
      data: {
        code: this.data.code,
        reason: this.data.memo
      },
      success: ({ message }) => {
        wx.showToast({
          title: message,
          icon: 'success',
          duration: 1000
        })
        this.setData({
          closeShow: false
        })
        this.resetPaginationAndList()
        this.getList()
      }
    })
  },
  onInput ({ detail }) {
    this.setData({
      memo: detail.value
    })
  },
  onPurchaseClose () {
    this.setData({
      closeShow: false
    })
  },
  // 核销预约单
  touch ({ currentTarget }) {
    wx.navigateTo({ url: '/pages-subpackages/booking/pages/booking-write-off/index' })
  },
  // 取消订单
  cancel () {

  },
  //  分配导购
  taskStaff ({ currentTarget: { dataset: { item } } }) {
    let userId = item.userId
    let code = item.code
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-staff-split/index?userId=${userId}&code=${code}` })
  },
  getList () {
    let {
      result,
      dataList,
      options
    } = this.data
    ApiBooking.list({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        status: options.type || 0
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

  onPullDownRefresh () {
    this.onShow()
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
