const ApiOrder = require('../../api/order')

Page({
  data: {
    orderCode: '',
    parcelList: [],
    ajaxIndex: 0
  },
  onLoad ({ orderCode = '' }) {
    this.setData({ orderCode })
    this.getParcelList()
  },
  getDetail (item, index) {
    ApiOrder.expressDetail({
      data: {
        parcelId: item.parcelId
      },
      success: ({ data = [] }) => {
        const parcelList = this.data.parcelList
        this.data.ajaxIndex++
        this.setData({ [`parcelList[${index}].expressDetail`]: data })
        if (this.data.ajaxIndex === parcelList.length) {
          wx.hideLoading()
        }
      }
    })
  },
  getParcelList () {
    wx.showLoading({ title: '获取物流信息中' })
    ApiOrder.parcelList({
      data: {
        orderCode: this.data.orderCode
      },
      success: ({ data = [] }) => {
        data.forEach((v) => {
          v.isShow = data.length === 1
        })
        this.setData({ parcelList: data })
        data.forEach((item, index) => {
          this.getDetail(item, index)
        })
      }
    })
  },
  showHide (e) {
    const dataset = e.currentTarget.dataset
    const parcelList = this.data.parcelList
    const { item, index } = dataset
    parcelList[index].isShow = !item.isShow
    this.setData({ parcelList })
  }
})
