const priceCtrl = require('../utils/price')
const app = getApp()

module.exports = {
  // 邀请虚拟导购/分销，进行统计
  saveInvitationLog (options = {}) {
    app.ajax({
      url: '/distributionPay/saveInvitationLog',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 我邀请的虚拟导购，列表
  getMyGuides (options) {
    app.ajax({
      url: '/distributionPay/getMyGuides',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 分销统计数据
  getInvitationCount (options) {
    app.ajax({
      url: '/distributionPay/getInvitationCount',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 佣金提成计算
  calculate (options) {
    app.ajax({
      url: '/distributionPay/calculate',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 保存提现申请
  saveCashApply (options) {
    app.ajax({
      url: '/distributionPay/saveCashApply',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 平安支付提现
  pinganwithdraw (options) {
    app.ajax({
      url: '/distributionPay/pinganwithdraw',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 我的团队
  mycorps (options) {
    app.ajax({
      url: '/distributionPay/mycorps',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 我的分销
  mycommission (options) {
    app.ajax({
      url: '/distributionPay/mycommission',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 提现记录
  getWithdraws (options) {
    app.ajax({
      url: '/distributionPay/getWithdraws',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取提现手续费
  getCommissionAmount (options) {
    app.ajax({
      url: '/distributionPay/getCommissionAmount',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取可提现佣金
  getDistributorCommission (options) {
    app.ajax({
      url: '/distributionPay/getDistributorCommission',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 订单确认收货
  confirmreceipt (options) {
    app.ajax({
      url: '/distributionPay/confirmreceipt',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 分销佣金订单明细列表
  commissionlist (options) {
    app.ajax({
      url: '/distributionPay/commissionlist',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 每月佣金统计
  monthReport (options) {
    app.ajax({
      url: '/distributionPay/monthReport',
      type: 'post',
      ...options,
      success (res) {
        res.data.income = res.data.income || '0.00'
        res.data.expenditure = res.data.expenditure || '0.00'
        res.data.ramount = res.data.ramount || '0.00'
        res.data.wamount = res.data.wamount || '0.00'
        res.data.gamount = res.data.gamount || '0.00'
        if (options.success) options.success(res)
      }
    })
  },
  // 分销佣金-金额明细图表
  commissionDetail (options) {
    app.ajax({
      url: '/distributionPay/commissionDetail',
      type: 'post',
      ...options,
      success (res) {
        res.data.avcAmount = res.data.avcAmount || '0.00'
        res.data.wamount = res.data.wamount || '0.00'
        res.data.gamount = res.data.gamount || '0.00'
        res.data.ramount = res.data.ramount || '0.00'
        if (options.success) options.success(res)
      }
    })
  },
  // 店铺设置
  setShopInfo (options) {
    app.ajax({
      url: '/distributionPay/setShopInfo',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 是否是分销商
  isDistributorHandleStoreId (options) {
    app.ajax({
      url: '/distributionPay/isDistributor',
      type: 'post',
      ...options,
      success (res) {
        // 如果分销商门店和当前所处门店不同。则不算分销商。
        const storeId = wx.getStorageSync('storeId')
        if (storeId !== res.data.storeId) {
          res.data.distributor = false
        }
        if (options.success) options.success(res)
      }
    })
  },
  // 是否是分销商
  isDistributor (options) {
    app.ajax({
      url: '/distributionPay/isDistributor',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取店铺设置详情
  shopInfo (options) {
    app.ajax({
      url: '/distributionPay/shopInfo',
      type: 'post',
      ...options,
      success (res) {
        res.data.logo = res.data.logo || ''
        res.data.shopName = res.data.shopName || ''
        if (options.success) options.success(res)
      }
    })
  },
  // 推广返佣商品列表
  getProdCommissions (options) {
    app.ajax({
      url: '/distributionPay/getProdCommissions',
      type: 'post',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v.productName = v.prodName || v.name || v.productName
          v.productImg = v.imgUrl || v.productImg
          v.productId = v.prodId || v.productId || v.id
          v._detailUrl = `/pages/product/product?id=${v.id}`
          // 价格格式化
          const { int, dec } = priceCtrl.currency(v.price)
          v.priceInteger = int
          v.priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 申请成为分销商
  saveDistributor (options) {
    app.ajax({
      url: '/distributionPay/saveDistributor',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      },
      complete (res) {
        if (options.complete) options.complete(res)
      }
    })
  },
  // 查看分销商状态信息
  distributorState (options) {
    app.ajax({
      url: '/distributionPay/distributorState',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取分销商申请的条件设置
  getDistriCondition (options) {
    app.ajax({
      url: '/distributionPay/getDistriCondition',
      type: 'post',
      ...options,
      success (res) {
        const data = res.data
        data.minOrderNumberIsChecked = Boolean(+data.minOrderNumber)
        data.minAmountIsChecked = Boolean(+data.minAmount)
        data.isNeedCondition = data.minOrderNumberIsChecked || data.minAmountIsChecked
        if (options.success) options.success(res)
      }
    })
  },
  // 获取分销配置
  getdistInfo (options) {
    app.ajax({
      url: '/distributionPay/getdistInfo',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
