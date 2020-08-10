const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')

Page({
  data: {
    userType: '',
    imgList: [],
    checkIdList: '',
    showShare: false,
    productId: '',
    productInfo: {}
  },
  onLoad ({ productId = '', chooseimg = '', checkIdList = '' }) {
    wx.hideShareMenu()
    this.setData({
      productId,
      userType: wx.getStorageSync('userType'),
      imgList: chooseimg.split(','),
      checkIdList: checkIdList.split(',')
    })
    this.getDetails()
  },
  getDetails () {
    ApiProduct.getDetails({
      params: { id: this.data.productId, type: 2 },
      success: ({ data }) => {
        this.setData({ productInfo: data })
      }
    })
  },
  delImg ({ currentTarget }) {
    const index = currentTarget.dataset.index
    let imgList = this.data.imgList
    let checkIdList = this.data.checkIdList
    if (imgList.length <= 1) {
      wx.showToast({ title: '最少选择1张', icon: 'none', duration: 1000 })
      return
    }
    imgList.splice(index, 1)
    checkIdList.splice(index, 1)
    this.setData({ imgList, checkIdList })
  },
  previewImage ({ currentTarget }) {
    const index = currentTarget.dataset.index
    wx.previewImage({ current: this.data.imgList[index], urls: this.data.imgList })
  },
  onShareAppMessage () {
    ApiProduct.transmit({
      data: {
        id: this.data.productId,
        mids: this.data.checkIdList
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

    const empid = wx.getStorageSync('empidCommission')
    const path = `/pages/product/product?id=${this.data.productId}${empid ? `&empid=${empid}` : ''}&storeId=${wx.getStorageSync('storeId')}`
    return {
      title: this.data.productInfo.name || '',
      path,
      imageUrl: this.data.imgList[0]
    }
  },
  onShare () {
    this.setData({ showShare: true })
  }
})
