import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')
const mixinsPagination = require('../../../../utils/mixins-pagination')
const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
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
    showTakeCode: false, // 预约码
    showReasonPicker: false, // 显示原因选择框
    // 取消预约原因
    bokkingList: [],
    code: '', // 预约码
    // 二维码信息
    orderInfo: {}
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
    this.getCancelReason()
  },
  // 显示取消预约
  cancelBk (e) {
    this.setData({
      showReasonPicker: true,
      code: e.currentTarget.dataset.code
    })
  },
  // 取消预约原因列表
  getCancelReason () {
    ApiBooking.cancelReason({
      data: {},
      success: ({
        data
      }) => {
        this.setData({
          bokkingList: data
        })
      }
    })
  },
  onReasonSubmit ({
    detail: {
      value
    }
  }) {
    ApiBooking.cancel({
      data: {
        code: this.data.code,
        reason: value.label
      },
      success: ({
        message
      }) => {
        wx.showToast({
          title: message,
          icon: 'success',
          duration: 1000
        })
        this.resetPaginationAndList()
        this.getList()
        this.setData({
          showReasonPicker: false
        })
      }
    })
  },
  //  预约码
  showTake ({ currentTarget }) {
    const orderInfo = currentTarget.dataset.item
    this.setData({
      showTakeCode: true,
      orderInfo: orderInfo
    })
    this.setData({
      takeCodeQr: `${app.config.domainPath}/order/qr_codes?token=${wx.getStorageSync('token')}&str=${this.data.orderInfo.code}`
    })
  },
  hideTake () {
    this.setData({
      showTakeCode: false
    })
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
        console.log(res)
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
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  goBooking () {
    wx.navigateTo({ url: '/pages-subpackages/booking/pages/booking/index' })
  },

  ...mixinsPagination
})
