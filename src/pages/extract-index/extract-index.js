const ApiPercentPay = require('../../api/percent-pay')

Page({
  data: {
    infos: {},
    canWithdraw: false
  },

  onLoad () {
    this.getInfo()

    ApiPercentPay.canWithdraw({
      success: ({ data }) => {
        this.setData({ canWithdraw: data })
      }
    })
  },

  getInfo () {
    ApiPercentPay.infos({
      success: res => {
        this.setData({ infos: res.data })
      }
    })
  },
  getcash () {
    wx.showToast({
      title: '即将上线',
      icon: 'none'
    })
  }
})
