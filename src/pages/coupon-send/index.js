import ApiCoupon from '../../api/coupon'
import ApiCouponBag from '../../api/coupon-bag'
import ApiUser from '../../api/user'

import business from '../../utils/business'
const pagination = require('../../utils/mixins-pagination')

const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    tabList: ['优惠券', '组合券包'],
    tabIndex: 0,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    wx.hideShareMenu()
    this.setData(getDefaultData(options, this))
    this.getList()
  },

  getList () {
    let { result, dataList } = this.data
    let obj = [this.data.tabIndex === 0 ? ApiCoupon : ApiCouponBag][0]
    obj.listByStore({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        type: this.data.tabIndex
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },

  onShareAppMessage () {
    const shareData = this.data.shareData
    let path = `/pages/coupon-detail/coupon-detail?id=${shareData.couponId}`
    if (+this.data.tabIndex === 0) { // 普通券
      this.shareForward()
    }
    if (+this.data.tabIndex === 1) { // 组合券包
      this.shareForward2()
      path = `/pages-subpackages/promotion/pages/coupon-bag-detail/index?id=${shareData.id}`
    }
    path += `&empid=${wx.getStorageSync('empidCommission')}&storeId=${wx.getStorageSync('storeId')}`
    return {
      title: shareData.shareDesc || shareData.name,
      imageUrl: shareData.shareImg || `https://qiniu.icaodong.com/xcx/common/coupon-share-poster3.png?v=1.0.0`,
      path
    }
  },
  share (e) {
    this.setData({ shareData: e.detail.item })
  },
  saved () {
    console.log('saved')
    this.shareForward()
  },
  shareForward () {
    business.tjForward({ ApiUser, id: this.data.shareData.couponId, kind: 1 })
  },
  // 分享券包------开始
  goDetail ({ currentTarget: { dataset: { item } } }) {
    wx.navigateTo({ url: `/pages-subpackages/promotion/pages/coupon-bag-detail/index?id=${item.id}` })
  },
  closeShareCoupons () {
    this.setData({ showShareCoupons: false })
  },
  onShareCoupons ({ currentTarget: { dataset: { item } } }) {
    let scene = business.sceneStringify({
      pageId: 6,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      id: item.id
    })
    this.setData({
      shareData: item,
      showShareCoupons: true,
      shareText: item.shareDesc || item.name,
      imgList: [item.shareImg || `https://qiniu.icaodong.com/xcx/common/coupon-share-poster3.png?v=1.0.0`],
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved2 () {
    console.log('saved2')
    this.shareForward2()
  },
  shareForward2 () {
    business.tjForward({ ApiUser, id: this.data.shareData.id, kind: 4 })
  },
  // 分享券包------结束

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },
  ...pagination
})
