const priceCtrl = require('../utils/price')
const app = getApp()

module.exports = {
  // 秒杀抢购列表
  list (options) {
    app.ajax({
      url: '/seckill/app_list',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 秒杀详情
  seckillDetail (options) {
    app.ajax({
      url: '/seckill/info_by_seckillId',
      type: 'get',
      ...options,
      success (res) {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(res.data.activePrice)
        res.data.activePriceInteger = int
        res.data.activePriceDecimal = dec
        if (options.success) options.success(res)
      }
    })
  }

}
