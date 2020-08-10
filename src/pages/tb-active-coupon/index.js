import business from '../../utils/business'
const ApiTebu = require('../../api/tebu-active')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    infoData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    const scene = business.sceneParse(options.scene)
    options = {
      ...options,
      ...scene
    }
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    console.log('options', options)
    this.setData(getDefaultData(options))
    ApiTebu.info({
      data: {
        inviteId: options.userid || options.empid || ''
      },
      success: res => {
        this.setData({ infoData: res.data })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage () {
    const queryStr = business.queryStringify({
      userid: wx.getStorageSync('userid'),
      empid: wx.getStorageSync('empidCommission'),
      storeId: wx.getStorageSync('storeId')
    }, true)
    const shareInfo = {
      path: `/pages/tb-active-detail/index${queryStr}`,
      title: `邀请你参加和谢霆锋点亮风火台活动`,
      imageUrl: `https://qiniu.icaodong.com/tebu/onshare.jpg`
    }
    console.log('shareInfo', shareInfo)
    return shareInfo
  },
  onShare () {
    let scene = business.sceneStringify({
      pageId: 13,
      userid: wx.getStorageSync('userid'),
      empid: wx.getStorageSync('empidCommission'),
      storeId: wx.getStorageSync('storeId')
    })
    this.setData({
      imgList: [`https://qiniu.icaodong.com/tebu/onposter.jpg`],
      showShare: true,
      shareText: `邀请你参加点风火台活动，有机会赢取谢霆锋亲笔签名海报`,
      shareUrl: business.scene2Qr(scene, app)
    })
  }
})
