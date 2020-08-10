const app = getApp()

module.exports = {
  // 我的提成
  infos: (options) => {
    app.ajax({
      url: '/assetuser/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 提成明细
  detail: (options) => {
    app.ajax({
      url: '/assetrecord/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 是否显示申请提现按钮
  canWithdraw: (options) => {
    app.ajax({
      url: '/withdraw/isShow',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 微信提现
  withdraw: (options) => {
    app.ajax({
      url: '/withdraw/withdraw',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 最多可提现金额
  withdrawAmount: (options) => {
    app.ajax({
      url: '/withdraw/withdrawAmount',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 提现记录
  withdrawList: (options) => {
    app.ajax({
      url: '/withdraw/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 提现数据统计
  withdrawAmountData: (options) => {
    app.ajax({
      url: '/withdraw/amountData',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
