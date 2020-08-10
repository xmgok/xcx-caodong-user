import { ORDER_RETURN_STATUS_MAP } from '../../utils/consts'
import Event from '../../utils/event'

const ApiOrder = require('../../api/order')
const pay = require('../../utils/pay')
const ApiGroup = require('../../api/group')
const ApiCommon = require('../../api/common')

// const orderReturnStatusMap = ['', '未申请', '售后申请中', '售后已完成']
// const ORDER_RETURN_STATUS_MAP = ['', '售后申请中', '售后已完成']

const app = getApp()

Page({
  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    status: 1,
    statusText: '',
    statusTip: '',
    statusIcon: '',
    type: '',
    orderCode: '',
    orderInfo: {},
    goodsList: [],
    showTakeCode: false,
    payStatus: 0,
    groupDetail: { list: [] }
  },

  onLoad ({ type = '', orderCode = '', payStatus = 0 }) {
    Event.$on('comment', () => {
      if (!this.data.isTrigger) { // 页面如果没被销毁，再次navigateTo进入，会被再次绑定。
        this.getDetail()
        this.data.isTrigger = true
        setTimeout(() => {
          this.data.isTrigger = false // 防止多次绑定，导致多次触发this.getDetail()。因开关变true是同步的变false是异步的所以可以防止。
        }, 500)
      }
    })
    this.setData({ type, orderCode, payStatus })
    this.getDetail()
  },

  getDetail () {
    wx.showLoading({ title: '获取订单信息中' })
    ApiOrder.info({
      data: {
        orderCode: this.data.orderCode
      },
      success: ({ data }) => {
        wx.hideLoading()
        let status = this.data.payStatus ? 2 : data.orderStatus

        data.canApplyAfterSale = data.returnStatus !== 1 && ([2, 3, 7].includes(status))

        this.setData({ goodsList: data.productList, orderInfo: data })

        const statusTextArr = ['', '待付款', '待发货', '待收货', '交易完成', '已取消', '已关闭', '待自提']
        const statusIconArr = ['', 'icon-wallet', 'icon-pack', 'icon-shipping-timed', 'icon-order-check', 'icon-order-cancel', 'icon-order-cancel', 'icon-take']
        /* `${data.expressCompany}：${data.expressCode} 物流客服：${data.expressPhone}` */
        const statusTipArr = ['', '请您尽快支付，避免订单支付超时被取消', '订单已确认，我们会尽快为您安排物流发货', `${data.expressCompany}：${data.expressCode}`, '您的订单已完成，欢迎再来哟～', '您的订单已取消，欢迎再来哟～', '您的订单订单已关闭，欢迎再来哟～', '请凭提货码在指定门店提取商品，提货码只能使用一次，不可在其他门店重复使用']

        this.setData({
          status,
          statusText: statusTextArr[status],
          statusTip: statusTipArr[status],
          statusIcon: statusIconArr[status],
          // 未申请售后订单，不显示售后状态
          _returnStatus: ORDER_RETURN_STATUS_MAP[data.returnStatus]
        })
        if ((+status === 2 || +status === 3 || +status === 4 || +status === 7) && +data.orderType === 3) { // 已支付且是拼团订单
          ApiGroup.recordByOrder({
            data: {
              orderCode: this.data.orderCode
            },
            success: (res) => {
              this.setData({ groupDetail: res.data })
            }
          })
        }
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
      orderType: this.data.orderInfo.orderType,
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
    const fnCreate = () => {
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
    }
    ApiCommon.subscribeMsg({
      data: { sceneId: 6 },
      success: (res) => {
        wx.requestSubscribeMessage({ // 订阅消息。
          tmplIds: res.data,
          success: (res) => console.log('success res', res),
          fail: (res) => console.log('fail res', res),
          complete: () => {
            fnCreate()
          }
        })
      }
    })
  },
  showTake () {
    this.setData({ showTakeCode: true })
    this.setData({ takeCodeQr: `${app.config.domainPath}/order/qr_codes?token=${wx.getStorageSync('token')}&str=${this.data.orderInfo.takeCode}` })
  },
  hideTake () {
    this.setData({ showTakeCode: false })
  },
  goAftersales (e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url })
  }
})
