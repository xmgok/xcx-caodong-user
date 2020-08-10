
import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')
const app = getApp()
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
    showTakeCode: false, // 预约码
    showReasonPicker: false, // 显示原因选择框
    // 取消预约原因
    bokkingList: [],
    reasonSelect: '',
    // 详情列表
    dataInfo: {},
    // 服务项目
    serviceList: []
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
    console.log(options)
    this.setData(getDefaultData(options, this))
    this.getLists()
    this.getCancelReason()
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
    console.log(this.data.options.code)
    ApiBooking.cancel({
      data: {
        code: this.data.options.code,
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
        this.getLists()
        this.setData({
          showReasonPicker: false
        })
      }
    })
  },
  //  预约码
  showTake () {
    this.setData({
      showTakeCode: true
    })
    this.setData({
      takeCodeQr: `${app.config.domainPath}/order/qr_codes?token=${wx.getStorageSync('token')}&str=${this.data.dataInfo.bookingCode}`
    })
  },
  hideTake () {
    this.setData({
      showTakeCode: false
    })
  },
  openLocation ({ currentTarget: { dataset: { item } } }) {
    console.log('openLocation item', item)
    wx.openLocation({
      longitude: Number(item.storeLongitude),
      latitude: Number(item.storeLatitude),
      scale: 18,
      name: item.storeName,
      address: item.storeAddress,
      fail: (e) => {
        console.log('openLocation fail', e)
      }
    })
  },
  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },
  // 接待导购
  freeTell () {
    wx.makePhoneCall({
      phoneNumber: `${this.data.dataInfo.empMobile}`

    })
  }
})
