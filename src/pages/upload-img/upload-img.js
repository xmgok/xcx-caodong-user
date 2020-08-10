const qiniuUploader = require('../../utils/qiniuUploader')
const ApiMaterial = require('../../api/material')
const ApiProduct = require('../../api/product')
const app = getApp()

Page({
  data: {
    form: {
      isOpen: true,
      istag: false
    },
    imgList: [],
    productId: '',
    productInfo: {}
  },
  onLoad ({ productId }) {
    this.setData({ productId })
    this.getDetails()
  },
  getDetails () {
    ApiProduct.getInfo({
      params: { id: this.data.productId },
      success: ({ data }) => {
        this.setData({ productInfo: data })
      }
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
  uploadImg () {
    let imgList = this.data.imgList
    const count = 9 - imgList.length
    wx.chooseImage({
      count,
      success: ({ tempFilePaths }) => {
        wx.showLoading({ title: '上传中' })
        this.onUploadImg(tempFilePaths)
      }
    })
  },
  onUploadImg (tempFilePaths) {
    let imgList = this.data.imgList
    this.getQiniuToken((qiniuInfo) => {
      qiniuInfo = qiniuInfo.data || {}
      tempFilePaths.forEach((item, index) => {
        const suffix = item.split('.')
        qiniuUploader.upload(item, (ress) => {
          imgList.push({ url: ress.imageURL, name: ress.hash })
          this.setData({ imgList })
          if (index >= tempFilePaths.length - 1) {
            wx.hideLoading()
            this.yzistag()
          }
        }, (error) => {
          console.log('error: ' + error)
        }, {
          key: `${app.config.tenantId}_${new Date().getTime()}_${String(Math.random()).substr(10)}_${index}.${suffix[suffix.length - 1]}`,
          region: 'ECN',
          uploadURL: app.config.uploadImgPath,
          domain: qiniuInfo.domain,
          uptoken: qiniuInfo.uptoken,
          shouldUseQiniuFileName: false // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
        })
      })
    })
  },
  delImg ({ currentTarget }) {
    const index = currentTarget.dataset.index
    let imgList = this.data.imgList
    imgList.splice(index, 1)
    this.setData({ imgList })
    this.yzistag()
  },
  previewImage ({ currentTarget }) {
    const index = currentTarget.dataset.index
    wx.previewImage({ current: this.data.imgList[index], urls: this.data.imgList })
  },
  checkChange ({ currentTarget }) {
    const type = currentTarget.dataset.type
    let form = this.data.form
    form[type] = !form[type]
    this.setData({ form })
    this.yzistag()
  },
  updatematerialtag () {
    if (this.data.imgList.length <= 0) return
    let materialList = []
    let imgUrl = []
    this.data.imgList.forEach((item) => {
      imgUrl.push(item.url)
      materialList.push({
        imgName: item.name,
        imgUrl: item.url,
        rank: 0,
        type: 1
      })
    })
    ApiMaterial.updatematerialtag({
      data: {
        prductId: this.data.productId,
        isOpen: (this.data.form.isOpen ? 1 : 0),
        istag: (this.data.form.istag ? 1 : 0),
        materialList
      },
      success: ({ code, message, data }) => {
        console.log(data)
        wx.showToast({ title: (message || ''), icon: (code === 'success' ? 'SUCCESS' : 'none'), duration: 1000 })
        let chooseimg = []
        let checkId = []
        data.forEach((item) => {
          chooseimg.push(item.imgUrl)
          checkId.push(item.id)
        })
        setTimeout(() => {
          wx.redirectTo({ url: `/pages/choose-img/choose-img?productId=${this.data.productId}&chooseimg=${chooseimg.join(',')}&checkIdList=${checkId.join(',')}` })
        }, 1100)
      }
    })
  },
  yzistag () {
    if (this.data.imgList.length < 2) {
      const form = this.data.form
      form.istag = false
      this.setData({ form })
    }
  }
})
