const ApiOrder = require('../../api/order')
const ApiUser = require('../../api/user')
const pay = require('../../utils/pay')
const app = getApp()

const orderReturnStatusMap = ['未申请', '售后申请中', '售后已完成']

Page({
  data: {
    status: 1,
    statusText: '',
    statusTip: '',
    statusIcon: '',
    type: '',
    orderCode: '',
    orderInfo: {}
  },

  onLoad ({ type = '', orderCode = '', token }) {
    this.setData({ type, orderCode })
    wx.setStorageSync('token', token)
    setTimeout(() => this.getDetail(), 160)
  },

  getDetail () {
    wx.showLoading({ title: '获取订单信息中' })
    ApiOrder.info({
      data: {
        orderCode: this.data.orderCode
      },
      success: ({ data }) => {
        wx.hideLoading()
        data.canApplyAfterSale = data.returnStatus !== 1 && (data.orderStatus === 2 || data.orderStatus === 3)
        this.setData({ orderInfo: data })

        let status = data.orderStatus
        const statusTextArr = ['', '待付款', '待发货', '待收货', '交易完成', '已取消', '已关闭']
        const statusIconArr = ['', 'icon-wallet', 'icon-pack', 'icon-shipping-timed', 'icon-order-check', 'icon-order-cancel', 'icon-order-cancel']
        /* `${data.expressCompany}：${data.expressCode} 物流客服：${data.expressPhone}` */
        const statusTipArr = ['', '请您尽快支付，避免订单支付超时被取消', '订单已确认，我们会尽快为您安排物流发货', `${data.expressCompany}：${data.expressCode}`, '您的订单已完成，欢迎再来哟～', '您的订单已取消，欢迎再来哟～', '您的订单订单已关闭，欢迎再来哟～']

        this.setData({
          status,
          statusText: statusTextArr[status],
          statusTip: statusTipArr[status],
          statusIcon: statusIconArr[status],
          // 未申请售后订单，不显示售后状态
          _returnStatus: data.returnStatus === 0 ? '' : orderReturnStatusMap[data.returnStatus]
        })

        this.yeePayment()
      }
    })
  },
  cancelOrder () {
    // wx.showLoading({ title: '取消中' })
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定取消吗？',
      success (res) {
        if (res.confirm) {
          ApiOrder.cancel({
            data: {
              orderCode: that.data.orderCode
            },
            success: ({ data, code, message }) => {
              // wx.hideLoading()
              wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'success' : 'none'), duration: 1000 })
              if (code === 'SUCCESS') {
                that.getDetail()
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  deleteOrder () {
    // wx.showLoading({ title: '删除中' })
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success (res) {
        if (res.confirm) {
          ApiOrder.delete({
            data: {
              orderCode: that.data.orderCode
            },
            success: ({ data, code, message }) => {
              // wx.hideLoading()
              wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'success' : 'none'), duration: 1000 })
              if (code === 'SUCCESS') {
                setTimeout(() => {
                  const pages = getCurrentPages()
                  const prepage = pages[pages.length - 2]
                  if (prepage && prepage.route.indexOf('pages/order-list/order-list') > -1) {
                    wx.navigateBack({ delta: 1 })
                  } else {
                    wx.redirectTo({ url: '/pages/order-list/order-list' })
                  }
                }, 1000)
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  pay () {
    if (this.data.submitting) return
    this.data.submitting = true
    pay.payment({
      orderCode: this.data.orderCode,
      success: () => {
        delete this.data.submitting
      },
      fail: () => {
        delete this.data.submitting
      }
    })
  },
  delivery () {
    wx.showLoading({ title: '确认收货中' })
    ApiOrder.delivery({
      data: {
        orderCode: this.data.orderCode
      },
      success: ({ data, code, message }) => {
        wx.hideLoading()
        wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'success' : 'none'), duration: 1000 })
        if (code === 'SUCCESS') {
          this.getDetail()
        }
      }
    })
  },
  yeePayment () {
    wx.login({
      fail: ({ errMsg }) => {
        wx.showToast({ title: `${errMsg}`, icon: 'none', duration: 3000 })
      },
      success: ({ code }) => {
        ApiUser.getOpenId({
          data: {
            code,
            authAppId: app.config.appid
          },
          success: ({ data }) => {
            console.log(data)
            ApiOrder.payment({
              data: {
                openId: data,
                orderCode: this.data.orderCode
              },
              success: ({ data: { timeStamp, nonceStr, packagestr, signType, paySign } }) => {
                wx.requestPayment({
                  timeStamp,
                  nonceStr,
                  package: packagestr,
                  signType,
                  paySign,
                  success: ({ errMsg }) => {
                    console.log(errMsg)
                    if (!errMsg) return
                    this.navigate(/requestPayment:ok/.test(errMsg))
                  },
                  fail: (err) => {
                    console.log(err)
                    this.navigate(false)
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  navigate (YeePaySuccess) {
    wx.navigateBackMiniProgram({
      extraData: {
        YeePaySuccess,
        orderCode: this.data.orderCode
      },
      complete: (res) => console.log(res)
    })
  }
})
