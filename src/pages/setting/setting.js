import business from '../../utils/business'
const ApiUser = require('../../api/user')
const ApiSeller = require('../../api/seller')
const qiniuUploader = require('../../utils/qiniuUploader')
const app = getApp()

Page({
  data: {
    inviteEmployeeQr: '',
    isShowQrM: false,
    isShowUpload: false,
    isShowHomeQr: false,
    isShowInviteEmployeeQr: false,
    upload: {
      maxLength: 1,
      list: []
    },
    userType: '',
    headUrl: '',
    nickName: '',
    birthday: '',
    mobile: '',
    empid: ''
  },
  onLoad () {
    const empid = wx.getStorageSync('empidCommission')
    const scene = business.sceneStringify({
      storeId: wx.getStorageSync('storeId'),
      empid,
      parentId: empid,
      type: 2 // seller(1邀请成为分销商) employee(2邀请成为虚拟导购)
    })
    this.setData({
      empid,
      userType: wx.getStorageSync('userType'),
      inviteEmployeeQr: `${app.config.domainPath}/mp/miniapp/qrcode?page=pages-subpackages/seller/pages/seller-request/index&token=${wx.getStorageSync('token')}&scene=${scene}&width=500`
    })
    ApiSeller.getdistInfo({
      success: (res) => {
        this.setData({ sellerData: res.data })
      }
    })
  },
  staffGetHomeCustomQr (res) {
    const { path, width, height } = res.detail
    this.setData({ staffHomeCustomQr: path, staffHomeCustomQrWidth: width, staffHomeCustomQrHeight: height })
  },
  showQrM () {
    this.setData({ isShowQrM: true })
  },
  hideQrM () {
    this.setData({ isShowQrM: false })
  },
  showHomeQr () {
    this.setData({ isShowHomeQr: true })
    this.hideQrM()
  },
  hideHomeQr () {
    this.setData({ isShowHomeQr: false })
  },
  showInviteEmployeeQr () {
    this.setData({ isShowInviteEmployeeQr: true })
    this.hideQrM()
  },
  hideInviteEmployeeQr () {
    this.setData({ isShowInviteEmployeeQr: false })
  },
  downLoadHomeQr () {
    wx.showLoading({ title: '图片下载中...' })
    wx.getImageInfo({
      src: this.data.staffHomeCustomQr,
      fail: (res) => {
        console.log('getImageInfo fail', res)
      },
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: () => {
            wx.showToast({ title: `图片下载成功`, icon: 'none', duration: 3000 })
            this.hideHomeQr()
          },
          fail: (res) => {
            console.log('saveImageToPhotosAlbum fail', res)
          },
          complete () {
            wx.hideLoading()
          }
        })
      }
    })
  },
  downLoadInviteEmployeeQr () {
    wx.showLoading({ title: '图片下载中...' })
    wx.getImageInfo({
      src: this.data.inviteEmployeeQr,
      fail: (res) => {
        console.log('getImageInfo fail', res)
      },
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: () => {
            wx.showToast({ title: `图片下载成功`, icon: 'none', duration: 3000 })
            this.hideInviteEmployeeQr()
          },
          fail: (res) => {
            console.log('saveImageToPhotosAlbum fail', res)
          },
          complete () {
            wx.hideLoading()
          }
        })
      }
    })
  },
  showUpload () {
    this.setData({ isShowUpload: true })
    this.hideQrM()
  },
  hideUpload () {
    this.setData({ isShowUpload: false })
  },
  onShow () {
    ApiUser.getuser({
      success: ({ data }) => {
        const headUrl = data.headUrl || ''
        const nickName = data.nickName || ''
        const birthday = data.birthday || ''
        const mobile = data.mobile || ''
        const upload = this.data.upload
        if (data.wxQrcode) {
          upload.list = [{ imgUrl: data.wxQrcode }]
        }
        this.setData({ headUrl, nickName, birthday, mobile, upload })
      }
    })
  },
  bindBirthdayChange ({ detail }) {
    this.setData({ birthday: detail.value })
    ApiUser.edit({
      data: { birthday: detail.value }
    })
  },
  editUserImg () {
    wx.chooseImage({
      count: 1,
      success: ({ tempFilePaths }) => {
        wx.showLoading({ title: '上传中' })
        this.onUploadImg(tempFilePaths[0])
      }
    })
  },
  onUploadImg (tempFilePaths) {
    this.getQiniuToken((qiniuInfo) => {
      qiniuInfo = qiniuInfo.data || {}
      const suffix = tempFilePaths.split('.')
      qiniuUploader.upload(tempFilePaths, (ress) => {
        ApiUser.edit({
          data: { headUrl: ress.imageURL }
        })
        wx.setStorageSync('headUrl', ress.imageURL)
        this.setData({ headUrl: ress.imageURL })
        wx.hideLoading()
      }, (error) => {
        console.log('error: ' + error)
      }, {
        key: `${app.config.tenantId}_${new Date().getTime()}_${String(Math.random()).substr(10)}.${suffix[suffix.length - 1]}`,
        region: 'ECN',
        uploadURL: app.config.uploadImgPath,
        domain: qiniuInfo.domain,
        uptoken: qiniuInfo.uptoken,
        shouldUseQiniuFileName: false // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
      })
    })
  },
  getQiniuToken (callback) {
    app.ajax({
      url: `/qiniu/uptoken`,
      type: 'get',
      success: (res) => {
        callback(res)
      }
    })
  },
  change (event) {
    this.setData({ upload: event.detail })
  },
  setStaffQr () {
    const list = this.data.upload.list
    const imgUrl = list[0] && list[0].imgUrl
    if (!imgUrl) {
      wx.showToast({ title: `请上传图片`, icon: 'none', duration: 3000 })
      return
    }
    ApiUser.edit({
      data: { wxQrcode: imgUrl },
      success: (res) => {
        wx.showToast({ title: res.message, icon: 'none', duration: 3000 })
        this.hideUpload()
      }
    })
  },
  bindGetUserInfo ({ detail }) {
    const userInfo = detail.userInfo
    if (!userInfo) return
    ApiUser.edit({
      data: { headUrl: userInfo.avatarUrl, nickName: userInfo.nickName },
      success: () => {
        wx.setStorageSync('nickName', userInfo.nickName)
        wx.setStorageSync('headUrl', userInfo.avatarUrl)
        wx.showToast({ title: '授权完毕', icon: 'none', duration: 3000 })
      }
    })
  },
  toCustomer () {
    wx.showModal({
      content: '确认要切换为消费者身份么？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('empidResetRoleAndStore', this.data.empid) // 此值用来切换身份和门店。
          wx.removeStorageSync('empidOldValue')
          app.login({ redirectUrl: '/pages/index/index' })
        }
      }
    })
  },
  clearStorage () {
    wx.clearStorageSync()
    wx.showToast({ title: `缓存清理成功`, icon: 'none', duration: 3000 })
  }
})
