import business from '../../utils/business'
import { timeCountDown } from '../../utils/index'

const ApiTask = require('../../api/task')
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    wx.hideShareMenu()
    this.setData(getDefaultData(options))
    this.getStep()
  },
  onUnload () {
    this.clearInterval()
  },
  clearInterval () {
    const { resData } = this.data
    resData.listBffRecord && resData.listBffRecord.forEach(v => {
      clearInterval(v._timer)
    })
  },

  forward ({ currentTarget: { dataset: { taskId, ruleId, step } } }) {
    ApiTask.sendmsg({
      data: {
        ruleId,
        url: '/task/step' // h5对应的任务步骤页面【后端直接定死，此处作废】。
      },
      success: res => {
        res.message && wx.showModal({ content: res.message, showCancel: false })
      }
    })
  },

  getStep () {
    wx.showLoading({ title: '数据载入中' })
    let { options } = this.data
    ApiTask.getStep({
      data: { taskId: options.id },
      success: res => {
        wx.hideLoading()
        const resData = res.data || {}
        resData.listBffRecord.forEach((item, index) => {
          if (item.timeStatus === 2) {
            timeCountDown({
              seconds: item.endTimeStr,
              callback: {
                run: (json) => {
                  item.remainingSecondsFormat = json
                  this.setData({ resData })
                },
                over: () => {
                  item.timeStatus = 3 // 已结束
                  // resData.listBffRecord.splice(index, 1)
                  this.setData({ resData })
                }
              }
            })
            item._timer = timeCountDown.timer
          }
        })
        this.setData({ resData })
      }
    })
  },

  onPullDownRefresh () {
    this.clearInterval()
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  copy (e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function () {
        wx.getClipboardData({
          success: function () {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },

  previewImage ({ currentTarget }) {
    const dataset = currentTarget.dataset
    const index = dataset.index
    const imgUrls = dataset.imgUrls
    wx.previewImage({ current: imgUrls[index], urls: imgUrls })
  },

  onShareAppMessage ({ from, target }) {
    let shareParams = {}
    const shareData = this.data.shareData
    const empidCommission = wx.getStorageSync('empidCommission')
    if (from === 'button' && shareData.taskType === 'goods') {
      ApiProduct.transmit({
        data: {
          id: shareData.id,
          mids: []
        }
      })
      ApiUser.transferAdd({
        data: {
          productId: shareData.id,
          productCode: shareData.productCode || '',
          price: shareData.price || 0,
          addPrice: 0
        }
      })
      shareParams = {
        path: `/pages/product/product?id=${shareData.id}${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: shareData.name || '',
        imageUrl: shareData.imgUrl
      }
    }
    if (from === 'button' && shareData.taskType === 'coupons') {
      shareParams = {
        path: `/pages/coupon-detail/coupon-detail?id=${shareData.id}${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: shareData.shareDesc || '',
        imageUrl: shareData.shareImg
      }
    }
    if (from === 'button' && shareData.taskType === 'bargain') {
      shareParams = {
        path: `/pages-subpackages/promotion/pages/bargain-detail/index?reduceId=${shareData.reduceId}${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起砍价吧。`,
        imageUrl: shareData.productImg
      }
    }
    if (from === 'button' && shareData.taskType === 'couponsSplit') {
      shareParams = {
        path: `/pages-subpackages/promotion/pages/coupon-split/index?id=${shareData.id}${shareData.parentId ? `&parentId=${shareData.parentId}` : ''}${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的券，快来一起瓜分吧。`,
        imageUrl: shareData.topImg
      }
    }
    if (shareParams.path.indexOf('?') === -1) {
      shareParams.path += `?storeId=${wx.getStorageSync('storeId')}`
    } else {
      shareParams.path += `&storeId=${wx.getStorageSync('storeId')}`
    }
    shareParams.path += `&taskRuleId=${this.data.ruleId}` // 任务id
    ApiTask.taskforwardSave({
      data: {
        empId: wx.getStorageSync('empidCommission'),
        itemId: shareData.id,
        ruleId: this.data.ruleId,
        type: 1 // 类型 1转发 2进入
      }
    })
    console.log('分享的数据', shareParams)
    return shareParams
  },
  onShareImages (e) {
    const dataset = e.currentTarget.dataset
    const { item } = dataset
    let scene = business.sceneStringify({
      pageId: 8,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission')
      // userid: wx.getStorageSync('userid')
    })
    this.setData({
      ruleId: item.id,
      imgList: item.imgsUrl,
      showShareImages: true,
      shareText: item.shareDesc,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareGoods (e) {
    const dataset = e.currentTarget.dataset
    const { item, ruleId } = dataset
    item.taskType = 'goods'
    let scene = business.sceneStringify({
      pageId: 1,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      // userid: wx.getStorageSync('userid'),
      id: item.id,
      taskRuleId: ruleId
    })
    this.setData({
      ruleId,
      shareData: item,
      productId: item.id,
      // imgList: [item.imgUrl],
      imgList: item.materialList.map(v => v.imgUrl),
      showShareGoods: true,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareCoupons (e) {
    const dataset = e.currentTarget.dataset
    const { item, ruleId } = dataset
    let scene = business.sceneStringify({
      pageId: 7,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      // userid: wx.getStorageSync('userid'),
      id: item.id,
      taskRuleId: ruleId
    })
    item.taskType = 'coupons'
    this.setData({
      ruleId,
      shareData: item,
      imgList: [item.shareImg],
      showShareCoupons: true,
      activePrice: item.price,
      shareText: item.shareDesc,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareBargain (e) {
    const dataset = e.currentTarget.dataset
    const { item, ruleId } = dataset
    let scene = business.sceneStringify({
      pageId: 3,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      // userid: wx.getStorageSync('userid'),
      // taskRuleId: ruleId,
      reduceId: item.reduceId
    })
    item.taskType = 'bargain'
    this.setData({
      ruleId,
      shareData: item,
      imgList: [item.productImg],
      showShareBargain: true,
      activePrice: item.productPrice,
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起砍价吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareCouponsSplit (e) {
    const dataset = e.currentTarget.dataset
    const { item, ruleId } = dataset
    let scene = business.sceneStringify({
      pageId: 2,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      // userid: wx.getStorageSync('userid'),
      // taskRuleId: ruleId,
      id: item.id,
      parentId: item.parentId
    })
    item.taskType = 'couponsSplit'
    this.setData({
      ruleId,
      shareData: item,
      imgList: [item.topImg],
      showShareCouponsSplit: true,
      activePrice: item.price,
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的券，快来一起瓜分吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved () {
    ApiTask.taskforwardSave({
      data: {
        empId: wx.getStorageSync('empidCommission'),
        itemId: this.data.shareData.id || this.data.shareData.reduceId,
        ruleId: this.data.ruleId,
        type: 1 // 类型 1转发 2进入
      }
    })
  },
  savedImg () {
    const ruleId = this.data.ruleId
    ApiTask.taskforwardSave({
      data: {
        empId: wx.getStorageSync('empidCommission'),
        // itemId: '',
        ruleId: ruleId,
        type: 1 // 类型 1转发 2进入
      }
    })
    ApiTask.taskTaskInform({ data: { id: ruleId } }) // 图片任务完成
  },
  onSaveVideo (e) {
    const item = e.currentTarget.dataset.item
    const { imgsUrl } = item
    wx.downloadFile({
      url: imgsUrl[0],
      success: (res) => {
        // 保存视频到本地
        wx.saveVideoToPhotosAlbum({
          filePath: res.tempFilePath,
          success: (data) => {
            wx.showToast({ title: '保存成功', icon: 'none', duration: 4000 })
            ApiTask.taskforwardSave({
              data: {
                empId: wx.getStorageSync('empidCommission'),
                // itemId: '',
                ruleId: item.id,
                type: 1 // 类型 1转发 2进入
              }
            })
            ApiTask.taskTaskInform({ data: { id: item.id } }) // 视频任务完成
          },
          fail: () => {
            wx.showToast({ title: '保存失败', icon: 'none', duration: 4000 })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '下载失败', icon: 'none', duration: 4000 })
      }
    })
  },
  closeShareImages () {
    this.setData({ showShareImages: false })
  },
  closeShareGoods () {
    this.setData({ showShareGoods: false })
  },
  closeShareCoupons () {
    this.setData({ showShareCoupons: false })
  },
  closeShareBargain () {
    this.setData({ showShareBargain: false })
  },
  closeShareCouponsSplit () {
    this.setData({ showShareCouponsSplit: false })
  }
})
