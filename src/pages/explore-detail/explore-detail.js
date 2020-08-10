const ApiMaterial = require('../../api/material')
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
const app = getApp()
const VIDEO_IMG_SUFFIX = app.VIDEO_IMG_SUFFIX

Page({
  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    userType: '',
    materialList: [],
    getEnd: false,
    imgUrl: [],
    infoData: {},
    id: [],
    productId: '',
    showPurchase: false,
    productInfo: {},
    empId: '',
    videoUrl: '',
    showShare: false,
    showFullscreenBtn: false
  },
  onLoad ({ id = '', productId = '' }) {
    wx.hideShareMenu()
    wx.showLoading({ title: '加载中' })
    this.setData({
      id: id.split(','),
      productId,
      empId: wx.getStorageSync('empidCommission'),
      userType: wx.getStorageSync('userType')
    })
    ApiMaterial.info({
      params: { materialId: id, productId },
      success: ({ data }) => {
        const materialList = data.materialList || []
        let videoUrl = ''
        let imgUrl = (data.imgUrl && data.imgUrl.split(',')) || []
        if (data.type > 1) {
          videoUrl = imgUrl[0]
          imgUrl[0] = `${imgUrl[0]}${VIDEO_IMG_SUFFIX}`
        }
        wx.hideLoading()
        this.setData({ materialList, imgUrl, videoUrl, getEnd: true, infoData: { ...data } })
      }
    })
    ApiProduct.getInfo({
      params: { id: productId },
      success: ({ data }) => {
        data['_price'] = data.price.split('.')
        this.setData({ productInfo: data })
      }
    })
  },
  previewImage () {
    wx.previewImage({ urls: this.data.imgUrl })
  },
  saveImg () {
    wx.getSetting({
      success: ({ authSetting }) => {
        if (authSetting['scope.writePhotosAlbum'] === false) {
          wx.openSetting({
            success: () => {
              this.saveImg2()
            }
          })
        } else {
          this.saveImg2()
        }
      }
    })
  },
  saveImg2 () {
    wx.showLoading({ title: '保存中' })
    let num = 0
    const isVideo = this.data.infoData.type > 1
    this.data.infoData.imgUrl.split(',').forEach((item, index) => {
      wx[isVideo ? 'downloadFile' : 'getImageInfo']({
        [isVideo ? 'url' : 'src']: item,
        success: (sres) => {
          wx[isVideo ? 'saveVideoToPhotosAlbum' : 'saveImageToPhotosAlbum']({
            filePath: (isVideo ? sres.tempFilePath : sres.path),
            complete: ({ errMsg }) => {
              num++
              if (num >= this.data.imgUrl.length) {
                wx.hideLoading()
              }
              if (errMsg === (isVideo ? 'saveVideoToPhotosAlbum:ok' : 'saveImageToPhotosAlbum:ok')) {
                wx.showToast({ title: '保存成功', icon: 'success', duration: 2000 })
                ApiMaterial.updateusetotal({ data: { id: this.data.id[index] } })
              } else {
                wx.hideLoading()
              }
            }
          })
        }
      })
    })
  },
  report () {
    const ids = this.data.id
    let count = 0
    ids.forEach((item) => {
      ApiMaterial.report({
        data: { id: item },
        success: () => {
          count++
          if (count >= ids.length) {
            wx.showToast({ title: '已反馈，谢谢您', icon: 'none', duration: 2000 })
          }
        }
      })
    })
  },
  bindPurchase () {
    this.setData({ showPurchase: true })
  },
  goChooseImg () {
    this.setData({ showShare: true })
  },
  goodsPurchaseSelected ({ detail }) {
    this.setData({ showPurchase: false })
    let goods = [
      {
        productId: detail.spec.productId,
        specId: detail.spec.id,
        productNum: detail.quantity
      }
    ]
    wx.setStorage({
      key: 'to-order-confirm',
      data: goods,
      success () {
        wx.navigateTo({ url: '../order-confirm/order-confirm' })
      }
    })
  },
  onShareAppMessage () {
    const imgUrl = this.data.imgUrl
    ApiProduct.transmit({
      data: {
        id: this.data.productId,
        mids: this.data.id
      }
    })
    ApiUser.transferAdd({
      data: {
        productId: this.data.productId,
        productCode: this.data.productInfo.productCode || '',
        price: this.data.productInfo.price || 0,
        addPrice: 0
      }
    })
    const empid = this.data.empId
    return {
      title: this.data.productInfo.name || '',
      path: `/pages/product/product?id=${this.data.productId}${empid ? `&empid=${empid}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      imageUrl: imgUrl[0]
    }
  }
})
