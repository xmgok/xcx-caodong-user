const ApiBooking = require('../../../../api/booking')

Page({
  data: {
    myCity: '',
    city: [],
    config: {
      horizontal: true, // 第一个选项是否横排显示（一般第一个数据选项为 热门城市，常用城市之类 ，开启看需求）
      animation: true, // 过渡动画是否开启
      search: true, // 是否开启搜索
      searchHeight: 45, // 搜索条高度
      suctionTop: true // 是否开启标题吸顶
    }
  },
  onLoad (options) {
    if (options.myCity) {
      this.setData({ myCity: options.myCity })
    }
    ApiBooking.city({
      success: (res) => {
        this.setData({ city: JSON.parse(res.data) })
      }
    })
  },
  bindtap (e) {
    wx.setStorageSync('bookingChooseCity', e.detail)
    wx.navigateBack({ delta: 1 })
  },

  onPullDownRefresh () {
    this.onLoad(this.options)
    wx.stopPullDownRefresh()
  }
})
