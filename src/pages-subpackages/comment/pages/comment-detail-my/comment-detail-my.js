import Event from '../../../../utils/event'

const ApiComment = require('../../../../api/comment')

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
    this.getList()
  },

  onUnload () {
    Event.$emit('comment')
  },

  getList () {
    ApiComment.info({
      data: {
        id: this.data.options.id
      },
      success: (res) => {
        this.setData({ resData: res.data })
      }
    })
  },

  previewImage ({ currentTarget: { dataset: { index, images } } }) {
    wx.previewImage({ current: index, urls: images })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
