import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')

function getDefaultData (options, self) {
  const obj = { // 默认值
    resData: {},
    chooseStore: {}
  }
  if (options) { // 根据options重置默认值
    // obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  // data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getDetail()
  },

  getDetail () {
    ApiBooking.getStoreInfo({
      data: { storeId: this.data.options.id || wx.getStorageSync('storeId') },
      success: ({ data }) => {
        this.setData({
          chooseStore: {
            ...data,
            longitude: Number(data.longitude),
            latitude: Number(data.latitude)
          }
        })
      }
    })
  },
  toCall ({ currentTarget: { dataset: { managerMobile } } }) {
    if (!managerMobile) {
      wx.showToast({ title: '电话不存在', icon: 'none', duration: 2000 })
      return
    }
    wx.makePhoneCall({ phoneNumber: managerMobile })
  },
  openLocation ({ currentTarget: { dataset: { item } } }) {
    console.log('openLocation item', item)
    if (!item.longitude || !item.latitude) {
      wx.showToast({ title: '经纬度缺失', icon: 'none', duration: 2000 })
      return
    }
    wx.openLocation({
      longitude: Number(item.longitude),
      latitude: Number(item.latitude),
      scale: 18,
      name: item.name,
      address: item.address,
      fail: (e) => {
        console.log('openLocation fail', e)
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
