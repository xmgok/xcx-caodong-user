const ApiCusM = require('../../../../api/cus-m')

function getDefaultData (options) {
  const obj = { // 默认值
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  handleSearchCancel () {
    wx.navigateBack()
  },
  handleSearchConfirm ({ detail }) {
    if (!detail) {
      wx.showToast({ icon: 'none', title: '请输入关键字' })
      return
    }
    this.getList()
  },

  getList () {
    ApiCusM.list({
      data: {
        labelName: this.data.options.keywords
      },
      success: res => {
        this.setData({ dataList: res.data })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
