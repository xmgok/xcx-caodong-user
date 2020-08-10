import business from '../../utils/business'

const ApiHome = require('../../api/home')
const ApiProduct = require('../../api/product')
const ApiGroup = require('../../api/group')
const ApiUser = require('../../api/user')
const ApiSeller = require('../../api/seller')
const ApiCommon = require('../../api/common')
const app = getApp()

Page({
  data: {
    reachBottomNum: 0,
    refreshNum: 0,
    iPad: wx.getStorageSync('iPad'),
    userType: '',
    storeName: '上海市浦东新区宣桥镇',
    shareData: null,
    brandBrief: {},
    showRegisterNotice: true,
    showReturnTop: false,
    system: 'ios',
    top0top: 0,
    activityList: [],
    customData: [],
    isPreview: 0, // 0非预览模式，1预览模式
    showTooltip: false,
    // bar
    statusBarHeight: 0,
    titleBarHeight: 0,
    // 切换门店
    switchStoreTooltipText: ''
  },

  onLoad (options) {
    console.log('首页 onLoad')
    const { hasSwitchStore, isAuthLocation } = app.globalData
    let { switchStoreTooltipText } = this.data
    switchStoreTooltipText = isAuthLocation ? '已为你选择附近门店' : '你已进入推荐门店'
    hasSwitchStore && (switchStoreTooltipText = '已为你选择目标门店')
    this.setData({
      changeStore: wx.getStorageSync('changeStore'),
      hasSwitchStore, // 消费者是否手动切换了门店
      isAuthLocation, // 消费者有没有授权位置
      switchStoreTooltipText,
      jobType: wx.getStorageSync('jobType'), // 0店员 1店长
      parentIsSeller: wx.getStorageSync('parentIsSeller'),
      showTooltip: true,
      storeName: wx.getStorageSync('storeName'),
      userType: wx.getStorageSync('userType')
    })

    setTimeout(() => {
      this.setData({ showTooltip: false })
      this.openSwitchStoreTooltip()
    }, 5000)

    let { scene } = options
    scene = business.sceneParse(scene)
    if (Object.keys(scene).length) {
      const reffer = scene.reffer
      console.log(`reffer:${reffer}`)
      reffer && wx.setStorageSync('reffer', reffer)
      this.setData({ isPreview: +scene.preview || 0, previewId: +scene.id || '' })
    } else if (options.mobile) {
      app.data.isLogin = true
      wx.showLoading({ title: '登录中' })
      wx.login({
        fail: ({ errMsg }) => wx.showToast({ title: `${errMsg}`, icon: 'none', duration: 3000 }),
        success: ({ code }) => {
          app.ajax({
            url: '/user/login',
            data: { code, authAppId: app.config.appid, mobile: options.mobile },
            success: ({ data }) => {
              app.data.isLogin = false
              wx.hideLoading()
              business.loginSetStorage(data)
              if (data.headUrl) {
                wx.reLaunch({ url: '/pages/index/index' })
              } else {
                wx.reLaunch({ url: '/pages/authorization/authorization' })
              }
            }
          })
        }
      })
      return
    }

    if (this.data.userType === 'customer' && !this.data.parentIsSeller) {
      this.getInfo() // 获取首页模板
      this.getHomeInfo()
      ApiCommon.popup({
        success: ({ data }) => {
          this.setData({ activityList: data })
        }
      })
    }
  },

  onUnload () {
    console.log('首页 onUnload')
  },

  onHide () {
    console.log('首页 onHide')
    wx.showTabBar()
  },

  onShow () {
    wx.showTabBar()
    if (this.data.userType === 'staff') {
      wx.hideTabBar()
    }
    this.setData({ storeName: wx.getStorageSync('storeName') })
    console.log('首页 onShow')

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
    this.setData({ refreshNum: ++this.data.refreshNum })
    if (this.data.userType === 'customer' && !this.data.parentIsSeller) {
      this.setData({ customData: [], brandBrief: {} })
      this.getInfo()
      this.getHomeInfo()
    }
  },
  getInfo () {
    if (wx.getStorageSync('userType') === 'staff') {
      return
    }
    const data = {
      previewId: this.data.previewId, // 预览id
      isPreview: this.data.isPreview // 0非预览模式，1预览模式
    }
    if (!this.data.isPreview) {
      delete data.previewId
    }
    ApiHome.getHome({
      data,
      success: ({ data }) => {
        if (!data) return
        this.setData({ customData: JSON.parse(data.content) })
      }
    })
  },
  getHomeInfo () {
    ApiUser.brandBrief({
      success: ({ data = {} }) => {
        this.setData({ brandBrief: data, showRegisterNotice: !data.isVip })
        wx.setStorageSync('brandName', data.name)
        wx.setNavigationBarTitle({ title: data.name })
      }
    })
  },
  onShareAppMessage ({ from, target }) {
    const shareData = this.data.customData.find(v => v.type === 8) || { data: {} }
    const empidCommission = wx.getStorageSync('empidCommission')
    let shareParams = {}
    if (from === 'menu') {
      // imageUrl: this.data.brandBrief.logoUrl || ''
      shareParams = {
        path: `/pages/index/index${empidCommission ? `?empid=${empidCommission}` : ''}`,
        title: shareData.data.shareTitle || this.data.brandBrief.name || ''
      }
      if (shareData.data.shareImg) {
        shareParams.imageUrl = shareData.data.shareImg
      }
    }
    if (from === 'button' && !target.dataset.activeType) {
      const { product, checkIdList, imgList } = this.data.shareData
      ApiProduct.transmit({
        data: {
          id: product.id,
          mids: checkIdList
        }
      })
      ApiUser.transferAdd({
        data: {
          productId: product.id,
          productCode: product.productCode || '',
          price: product.price || 0,
          addPrice: 0
        }
      })
      shareParams = {
        path: `/pages/product/product?id=${product.id}${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: product.name || '',
        imageUrl: imgList[0]
      }
    }
    if (from === 'button' && target.dataset.activeType === 'group') { // 分享拼团活动
      const obj = target.dataset.item
      ApiGroup.forward({
        data: {
          empId: empidCommission,
          groupId: obj.id,
          type: 1 // 类型 1转发 2浏览
        }
      })
      shareParams = {
        path: `/pages/product/product?id=${obj.productId}&activeId=${obj.id}&activeType=group${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
        imageUrl: obj.productImg
      }
    }
    if (from === 'button' && target.dataset.activeType === 'employee') { // 虚拟导购邀请
      const loginId = wx.getStorageSync('loginId')
      ApiSeller.saveInvitationLog()
      shareParams = {
        title: '快来成为导购，赚佣金啦！',
        imageUrl: 'https://qiniu.icaodong.com/xcx/common/seller-share.png?v=1.0.0',
        path: `/pages-subpackages/seller/pages/seller-request/index?type=employee&parentId=${loginId}&empid=${loginId}`
      }
    }
    if (shareParams.path.indexOf('?') === -1) {
      shareParams.path += `?storeId=${wx.getStorageSync('storeId')}`
    } else {
      shareParams.path += `&storeId=${wx.getStorageSync('storeId')}`
    }
    console.log('分享的数据', shareParams)
    return shareParams
  },
  closeRegisterNotice () {
    this.setData({ showRegisterNotice: false })
  },
  onPageScroll ({ scrollTop }) {
    if (scrollTop > 200) {
      if (this.data.showReturnTop === false) {
        this.setData({
          showReturnTop: true
        })
      }
    } else if (this.data.showReturnTop === true) {
      this.setData({
        showReturnTop: false
      })
    }
  },
  officialLoad () {
    // 关注公众号组件 固定高度84 跟屏幕、系统都没关系
    // this.setData({ top0top: 84 })
  },
  closeActivity () {
    this.setData({ activityList: [] })
  },
  goActivityConfirm ({ currentTarget }) {
    const dataset = currentTarget.dataset
    const item = dataset.item
    // 数据类型  1-活动  2-瓜分券  3-预约
    if (dataset.type === 2) { // 瓜分券
      wx.navigateTo({ url: `/pages-subpackages/promotion/pages/coupon-split/index?id=${item.id}` })
    } else if (dataset.type === 3) { // 预约
      wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking/index` })
    } else { // 活动
      wx.navigateTo({ url: `/pages/activity-confirm/activity-confirm?id=${dataset.id}` })
    }
  },
  closeTooltip () {
    this.setData({ showTooltip: false })
    this.openSwitchStoreTooltip()
  },
  openSwitchStoreTooltip () {
    this.setData({ showSwitchStoreTooltip: true })
    // setTimeout(() => {
    //   this.setData({ showSwitchStoreTooltip: false })
    // }, 5000)
  },
  closeSwitchStoreTooltip () {
    this.setData({ showSwitchStoreTooltip: false })
  },
  switchStore () {
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-store/index?type=switchStore` })
  },

  onReady () {
    console.log('首页 onReady')
    this.handleCDNavigate()
  },
  onReachBottom () {
    this.setData({ reachBottomNum: ++this.data.reachBottomNum })
  },
  // 处理超导跳转
  handleCDNavigate () {
    if (wx.getStorageSync('isCDNavigate')) {
      const query = wx.getStorageSync('CDNavigateQuery')
      wx.redirectTo({ url: `/pages/mini-navigate/mini-navigate${query}` })
      return true
    }
    return false
  }
})
