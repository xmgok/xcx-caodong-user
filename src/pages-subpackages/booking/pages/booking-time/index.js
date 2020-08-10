const ApiBooking = require('../../../../api/booking')

Page({
  data: {
    chooseTime: {}, // 选择的时间
    timeList: []
  },

  onLoad (options) {
  },

  changeChooseTime ({ detail }) {
    console.log('e.detail', detail)
    this.setData({ chooseTime: detail.chooseData })
    if (!this.data.chooseTime.time) {
      this.getAppoTime()
    }
  },

  getAppoTime () {
    ApiBooking.getTecAppoTime({
      data: {
        workDate: this.data.chooseTime.day
      },
      success: ({ data = [] }) => {
        this.setData({ timeList: data })
      }
    })
  },

  confirm () {
    wx.setStorageSync('bookingChooseTime', this.data.chooseTime)
    wx.navigateBack({ delta: 1 })
  }
})
