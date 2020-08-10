import business from '../../utils/business'
const ApiUser = require('../../api/user')

function getDefaultData (options, self) {
  const obj = { // 默认值
    invitePopupVisible: false,
    resData: {},
    userInfo: {},
    splitData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    // obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    wx.showLoading({ title: '二维码解析中...' })
    ApiUser.getScene({
      data: { id: this.data.options.sceneId },
      success: (res) => {
        if (wx.getStorageSync('nickName') || wx.getStorageSync('headUrl')) {
          wx['reLaunch']({ url: business.scene2page(res.data) }) // res.data 就是 scene
        }
      }
    })
  }
})
