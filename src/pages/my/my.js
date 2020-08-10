import ApiCoupon from '../../api/coupon'
import variables from '../../utils/variables'
import business from '../../utils/business'

const ApiUser = require('../../api/user')
const ApiSeller = require('../../api/seller')
const ApiOrder = require('../../api/order')
const ApiCustomerorders = require('../../api/customerorders')
const WxCharts = require('../../utils/wxcharts')

const app = getApp()

Page({
  data: {
    userType: '',
    headUrl: '',
    nickName: '',
    name: '',
    countData: {},
    storeName: '',
    couponNum: 0,
    showRegisterNotice: true,
    cardLevel: '',
    sellerData: {},
    totalStateNumber: {}
  },
  onLoad () {
    wx.hideShareMenu()
    this.setData({
      loginId: wx.getStorageSync('loginId'),
      userType: wx.getStorageSync('userType')
    })
  },
  onShow () {
    this.setData({ showPhoneLogin: wx.getStorageSync('nickName') && wx.getStorageSync('headUrl') })
    if (this.data.userType === 'customer') {
      ApiUser.getuser({
        success: ({ data }) => {
          const headUrl = data.headUrl || ''
          const name = data.name || ''
          const nickName = data.nickName || ''
          const constellation = data.constellation || ''
          const storeName = data.storeName || ''
          const cardLevel = data.cardLevel || ''
          this.setData({ headUrl, nickName, constellation, storeName, name, cardLevel })
        }
      })
      ApiUser.brandBrief({
        success: ({ data = {} }) => {
          wx.setStorageSync('brandName', data.name)
          this.setData({ showRegisterNotice: !data.isVip })
        }
      })
      ApiCoupon.couponMyNew({
        params: {
          pageNum: 1,
          pageSize: 10,
          type: 1
        },
        success: res => {
          this.setData({
            couponNum: res.data.totalCount
          })
        }
      })
      ApiSeller.getdistInfo({
        success: (res) => {
          this.setData({ sellerData: res.data })
        }
      })

      ApiOrder.totalStateNumber({
        success: ({ data }) => {
          this.setData({ totalStateNumber: data })
        }
      })
    }
    if (this.data.userType === 'staff') {
      ApiUser.getuser({
        success: ({ data }) => {
          const headUrl = data.headUrl || ''
          const name = data.name || ''
          const nickName = data.nickName || ''
          const constellation = data.constellation || ''
          const storeName = data.storeName || ''

          this.setData({ headUrl, nickName, constellation, storeName, name })
        }
      })
      ApiUser.achievement({
        success: ({ data }) => {
          this.setData({
            countData: data || {}
          })
        }
      })
      ApiCustomerorders.history({
        params: { days: 7 },
        success: ({ data }) => {
          let cateGory = data.map(item => {
            return item.assetDate
          })
          let cateData = data.map(item => {
            return Number(item.achievement)
          })

          const xx = new WxCharts({
            canvasId: 'lineCanvas',
            type: 'column',
            categories: cateGory,
            series: [{
              name: '业绩',
              data: cateData,
              color: variables['$primary-staff'],
              format: function (val) {
                return '￥' + val.toFixed(2)
              }
            }],
            // 经测试，只有下面这4个颜色和上面那1个可以修改。
            xAxis: {
              gridColor: '#979797',
              fontColor: '#96989C'
            },
            yAxis: {
              gridColor: '#979797',
              fontColor: '#96989C',
              format: function (val) {
                return val.toFixed(2)
              },
              min: 0
            },
            width: 350,
            height: 240
          })
          console.log(xx)
        }
      })
      ApiCoupon.couponMyNew({
        params: {
          pageNum: 1,
          pageSize: 10,
          type: 1
        },
        success: res => {
          this.setData({
            couponNum: res.data.totalCount
          })
        }
      })
      ApiSeller.getdistInfo({
        success: (res) => {
          this.setData({ sellerData: res.data })
        }
      })
    }
  },
  goBookingDetail ({ currentTarget: { dataset: { url } } }) {
    wx.navigateTo({ url })
  },
  showMsg () {
    wx.showToast({
      title: '即将上线',
      icon: 'none',
      duration: 2000
    })
    return false
  },
  mySeller (e) {
    // 检测当前用户是否是分销商
    const loginId = wx.getStorageSync('loginId')
    ApiSeller.isDistributor({
      data: { duserId: loginId },
      success: (res) => {
        const isSeller = res.data.distributor
        wx.setStorageSync('isSeller', isSeller)
        if (isSeller) {
          // 获取店铺信息(后打这个接口的原因是因为如果不是分销商调这个接口会抛500)
          ApiSeller.shopInfo({
            success: (res2) => {
              if (!res2.data.logo) {
                wx.navigateTo({ url: '/pages-subpackages/seller/pages/seller-store-setting/index' })
                return
              }
              if (res.data.storeId !== wx.getStorageSync('storeId')) { // 是分销商，但是跑到了别人家的门店，此处进行回归处理，回归到分销商的门店。
                wx.setStorageSync('empidResetRoleAndStore', loginId) // 此值用来切换身份和门店。
                wx.removeStorageSync('empidOldValue')
                app.login({ redirectUrl: '/pages-subpackages/seller/pages/seller-my/index' })
              } else {
                wx.setStorageSync('empid', loginId)
                wx.setStorageSync('empidCommission', loginId)
                wx.navigateTo({ url: '/pages-subpackages/seller/pages/seller-my/index' })
              }
            }
          })
        } else {
          wx.navigateTo({ url: e.currentTarget.dataset.url })
        }
      }
    })
  },
  bindsuccess () {
    this.onShow()
  },
  onShareAppMessage () {
    ApiSeller.saveInvitationLog()
    return {
      title: '快来成为导购，赚佣金啦！',
      imageUrl: 'https://qiniu.icaodong.com/xcx/common/seller-share.png?v=1.0.0',
      path: `/pages-subpackages/seller/pages/seller-request/index?type=employee&parentId=${this.data.loginId}&empid=${this.data.loginId}&storeId=${wx.getStorageSync('storeId')}`
    }
  },
  bindgetphonenumber (e) {
    business.bindGetPhoneNumber(e, app, this)
  },
  sendPhoneNumber (datas = {}) {
    business.sendPhoneNumber(datas, ApiUser, this)
  },
  goAuthUserInfo () {
    const { fullPath } = business.getCurrentPage()
    wx.navigateTo({ url: `/pages/authorization/authorization?refererUrl=${encodeURIComponent(fullPath)}` })
  },
  bindgetphonenumber2 (e) {
    business.bindGetPhoneNumber(e, app, this, 'sendPhoneNumber2')
  },
  sendPhoneNumber2 (datas = {}) {
    ApiUser.empAuthLogin({
      data: datas,
      success: ({ code, message, data }) => {
        wx.showToast({ title: message, icon: (code === 'SUCCESS' ? 'success' : 'none') })
        if (code === 'SUCCESS') {
          business.loginSetStorage(data)
          wx.reLaunch({ url: '/pages/index/index' })
        }
      },
      complete: () => {
        this.setData({ isBindGetPhoneNumber: false })
      }
    })
  }
})
