import ApiCouponSplit from '../../../../api/coupon-split'
import { timeCountDown } from '../../../../utils/index'
import business from '../../../../utils/business'
const ApiUser = require('../../../../api/user')

const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    invitePopupVisible: false,
    resData: {},
    userInfo: {},
    splitData: {},
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
    wx.hideShareMenu()
    this.setData(getDefaultData(options, this))
    this.getInfo()
    this.userInfo(options)
  },

  onUnload () {
    this.clearInterval()
  },
  clearInterval () {
    clearInterval(this.data.resData._timer)
  },

  userInfo (options) {
    if (options.userid || options.empid) {
      ApiUser.userInfo({
        data: { id: options.userid || options.empid },
        success: (res) => {
          this.setData({ userInfo: res.data })
        }
      })
    }
  },

  getInfo () {
    this.clearInterval()
    ApiCouponSplit.info({
      data: {
        couponId: this.options.id,
        parentId: this.options.parentId || 0
      },
      success: res => {
        const resData = res.data
        // resData.status = 5 // 测试数据。
        // resData.isSelf = false // 测试数据。
        // resData.shortNum = 9 // 测试数据。
        // resData.distNum = 10 // 测试数据。
        // resData.topImg = 'https://www.sbxx.top/static-no-cache/test/zero/img.jpg' // 测试数据。
        resData.price = resData.price.split('.')[0]
        if (resData.status === 1) {
          timeCountDown({
            seconds: resData.countDown,
            callback: {
              run: (json) => {
                resData.remainingSecondsFormat = json
                this.setData({ resData })
              },
              over: () => {
                this.onPullDownRefresh()
              }
            }
          })
          resData._timer = timeCountDown.timer
        }
        this.setData({ resData })
        business.tjPreview({ ApiUser, options: this.options, id: resData.id, kind: 1, pageThis: this })
      }
    })
  },

  create () { // 立即领取(也是立即参与)
    const resData = this.data.resData
    ApiCouponSplit.create({
      data: {
        couponId: resData.id,
        inviteUserId: this.options.userid || this.options.empid || '',
        parentId: resData.parentId || 0
      },
      success: (res) => {
        this.setData({ splitData: res.data })
        this.getInfo()
      }
    })
  },
  join () { // 立即参与瓜分红包
    const resData = this.data.resData
    ApiCouponSplit.create({
      data: {
        couponId: resData.id,
        inviteUserId: this.options.userid || this.options.empid || '',
        parentId: resData.parentId || 0
      },
      success: (res) => {
        this.setData({ splitData: res.data })
        if (res.data.shortNum !== 0) {
          this.popupShow()
        }
        this.getInfo()
      }
    })
  },
  reCreate () { // 瓜分新红包
    const resData = this.data.resData
    ApiCouponSplit.reCreate({
      data: {
        recordList: resData.recordList,
        couponId: resData.id,
        inviteUserId: this.options.userid || this.options.empid || '',
        parentId: resData.parentId || 0
      },
      success: () => {
        this.getInfo()
      }
    })
  },

  onPullDownRefresh () {
    this.clearInterval()
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage () {
    this.shareForward()
    let shareParams = {}
    const shareData = this.data.resData
    const userid = wx.getStorageSync('userid')
    const empidCommission = wx.getStorageSync('empidCommission')
    shareParams = {
      path: `/pages-subpackages/promotion/pages/coupon-split/index?id=${shareData.id}${shareData.parentId ? `&parentId=${shareData.parentId}` : ''}${userid ? `&userid=${userid}` : ''}${empidCommission ? `&empid=${empidCommission}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的券，快来一起瓜分吧。`,
      imageUrl: shareData.topImg
    }
    return shareParams
  },
  onShareCouponsSplit (e) {
    const dataset = e.currentTarget.dataset
    const { item } = dataset
    let scene = business.sceneStringify({
      pageId: 2,
      storeId: wx.getStorageSync('storeId'),
      userid: wx.getStorageSync('userid'),
      empid: wx.getStorageSync('empidCommission'),
      id: item.id,
      parentId: item.parentId
    })
    this.setData({
      shareData: item,
      imgList: [item.topImg],
      showShareCoupons: true,
      activePrice: item.price,
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的券，快来一起瓜分吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved () {
    this.shareForward()
  },
  shareForward () {
    business.tjForward({ ApiUser, id: this.data.resData.id, kind: 1 })
  },
  close () {
    this.setData({ showShareCoupons: false })
  },

  popupShow () {
    this.setData({ invitePopupVisible: true })
  },
  popupHide () {
    this.setData({ invitePopupVisible: false })
  },

  goToUse () {
    const resData = this.data.resData
    wx.navigateTo({ url: `/pages/coupon-goods/coupon-goods?id=${resData.id}&type=${resData.activeGoods}` })
  }
})
