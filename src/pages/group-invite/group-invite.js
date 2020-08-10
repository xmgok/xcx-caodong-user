import ApiCart from '../../api/cart'
import { timeCountDown } from '../../utils/index'
import business from '../../utils/business'

const ApiGroup = require('../../api/group')
// const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
// const app = getApp()

Page({
  data: {
    recordId: '', // options上需要这个入参用来拿拼团详情数据
    userid: '', // options上需要这个入参用来展示用户头像
    groupInfo: {},
    showPurchase: false,
    userInfo: {},
    isAuth: true // 假设默认已经授权了头像和昵称
  },

  onLoad ({ recordId, userid, empid, scene = '' }) {
    scene = business.sceneParse(scene)
    userid = scene.userid || scene.empid || userid || empid
    recordId = scene.recordId || recordId
    this.setData({ recordId, userid })
    this.init()
  },

  recordInfo () {
    wx.showLoading({ title: '加载中...' })
    ApiGroup.recordInfo({
      data: { recordId: this.data.recordId },
      success: (res) => {
        wx.hideLoading()
        const groupInfo = res.data
        this.setData({ groupInfo })
        timeCountDown({
          seconds: groupInfo.countDown,
          callback: {
            run: (json) => {
              groupInfo.remainingSecondsFormat = json
              this.setData({ groupInfo })
            },
            over: () => {
            }
          }
        })
        this.timer = timeCountDown.timer
      }
    })
  },

  goJoinGroup () {
    this.setData({
      showPurchase: true
    })
  },

  init () {
    this.clearTimer()
    this.recordInfo()
    this.userInfo()
    ApiUser.getuser({
      success: (res) => {
        // 如果接口里没有头像或没有昵称，则检测有无授权头像(默认按照已经授权了头像进行处理)
        if (!res.data.headUrl || !res.data.nickName) {
          this.fnIsAuth()
        }
      }
    })
  },

  userInfo () {
    ApiUser.userInfo({
      data: { id: this.data.userid },
      success: (res) => {
        this.setData({ userInfo: res.data })
      }
    })
  },

  scrollToUpper (e) {
    console.log(e)
  },

  onPullDownRefresh () {
    this.init()
    wx.stopPullDownRefresh()
  },

  onUnload () {
    this.clearTimer()
  },

  clearTimer () {
    this.timer && clearInterval(this.timer)
  },
  goodsPurchaseClose ({ detail }) {
    // this.setData({
    //   chooseNum: (detail.quantity || 1),
    //   chooseSpec: (detail.spec || '')
    // })
  },
  goodsPurchaseSelected ({ detail }) {
    this.setData({ showPurchase: false })
    if (detail.buyType === 'cart') { // 加入购物车
      ApiCart.add({
        data: {
          number: detail.quantity,
          specId: detail.spec.id
        },
        success: (res) => {
          wx.showToast({ title: res.message, icon: 'none' })
        }
      })
      return
    }
    // 加入购物车 cart
    // 立即购买 buy
    // 单独购买 groupAloneBuy
    // 开团 groupOpenBuy
    // 参团 groupJoinBuy
    wx.setStorageSync('to-order-confirm-active-data', {
      buyType: detail.buyType,
      activeId: detail.activeId,
      activeType: detail.activeType,
      recordId: detail.recordId // 参团需要这个id
    })
    wx.setStorageSync('to-order-confirm', [{
      productId: detail.spec.productId,
      specId: detail.spec.id,
      productNum: detail.quantity
    }])
    wx.navigateTo({ url: '../order-confirm/order-confirm' })
  },

  bindgetuserinfo () {
    wx.getUserInfo({
      success: (res) => {
        this.setData({ isAuth: true })
        ApiUser.edit({
          data: { headUrl: res.userInfo.avatarUrl, nickName: res.userInfo.nickName },
          success: () => {
            this.goJoinGroup() // 优化之获取完用户信息后弹窗
            wx.setStorageSync('nickName', res.userInfo.nickName)
            wx.setStorageSync('headUrl', res.userInfo.avatarUrl)
          }
        })
      }
    })
  },

  fnIsAuth () {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: () => {
              this.setData({ isAuth: true })
            }
          })
        } else {
          this.setData({ isAuth: false })
        }
      }
    })
  }
})
