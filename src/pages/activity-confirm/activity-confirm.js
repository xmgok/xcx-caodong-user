import ApiActivity from '../../api/activity'

import business from '../../utils/business'
const ApiUser = require('../../api/user')
const ApiCommon = require('../../api/common')
const app = getApp()

Page({
  data: {
    id: '',
    recordId: '',
    userid: '',
    empid: '',
    info: {},
    preview: 0,
    isLoad: true,
    showShare: false,
    timer: null
  },

  onLoad ({ id, recordId = '', userid = '', empid = '', scene = '' }) {
    console.log('活动详情 onLoad')
    wx.showLoading({ title: '活动加载中', mask: true })
    scene = business.sceneParse(scene)
    id = scene.id || id
    recordId = scene.recordId || recordId
    userid = scene.userid || userid
    empid = scene.empid || empid
    const preview = scene.preview || 0

    this.setData({ id, recordId, userid, empid, preview })
    this.getInfo()
    ApiActivity.forwardAdd({
      data: { activityId: id, type: 2, forwarderId: userid || empid, empId: this.data.empid }
    })
  },

  onUnload () {
    console.log('活动详情 onUnload')
    clearInterval(this.data.timer)
  },

  onShow () {
    console.log('活动详情 onShow')
    clearInterval(this.data.timer)
    if (!this.data.isLoad) this.getInfo()
  },

  onHide () {
    console.log('活动详情 onHide')
    clearInterval(this.data.timer)
    if (!this.data.isLoad) this.getInfo()
  },
  getInfo (callback) {
    ApiActivity.activityInfo({
      params: { activityId: this.data.id, recordId: this.data.recordId, empId: this.data.empid },
      success: ({ data }) => {
        this.data.timer = setInterval(() => {
          ApiActivity.statisticalTime({ data: { activityId: data.id, recordId: data.recordId } })
        }, 5000)
        wx.hideLoading()
        data.message && wx.showModal({
          content: data.message,
          showCancel: false,
          success (res) {
            // if (res.confirm) {
            //   console.log('用户点击确定')
            // } else if (res.cancel) {
            //   console.log('用户点击取消')
            // }
          }
        })
        if (data.isEnd >= 1 || this.data.preview > 0) {
          wx.hideShareMenu()
        }
        data._listInviteUser = [].concat(data.listInviteUser)
        data._listInviteUser.length = data.inviteNum + 1
        data.listCouponPrize = data.listCouponPrize.map((item) => {
          const arrCouponPrice = item.couponPrice.split('.')
          item._couponBig = arrCouponPrice[0]
          item._couponSmall = arrCouponPrice[1]
          item._couponPrice = parseInt(item.couponPrice)
          item._discount = String(Number(item.discount))
          const arr = item._discount.split('.')
          item._discountBig = arr[0] || ''
          item._discountSmall = arr[1] || ''
          item._desc = `满${item.couponUsePrice}可用`
          if (+item.couponUsePrice === 0) {
            item._desc = '无门槛'
          }
          return item
        })
        if (data.fillExtend) {
          try {
            data.fillExtend = JSON.parse(data.fillExtend)
          } catch (e) {
          }
        }
        this.setData({ info: data, isLoad: false })
        callback && callback()
      }
    })
  },
  onShareAppMessage ({ from, target }) {
    ApiActivity.forwardAdd({
      data: { activityId: this.data.id, type: 1, empId: this.data.empid }
    })
    const info = this.data.info
    const userid = wx.getStorageSync('userid') || ''
    const empidCommission = wx.getStorageSync('empidCommission') || ''
    const shareInfo = {
      path: `/pages/activity-confirm/activity-confirm?id=${info.id}&recordId=${info.recordId}${userid ? `&userid=${userid}` : ''}${empidCommission ? `&empid=${empidCommission}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      title: info.shareTitle,
      imageUrl: info.shareImg
    }
    return shareInfo
  },
  goJoin () {
    const fnCreate = () => {
      const info = this.data.info
      if (info.isFill || (info.fillExtend && info.fillExtend.address)) {
        wx.navigateTo({
          url: `/pages/activity-form/activity-form?recordId=${this.data.info.recordId}&isFill=${info.isFill}`,
          success: (res) => {
            if (info.fillExtend) {
              res.eventChannel.emit('page-activity-confirm', { fillExtend: info.fillExtend })
            }
          }
        })
        return
      }
      if (info.isPay) {
        this.pay()
      }
    }
    ApiCommon.subscribeMsg({
      data: { sceneId: 7 },
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
  pay () {
    wx.showLoading({ title: '加载中', mask: true })
    ApiActivity.pay({
      data: { recordId: this.data.info.recordId },
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
              wx.showToast({ title: '支付成功', icon: 'success' })
              let info = this.data.info
              info.isPay = 0
              this.setData({ info })
            } else {
              wx.showToast({ title: '支付失败，请重新尝试', icon: 'none' })
            }
          },
          fail: () => {
            wx.hideLoading()
          }
        })
      }
    })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
    this.onShow()
  },
  getUserInfo ({ detail }) {
    const userInfo = detail.userInfo
    if (!userInfo) return
    ApiUser.edit({
      data: { headUrl: userInfo.avatarUrl, nickName: userInfo.nickName },
      success: () => {
        this.getInfo(() => this.goJoin())
      }
    })
  },
  formSubmit ({ detail }) {
    // console.log('form发生了submit事件，携带数据为：', detail.formId)
    // ApiUser.msgFormIdAdd({
    //   data: { formId: (detail.formId || ''), type: 2 }
    // })
  },
  onShare () {
    const info = this.data.info
    let scene = business.sceneStringify({
      pageId: 4,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      userid: wx.getStorageSync('userid'),
      recordId: info.recordId,
      id: info.id
    })
    this.setData({
      imgList: [info.shareImg],
      showShare: true,
      shareText: info.shareTitle,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  joinActivity () {
    const fnCreate = () => {
      ApiActivity.joinActivity({
        data: {
          activityId: this.data.id,
          recordId: this.data.info.recordId
        },
        success: ({ code, message }) => {
          if (message) wx.showToast({ title: message, icon: 'none', duration: 3000 })
          if (code === 'SUCCESS') {
            this.data.isLoad = false
            this.onShow()
          }
        }
      })
    }
    ApiCommon.subscribeMsg({
      data: { sceneId: 7 },
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
  }
})
