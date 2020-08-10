const priceCtrl = require('../utils/price')
const app = getApp()

module.exports = {
  listTab (options) {
    app.ajax({
      url: '/activity_center/tab',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  listFans (options) {
    app.ajax({
      url: '/activity_center/activity/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v._beginTime = v.beginTime.split(' ')[0].split('-').slice(1, 3).join('.')
          v._endTime = v.endTime.split(' ')[0].split('-').slice(1, 3).join('.')
        })
        if (options.success) options.success(res)
      }
    })
  },
  listGroup (options) {
    app.ajax({
      url: '/activity_center/groupbuy/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.map((v, i, a) => {
          // 价格格式化
          const { int, dec } = priceCtrl.currency(v.activePrice)
          a[i].priceInteger = int
          a[i].priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  listSeckill (options) {
    app.ajax({
      url: '/activity_center/seckill/app_list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          const { int, dec } = priceCtrl.currency(v.activePrice)
          v.priceInteger = int
          v.priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  listBargain (options) {
    app.ajax({
      url: '/activity_center/reduce/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          const { int, dec } = priceCtrl.currency(v.minPrice)
          v.priceInteger = int
          v.priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  listCouponSplit (options) {
    app.ajax({
      url: '/activity_center/dist_coupon/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v._beginTime = v.issueTime.split(' ')[0].split('-').slice(1, 3).join('.')
          v._endTime = v.issueEndTime.split(' ')[0].split('-').slice(1, 3).join('.')
          if (v.distType === 1) { // x人每人price元
            v._price = v.price * v.distNum
          }
          if (v.distType === 2) { // x人瓜分price元
            v._price = v.price
          }
          v._price = Number(v._price).toFixed(2)
          if (v._price && v._price.split) {
            v._price_big = v._price.split('.')[0]
          }
        })
        if (options.success) options.success(res)
      }
    })
  },
  listDiscount (options) {
    app.ajax({
      url: '/activity_center/discount/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v._beginTime = v.beginTime.split(' ')[0].split('-').slice(1, 3).join('.')
          v._endTime = v.endTime.split(' ')[0].split('-').slice(1, 3).join('.')
        })
        if (options.success) options.success(res)
      }
    })
  }
}
