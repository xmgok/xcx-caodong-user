import { timeCountDown } from '../../../../utils/index'
import business from '../../../../utils/business'
const ApiBargain = require('../../../../api/bargain')
const priceCtrl = require('../../../../utils/price')

function getDefaultData (options, self) {
  const obj = { // 默认值
    showPurchase: false,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    result2: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    dataList2: [],
    resData: {},
    options: {},
    buyData: {}
  }
  if (options) { // 根据options重置默认值
    obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getList()
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
    this.data.dataList.forEach(v => {
      clearInterval(v._timer)
    })
  },

  bindscrolltolower () {
    let { result } = this.data
    this.setCurPageIncrement()
    if (result.pageNum > result.totalPage) return
    this.getList()
  },
  formatPrice (list) {
    return list.map(item => {
      // 价格格式化
      const { int, dec } = priceCtrl.currency(item.minPrice)
      item.priceInteger = int
      item.priceDecimal = dec
      return item
    })
  },
  getList () {
    const result = this.data.result
    ApiBargain.list({
      data: {
        type: 2, // 1我的砍价 2我的进行中 3所有进行中
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: ({ data }) => {
        const dataList = this.data.dataList.concat(this.formatPrice(data.dataList))
        this.clearInterval()
        dataList.forEach((item, index) => {
          timeCountDown({
            seconds: item.countDown,
            callback: {
              run: (json) => {
                item.remainingSecondsFormat = json
                this.setData({ dataList })
              },
              over: () => {
                dataList.splice(index, 1)
                this.setData({ dataList })
              }
            }
          })
          item._timer = timeCountDown.timer
        })
        this.setData({ dataList })
        this.setPagination(data)
      }
    })
  },
  setPagination (data = {}) {
    this.setData({
      result: {
        totalPage: data.totalPage,
        totalCount: data.totalCount,
        pageNum: data.pageNum,
        pageSize: this.data.result.pageSize
      }
    })
  },
  setCurPageIncrement () {
    let { result } = this.data
    result.pageNum++
    this.setData({ result })
  },
  getList2 () {
    const result = this.data.result2
    ApiBargain.list({
      data: {
        type: 3, // 1我的砍价 2我的进行中 3所有进行中
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: ({ data }) => {
        this.setData({ dataList2: this.data.dataList2.concat(this.formatPrice(data.dataList)) })
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
  goJoin (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    ApiBargain.create({
      data: {
        reduceId: item.reduceId // 砍价ID
      },
      success: ({ data }) => {
        wx.navigateTo({
          url: `/pages-subpackages/promotion/pages/bargain-detail/index?id=${data}`
        })
      }
    })
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
  },

  goDetail (e) {
    const dataset = e.currentTarget.dataset
    if (dataset.recordId) wx.navigateTo({ url: dataset.url })
  }
})
