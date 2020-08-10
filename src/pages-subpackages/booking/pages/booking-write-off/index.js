const ApiBooking = require('../../../../api/booking')

function getDefaultData (options) {
  const obj = { // 默认值
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    value: '',
    dataList: [],
    resData: {},
    yzData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
  },

  bindinput ({ detail }) {
    this.setData({ value: detail.value })
  },

  scanCode () {
    wx.scanCode({ // 允许从相机和相册扫码
      success: (res) => {
        if (res.errMsg === 'scanCode:ok') {
          this.setData({ value: res.result })
        }
      }
    })
  },

  yz () {
    if (!this.data.value) {
      wx.showToast({ title: '预约码不能为空', icon: 'none', duration: 4000 })
      return
    }
    ApiBooking.verifyCode({
      data: { code: this.data.value },
      success: (res) => {
        this.setData({ yzData: res.data })
      }
    })
  },

  hx () {
    if (this.data.yzData.validateState === 0) {
      ApiBooking.confirmVerify({
        data: { code: this.data.value },
        success: () => {
          this.yz()
        }
      })
    }
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
