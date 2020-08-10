const priceCtrl = require('../utils/price')
const app = getApp()

module.exports = {
  // 砍价列表
  list (options) {
    app.ajax({
      url: '/reduce/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 砍价详情
  info (options) {
    app.ajax({
      url: '/reduce/record/info',
      type: 'get',
      ...options,
      success (res) {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(res.data.currentAmount)
        res.data.activePriceInteger = int
        res.data.activePriceDecimal = dec
        res.data._isRuning = res.data.countDown > 0
        res.data._isRuningyes100 = res.data.countDown > 0 && res.data.reduceRatio === 100
        res.data._isRuningno100 = res.data.countDown > 0 && res.data.reduceRatio !== 100
        if (options.success) options.success(res)
      }
    })
  },
  // 发起砍价
  create (options) {
    app.ajax({
      url: '/reduce/record/create',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      },
      fail (res) {
        if (options.fail) options.fail(res)
      }
    })
  },
  // 好友帮砍列表
  detailsList (options) {
    app.ajax({
      url: '/reduce/details/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 帮好友砍一刀
  detailsCreate (options) {
    app.ajax({
      url: '/reduce/details/create',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 转发 - 浏览
  forward (options) {
    app.ajax({
      url: '/reduce/forward',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
