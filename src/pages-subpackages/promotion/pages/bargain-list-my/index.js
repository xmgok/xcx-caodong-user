import { timeCountDown } from '../../../../utils/index'
import business from '../../../../utils/business'
const ApiBargain = require('../../../../api/bargain')
const priceCtrl = require('../../../../utils/price')

function getDefaultData (options) {
  const obj = { // 默认值
    showPurchase: false,
    result2: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList2: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    const scene = business.sceneParse(options.scene)
    options = {
      ...options,
      ...scene
    }
    obj.options = options
    options.type = options.type || obj.tabIndex
    obj.tabIndex = options.type
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList2()
  },
  onReachBottom () {
    let { result2 } = this.data
    this.setCurPageIncrement2()
    if (result2.pageNum > result2.totalPage) return
    this.getList2()
  },
  onPullDownRefresh () {
    this.clearInterval()
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  onUnload () {
    this.clearInterval()
  },
  clearInterval () {
    this.data.dataList2.forEach(v => {
      clearInterval(v._timer)
    })
  },

  formatPrice (list) {
    return list.map(item => {
      // 价格格式化
      const { int, dec } = priceCtrl.currency(item.price)
      item.priceInteger = int
      item.priceDecimal = dec
      return item
    })
  },
  getList2 () {
    const result2 = this.data.result2
    ApiBargain.list({
      data: {
        type: 1, // 1我的砍价 2我的进行中 3所有进行中
        pageNum: result2.pageNum,
        pageSize: result2.pageSize
      },
      success: ({ data }) => {
        const dataList2 = this.data.dataList2.concat(this.formatPrice(data.dataList))
        this.clearInterval()
        dataList2.forEach((item, index) => {
          if (item.countDown > 0) {
            timeCountDown({
              seconds: item.countDown,
              callback: {
                run: (json) => {
                  item.remainingSecondsFormat = json
                  this.setData({ dataList2 })
                },
                over: () => {
                  dataList2.splice(index, 1)
                  this.setData({ dataList2 })
                }
              }
            })
            item._timer = timeCountDown.timer
          }
        })
        this.setData({ dataList2 })
        this.setPagination2(data)
      }
    })
  },
  setPagination2 (data = {}) {
    this.setData({
      result2: {
        totalPage: data.totalPage,
        totalCount: data.totalCount,
        pageNum: data.pageNum,
        pageSize: this.data.result2.pageSize
      }
    })
  },
  setCurPageIncrement2 () {
    let { result2 } = this.data
    result2.pageNum++
    this.setData({ result2 })
  },
  submit (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    if (item.isPay) return
    this.setData({ showPurchase: true, buyData: item })
  },
  goodsPurchaseSelected () {
    this.setData({ showPurchase: false })
    wx.navigateTo({ url: '/pages/order-confirm/order-confirm' })
  },
  goodsPurchaseClose () {
    this.setData({ showPurchase: false })
  }
})
