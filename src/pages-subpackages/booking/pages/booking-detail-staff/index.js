import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    resData: {},
    options: {},
    txtOBJ: {
      1: '待分配',
      2: '待服务',
      3: '已完成',
      4: '已取消',
      5: '已关闭'
    },
    iconOBJ: {
      1: 'icon-daifenpei',
      2: 'icon-daifuwu',
      3: 'icon-order-check',
      4: 'icon-order-cancel',
      5: 'icon-order-cancel'

    },
    // 详情内容
    dataInfo: {},
    // 服务项目
    serviceList: [],
    closeShow: false,
    memo: '', // 关闭原因
    code: '',
    userId: '',
    jobType: wx.getStorageSync('jobType') // 0店员 1店长
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

  onLoad ({ code, userId }) {
  },

  onShow () {
    this.setData(getDefaultData(this.options, this))
    this.getLists()
  },

  getLists () {
    let {
      options
    } = this.data
    ApiBooking.info({
      data: {
        code: options.code
      },
      success: res => {
        const data = res.data
        this.setData({
          dataInfo: data,
          serviceList: data.serviceList
        })
      }
    })
  },
  //  分配导购
  taskStaff () {
    const dataInfo = this.data.dataInfo
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-staff-split/index?userId=${dataInfo.userId}&code=${dataInfo.bookingCode}` })
  },
  // 关闭预约单
  close () {
    this.setData({
      closeShow: true,
      code: this.data.options.code
    })
  },
  closeSubmit () {
    if (!this.data.memo) return
    ApiBooking.close({
      data: {
        code: this.data.options.code,
        reason: this.data.memo
      },
      success: ({
        message
      }) => {
        wx.showToast({
          title: message,
          icon: 'success',
          duration: 1000
        })
        this.setData({
          closeShow: false
        })
        this.getLists()
      }
    })
  },
  onInput ({
    detail
  }) {
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
  touch () {
    wx.navigateTo({ url: '/pages-subpackages/booking/pages/booking-write-off/index' })
  },
  // 取消订单
  cancel () {

  },
  onPullDownRefresh () {
    this.onShow()
    wx.stopPullDownRefresh()
  }
})
