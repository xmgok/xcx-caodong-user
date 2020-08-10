const ApiGroup = require('../../api/group')

function getDefaultData (options) {
  const obj = { // 默认值
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
    ApiGroup.info({
      data: {
        groupId: options.groupId
      },
      success: (res) => {
        this.setData({ resData: res.data })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  returnPrevPage () {
    wx.navigateBack({
      delta: 1
    })
  }
})
