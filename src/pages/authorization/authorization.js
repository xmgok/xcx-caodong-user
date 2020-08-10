import business from '../../utils/business'
const ApiUser = require('../../api/user')
const { DEFAULT_AVATAR_URL, DEFAULT_NICK_NAME } = require('../../utils/consts')
const app = getApp()

Page({
  data: {
    brandBrief: {}
  },

  onLoad (options) {
    ApiUser.brandBrief({
      success: ({ data }) => {
        console.log(data)
        wx.setStorageSync('brandName', data.name)
        this.setData({ brandBrief: data })
      }
    })
    options.type && this.setData({ type: options.type })
  },

  bindGetUserInfo ({ detail }) {
    const userInfo = detail.userInfo
    if (!userInfo) {
      wx.showToast({ title: `获取用户信息失败`, icon: 'none', duration: 3000 })
      return
    }
    if (!userInfo.avatarUrl) {
      userInfo.avatarUrl = DEFAULT_AVATAR_URL
      wx.showToast({ title: `授权成功但未获取到头像固使用系统默认头像`, icon: 'none', duration: 3000 })
    }
    if (!userInfo.nickName) {
      userInfo.nickName = DEFAULT_NICK_NAME
      wx.showToast({ title: `授权成功但未获取到昵称固使用系统默认昵称`, icon: 'none', duration: 3000 })
    }
    app.data.isLogin = false // 猜测某些机型点授权没反应需要这行代码去解决。但是按照代码路程走，不应该是这个问题。先放着，等找到问题再干掉这行。也有可能是接口那里和跳转那里出了问题。
    ApiUser.edit({
      data: {
        headUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        gender: userInfo.gender,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country
      },
      success: () => {
        wx.setStorageSync('nickName', userInfo.nickName)
        wx.setStorageSync('headUrl', userInfo.avatarUrl)
        if (this.options.refererUrl) {
          const refererUrl = decodeURIComponent(this.options.refererUrl)
          wx[business.isTabBarUrl(refererUrl) ? 'reLaunch' : 'redirectTo']({ url: refererUrl })
          return
        }
        wx.reLaunch({ url: '/pages/index/index' })
      }
    })
  },
  cancel () {
    const { pages } = business.getCurrentPage()
    if (pages.length >= 2) {
      wx.navigateBack({ delta: 1 })
    } else {
      wx.reLaunch({ url: '/pages/index/index' })
    }
    // wx.showModal({
    //   content: '取消之后无法体验部分功能！',
    //   success: (res) => {
    //     if (res.confirm) {
    //       const { pages } = business.getCurrentPage()
    //       if (pages.length >= 2) {
    //         wx.navigateBack({ delta: 1 })
    //       } else {
    //         wx.reLaunch({ url: '/pages/index/index' })
    //       }
    //     }
    //   }
    // })
  },
  bindgetphonenumber (e) {
    business.bindGetPhoneNumber(e, app, this)
  },
  sendPhoneNumber (datas = {}) {
    business.sendPhoneNumber(datas, ApiUser, this, (obj) => {
      this.setData({ isShow: false })
      this.triggerEvent('success', obj)
      if (this.options.refererUrl) {
        const refererUrl = decodeURIComponent(this.options.refererUrl)
        wx[business.isTabBarUrl(refererUrl) ? 'reLaunch' : 'redirectTo']({ url: refererUrl })
        return
      }
      wx.reLaunch({ url: '/pages/index/index' })
    })
  }
})
