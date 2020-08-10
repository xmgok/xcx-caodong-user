import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')
const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getDetail()
  },

  showTake () {
    this.setData({ takeCodeQr: `${app.config.domainPath}/order/qr_codes?token=${wx.getStorageSync('token')}&str=${this.data.resData.bookingCode}` })
  },

  getDetail () {
    ApiBooking.info({
      data: {
        code: this.options.code
      },
      success: ({ data }) => {
        this.setData({ resData: data })
        this.showTake()
      }
    })
  },

  previewImage () {
    const imgUrls = [this.data.takeCodeQr]
    wx.previewImage({ current: imgUrls[0], urls: imgUrls })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
