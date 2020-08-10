import business from '../../../../utils/business'
import ApiCustomer from '../../../../api/cus-m'

function getDefaultData (options, self) {
  const obj = { // 默认值
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

  onShow () {
    this.setData(getDefaultData(this.options, this))
    this.getDetail()
  },

  // 客户详情
  getDetail () {
    ApiCustomer.customerInfo({
      params: {
        customerId: this.data.options.id
      },
      success: ({ data = {} }) => {
        this.setData({ resData: data })
      }
    })
  },

  bindBirthdayChange (e) {
    ApiCustomer.update_customer({
      data: {
        id: this.options.id,
        birthday: e.detail.value
      },
      success: ({ code, message }) => {
        wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'SUCCESS' : 'none'), duration: 1000 })
        if (code === 'SUCCESS') {
          this.getDetail()
        }
      }
    })
  },

  bindRegionChange (e) {
    const value = e.detail.value
    ApiCustomer.update_customer({
      data: {
        id: this.options.id,
        province: value[0],
        city: value[1],
        area: value[2]
      },
      success: ({ code, message }) => {
        wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'SUCCESS' : 'none'), duration: 1000 })
        if (code === 'SUCCESS') {
          this.getDetail()
        }
      }
    })
  },

  onPullDownRefresh () {
    this.onShow(this.data.options)
    wx.stopPullDownRefresh()
  }
})
