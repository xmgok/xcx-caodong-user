import ApiCoupon from '../../../../api/coupon'

import business from '../../../../utils/business'

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    brandName: wx.getStorageSync('brandName'),
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),
  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getDetail()
  },
  getDetail () {
    const options = this.data.options
    const scene = business.sceneParse(this.data.options.scene)
    const id = scene.id || options.id
    ApiCoupon.couponInfoMy({
      params: { id },
      success: ({ data }) => {
        data._price_big = data.price.split('.')[0]
        this.setData({ resData: data })
      }
    })
  },
  goToUse ({ currentTarget: { dataset: { id, type } } }) {
    wx.navigateTo({ url: `/pages/coupon-goods/coupon-goods?id=${id}&type=${type}` })
  },
  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
