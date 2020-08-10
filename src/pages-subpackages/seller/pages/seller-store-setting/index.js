const ApiSeller = require('../../../../api/seller')
const { DEFAULT_AVATAR_URL } = require('../../../../utils/consts')
const qiniuUploader = require('../../../../utils/qiniuUploader')
const mixins = require('../../../../utils/mixins')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    resData: {},
    options: {},
    DEFAULT_AVATAR_URL,
    bankList: [
      {
        id: 0,
        name: '美国'
      },
      {
        id: 1,
        name: '中国'
      },
      {
        id: 2,
        name: '巴西'
      },
      {
        id: 3,
        name: '日本'
      }
    ],
    form: {
      logo: '',
      shopName: ''
    }
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
    this.shopInfo()
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

  bindBankChange ({ detail }) {
    let form = this.data.form
    form.bankId = detail.value
    form.bankName = this.data.bankList.find(v => +v.id === +form.bankId).name
    this.setData({ form })
  },

  bindRegionChange ({ detail }) {
    let form = this.data.form
    form.region = detail.value
    this.setData({ form })
  },

  onUploadImg (tempFilePaths) {
    this.getQiniuToken((qiniuInfo) => {
      qiniuInfo = qiniuInfo.data || {}
      const suffix = tempFilePaths.split('.')
      qiniuUploader.upload(tempFilePaths, (ress) => {
        const form = this.data.form
        form.logo = ress.imageURL
        this.setData({ form })
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

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  shopInfo () {
    ApiSeller.shopInfo({
      success: (res) => {
        const form = {
          logo: res.data.logo,
          shopName: res.data.shopName
        }
        this.setData({ form, shopInfoData: res.data })
      }
    })
  },

  submit () {
    const form = this.data.form
    if (!form.logo) {
      wx.showToast({ title: `请上传店铺头像`, icon: 'none', duration: 3000 })
      return
    }
    if (!form.shopName) {
      wx.showToast({ title: `请输入店铺名称`, icon: 'none', duration: 3000 })
      return
    }
    ApiSeller.setShopInfo({
      data: form,
      success: () => {
        wx.showToast({ title: `保存成功`, icon: 'none', duration: 3000 })
        wx.navigateTo({ url: '/pages-subpackages/seller/pages/seller-my/index' })
      }
    })
  },

  ...mixins
})
