const ApiSeller = require('../../../../api/seller')

function getDefaultData (options) {
  const obj = { // 默认值
    nickName: wx.getStorageSync('nickName'),
    headUrl: wx.getStorageSync('headUrl'),
    loginId: wx.getStorageSync('loginId'),
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  // data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    ApiSeller.mycommission({
      success: (res) => {
        this.setData({ resData: res.data })
      }
    })
  },

  showMsg () {
    wx.showToast({
      title: '即将上线',
      icon: 'none',
      duration: 2000
    })
    return false
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage () {
    ApiSeller.saveInvitationLog()
    return {
      title: '快来成为分销商，赚佣金啦！',
      imageUrl: 'https://qiniu.icaodong.com/xcx/common/seller-share.png?v=1.0.0',
      path: `/pages-subpackages/seller/pages/seller-request/index?type=seller&parentId=${this.data.loginId}&empid=${this.data.loginId}&storeId=${wx.getStorageSync('storeId')}`
    }
  }
})
