Page({
  data: {
    wxAppId: '', // 要打开的小程序appId
    appId: '', // 传给超导的appId
    mobile: ''
  },

  onLoad ({ wxAppId, appId, mobile }) {
    console.log(wxAppId, appId, mobile)
    if (!wxAppId || !appId) return

    this.setData({
      wxAppId,
      appId,
      mobile
    })

    wx.setStorageSync('isCDNavigate', true) // 标志是超导跳转
    wx.setStorageSync('CDNavigateQuery', `?wxAppId=${wxAppId}&appId=${appId}&mobile=${mobile}`)

    this.navigate()
  },

  navigate () {
    wx.navigateToMiniProgram({
      appId: this.data.wxAppId,
      path: `pages/index/index?fromId=${this.data.appId}&mobile=${this.data.mobile}`,
      complete: (res) => console.log(res)
    })
  }
})
