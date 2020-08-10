import { timeCountDown } from '../../utils/index'
// const ApiProduct = require('../../api/product')
// const ApiUser = require('../../api/user')
import business from '../../utils/business'
const ApiGroup = require('../../api/group')
const app = getApp()

Page({
  data: {
    referer: '',
    recordId: '',
    groupInfo: {},
    list: [],
    showShare: false
  },

  onLoad ({ recordId, referer = '' }) {
    wx.hideShareMenu()
    this.setData({ recordId, referer })
    if (referer === 'orderConfirm') { // 修复微信支付回打慢的问题，orderConfirm来源才判定。
      wx.showLoading({ title: '加载中...' })
      setTimeout(() => {
        this.init()
      }, 4000)
    } else {
      this.init()
    }
  },

  recordInfo () {
    if (this.data.referer !== 'orderConfirm') {
      wx.showLoading({ title: '加载中...' })
    }
    ApiGroup.recordInfo({
      data: { recordId: this.data.recordId },
      success: (res) => {
        wx.hideLoading()
        const groupInfo = res.data
        this.setData({ groupInfo })
        if (groupInfo.status === 1) {
          timeCountDown({
            seconds: groupInfo.countDown,
            callback: {
              run: (json) => {
                groupInfo.remainingSecondsFormat = json
                this.setData({ groupInfo })
              },
              over: () => {
              }
            }
          })
          this.timer = timeCountDown.timer
        }
      }
    })
  },

  init () {
    this.clearTimer()
    this.recordInfo()
    this.getRecommend()
  },

  onPullDownRefresh () {
    this.init()
    wx.stopPullDownRefresh()
  },

  getRecommend () {
    ApiGroup.activeList({
      data: {
        pageNum: 1,
        pageSize: 3
      },
      success: (res) => {
        this.setData({
          list: res.data.dataList
        })
      }
    })
  },

  scrollToUpper (e) {
    console.log(e)
  },

  onUnload () {
    this.clearTimer()
  },

  clearTimer () {
    this.timer && clearInterval(this.timer)
  },

  onShareAppMessage () {
    const groupInfo = this.data.groupInfo
    const activeId = groupInfo.groupId
    const activeType = 'group'
    const recordId = this.data.recordId // groupInfo.id也是recordId
    const userid = wx.getStorageSync('userid')
    // ApiProduct.transmit({
    //   data: {
    //     id: product.id,
    //     mids: this.data.checkIdList
    //   }
    // })
    // ApiUser.transferAdd({
    //   data: {
    //     productId: groupInfo.productId,
    //     productCode: groupInfo.productCode || '',
    //     price: groupInfo.productPrice || 0,
    //     addPrice: 0
    //   }
    // })
    const empidCommission = wx.getStorageSync('empidCommission')
    ApiGroup.forward({
      data: {
        empId: empidCommission,
        groupId: activeId,
        type: 1 // 类型 1转发 2浏览
      }
    })
    const path = `/pages/group-invite/group-invite?id=${groupInfo.productId}${userid ? `&userid=${userid}` : ''}${recordId ? `&recordId=${recordId}` : ''}${empidCommission ? `&empid=${empidCommission}` : ''}${activeId ? `&activeId=${activeId}` : ''}${activeType ? `&activeType=${activeType}` : ''}&storeId=${wx.getStorageSync('storeId')}`
    console.log('分享路径', path)
    return {
      path,
      title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      imageUrl: groupInfo.productImg
    }
  },
  showShare () {
    let scene = business.sceneStringify({
      pageId: 9,
      storeId: wx.getStorageSync('storeId'),
      recordId: this.data.recordId,
      empid: wx.getStorageSync('empidCommission'),
      userid: wx.getStorageSync('userid')
    })
    this.setData({
      showShare: true,
      imgList: [this.data.groupInfo.productImg],
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  }
})
