const ApiMaterial = require('../../api/material')
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')

Page({
  data: {
    userType: '',
    isImage: true,
    current: 0,
    currentNum: 1,
    goods: {},
    showPurchase: false,
    // 图片转发连接
    transmitUrl: '',
    showShare: false,
    shareImgUrl: [],
    shareImgId: [],
    empId: ''
  },

  onLoad ({ index = 0 }) {
    wx.hideShareMenu()
    const goods = wx.getStorageSync('galleryGoods')
    goods.materialList.forEach(v => {
      v.imgUrl = v.imgUrl.split('?')[0]
    })
    const imgUrl = goods.materialList
    const imgList = imgUrl.map(i => i.imgUrl).join()
    const checkIdList = imgUrl.map(i => i.id).join()
    this.setData({
      empId: wx.getStorageSync('empidCommission'),
      userType: wx.getStorageSync('userType'),
      goods,
      current: +index,
      currentNum: +index + 1,
      transmitUrl: `/pages/choose-img/choose-img?productId=${goods.id}&chooseimg=${imgList}&checkIdList=${checkIdList}`
    })
  },

  bindChange ({ detail: { current } }) {
    this.setData({
      current,
      currentNum: ++current
    })
  },
  bindPurchase (e) {
    this.setData({ 'goods.id': this.data.goods.id })
    setTimeout(() => this.setData({ showPurchase: true }), 16)
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
  bindReport () {
    const id = this.data.goods.materialList[this.data.current].id
    ApiMaterial.report({
      data: { id },
      success: () => wx.showToast({ title: '已反馈，谢谢您', icon: 'none', duration: 2000 })
    })
  },
  goShare () {
    const currentImg = this.data.goods.materialList[this.data.current]
    this.setData({
      shareImgUrl: [currentImg.imgUrl || ''],
      shareImgId: [currentImg.id || ''],
      showShare: true
    })
  },
  previewImage ({ currentTarget }) {
    const index = currentTarget.dataset.index
    const imgUrls = this.data.goods.materialList.map((item) => {
      return item.imgUrl
    })
    wx.previewImage({ current: imgUrls[index], urls: imgUrls })
  },
  close () {
    this.setData({ showShare: false })
  },
  onShareAppMessage () {
    const id = this.data.goods.id
    ApiProduct.transmit({
      data: { id, mids: this.data.shareImgId }
    })
    ApiUser.transferAdd({
      data: { productId: id, addPrice: 0, productCode: '', price: 0 }
    })

    const empid = wx.getStorageSync('empidCommission')
    return {
      title: this.data.goods.name || '',
      path: `/pages/product/product?id=${id}${empid ? `&empid=${empid}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      imageUrl: this.data.shareImgUrl[0]
    }
  }
})
