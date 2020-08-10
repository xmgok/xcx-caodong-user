import business from '../../utils/business'

const ApiGroupPhoto = require('../../api/group-photo')

Page({
  data: {
    showCouponPopup: false,
    info: {}
  },

  onLoad (options) {
    // 解析scene和普通参数 --- 开始
    const scene = business.sceneParse(options.scene)
    options = { ...options, ...scene }
    this.options = options
    this.setData({ options })
    // 解析scene和普通参数 --- 结束

    wx.showLoading({ title: '加载中' })
    ApiGroupPhoto.info({
      success: ({ data }) => {
        this.setData({ info: data })
        wx.hideLoading()
        ApiGroupPhoto.forward({
          data: {
            empId: wx.getStorageSync('empidCommission'),
            forwarderId: wx.getStorageSync('userid') || wx.getStorageSync('empid'),
            groupPhotoId: data.id,
            type: 2
          }
        })
      }
    })
  },
  handleTap () {
    getCurrentPages().length > 1 ? wx.navigateBack({ delta: 1 }) : wx.switchTab({ url: '/pages/index/index' })
  },
  onShowCouponPopup () {
    this.setData({ showCouponPopup: true })
  },
  onClose () {
    this.setData({ showCouponPopup: false })
  },
  goCameraPhotoDetail () {
    wx.getSetting({
      success: ({ authSetting }) => {
        if (authSetting['scope.camera'] !== undefined && authSetting['scope.camera'] === false) {
          wx.openSetting()
        } else {
          wx.navigateTo({ url: '/pages/camera-photo-detail/camera-photo-detail' })
        }
      }
    })
  },
  onShareAppMessage () {
    const userid = wx.getStorageSync('userid')
    const empId = userid ? wx.getStorageSync('empidCommission') : wx.getStorageSync('empid')
    ApiGroupPhoto.forward({
      data: {
        empId,
        forwarderId: userid || wx.getStorageSync('empid'),
        groupPhotoId: this.data.info.id,
        ...this.data.forwardData,
        type: 1 // 类型 1转发 2浏览
      }
    })

    const path = `/pages/camera-photo/camera-photo?${userid ? `&userid=${userid}` : ''}${empId ? `&empid=${empId}` : ''}&storeId=${wx.getStorageSync('storeId')}`
    return { path, title: '活动详情' }
  }
})
