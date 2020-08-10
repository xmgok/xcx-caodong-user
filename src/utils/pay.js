const orderApi = require('../api/order')

module.exports = {
  payment ({ recordId, orderCode, success, fail, isRedirect = true, orderType, activeData = {} }) {
    orderApi.payment({
      data: { orderCode },
      success: ({ data: { timeStamp, nonceStr, packagestr, signType, paySign } }) => {
        wx.requestPayment({
          timeStamp,
          nonceStr,
          package: packagestr,
          signType,
          paySign,
          success: ({ errMsg }) => {
            if (!errMsg) return

            if (errMsg.match('requestPayment:ok')) {
              success && success()
              // orderType为3表示一定是拼团订单。
              if ((activeData.buyType !== 'groupAloneBuy' && activeData.activeType === 'group') || +orderType === 3) { // 非单独购买的拼团支付成功，跳拼团详情页。单独购买当做普通商品购买。
                wx.showToast({ title: '支付成功', icon: 'none' })
                setTimeout(() => { // 修复微信支付回打慢的问题，orderConfirm来源才判定。
                  if (isRedirect) wx.redirectTo({ url: `/pages/group-detail/group-detail?recordId=${recordId}&referer=orderConfirm` })
                }, 2000)
                return
              }
              if (isRedirect) wx.redirectTo({ url: `/pages/order-detail/order-detail?orderCode=${orderCode}&payStatus=1` }) // 普通订单跳订单详情页
            } else if (errMsg.match('requestPayment:fail')) {
              console.log('fail')
              fail && fail()
            } else {
              wx.showToast({ title: '对不起，下单失败，请重新尝试', icon: 'none' })
            }
          },
          fail: (e) => {
            console.log('支付失败：', e)
            fail && fail()
            if (isRedirect) wx.redirectTo({ url: `/pages/order-detail/order-detail?orderCode=${orderCode}` })
          }
        })
      },
      fail
    })
  }
}
