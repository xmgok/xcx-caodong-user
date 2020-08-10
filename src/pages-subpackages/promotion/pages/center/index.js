import business from '../../../../utils/business'
const Api = require('../../../../api/activity-center')
const mixinsPagination = require('../../../../utils/mixins-pagination')
const ApiUser = require('../../../../api/user')
const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    tabList: ['吸粉', '拼团', '秒杀', '砍价', '瓜分券', '满减送'],
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

  clearInterval () {
    this.data.dataList.forEach(v => {
      clearInterval(v._timer)
    })
  },
  onUnload () {
    this.clearInterval()
  },
  onLoad (options) {
    wx.hideShareMenu()
    this.setData(getDefaultData(options, this))
    Api.listTab({
      success: (res) => {
        console.log(res)
        const { activityCount, groupBuyCount, reducePriceCount, distCouponCount, discountCount, seckillCount } = res.data
        let index = 0
        if (activityCount) {
          index = 0
        } else if (groupBuyCount) {
          index = 1
        } else if (seckillCount) {
          index = 2
        } else if (reducePriceCount) {
          index = 3
        } else if (distCouponCount) {
          index = 4
        } else if (discountCount) {
          index = 5
        }
        this.setData({
          tabList: [`吸粉(${activityCount})`, `拼团(${groupBuyCount})`, `秒杀(${seckillCount})`, `砍价(${reducePriceCount})`, `瓜分券(${distCouponCount})`, `满减送(${discountCount})`],
          tabIndex: index,
          'options.tabIndex': index
        })
        this.getList()
      }
    })
  },

  getList () {
    const { result, tabIndex } = this.data
    let fnName = ''

    if (tabIndex === 0) { // 吸粉
      fnName = 'listFans'
    } else if (tabIndex === 1) { // 拼团
      fnName = 'listGroup'
    } else if (tabIndex === 2) { // 秒杀
      fnName = 'listSeckill'
    } else if (tabIndex === 3) { // 砍价
      fnName = 'listBargain'
    } else if (tabIndex === 4) { // 瓜分券
      fnName = 'listCouponSplit'
    } else if (tabIndex === 5) { // 满减送
      fnName = 'listDiscount'
    }

    if (fnName) {
      Api[fnName]({
        data: {
          pageNum: result.pageNum,
          pageSize: result.pageSize
        },
        success: ({ data }) => {
          this.setData({ dataList: this.data.dataList.concat(data.dataList) })
          this.setPagination(data)
        }
      })
    }
  },

  look ({ currentTarget: { dataset: { item: { id, activeGoods } } } }) {
    wx.navigateTo({
      url: `/pages/gift-goods/gift-goods?id=${id}&type=${activeGoods}`
    })
  },
  onShareAppMessage ({ from, target }) {
    let shareParams = {}
    const shareData = this.data.shareData
    const empidCommission = wx.getStorageSync('empidCommission')
    this.shareForward()
    if (from === 'button' && shareData.taskType === 'fans') {
      shareParams = {
        path: `/pages/activity-confirm/activity-confirm?id=${shareData.id}`,
        title: shareData.shareTitle,
        imageUrl: shareData.shareImg
      }
    }
    if (from === 'button' && shareData.taskType === 'group') {
      shareParams = {
        path: `/pages/product/product?id=${shareData.productId}&activeId=${shareData.id}&activeType=group`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
        imageUrl: shareData.productImg
      }
    }
    if (from === 'button' && shareData.taskType === 'seckill') {
      shareParams = {
        path: `/pages/product/product?id=${shareData.productId}&activeId=${shareData.id}&activeType=seckill`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来秒杀吧。`,
        imageUrl: shareData.productImg
      }
    }
    if (from === 'button' && shareData.taskType === 'bargain') {
      shareParams = {
        path: `/pages-subpackages/promotion/pages/bargain-detail/index?reduceId=${shareData.reduceId}`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起砍价吧。`,
        imageUrl: shareData.productImg
      }
    }
    if (from === 'button' && shareData.taskType === 'couponsSplit') {
      shareParams = {
        path: `/pages-subpackages/promotion/pages/coupon-split/index?id=${shareData.id}${shareData.parentId ? `&parentId=${shareData.parentId}` : ''}`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的券，快来一起瓜分吧。`,
        imageUrl: shareData.topImg
      }
    }
    if (shareParams.path.indexOf('?') === -1) {
      shareParams.path += `?storeId=${wx.getStorageSync('storeId')}`
    } else {
      shareParams.path += `&storeId=${wx.getStorageSync('storeId')}`
    }
    shareParams.path += `${empidCommission ? `&empid=${empidCommission}` : ''}`
    console.log('分享的数据', shareParams)
    return shareParams
  },
  onShareFans (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    let scene = business.sceneStringify({
      pageId: 4,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      recordId: item.recordId,
      id: item.id
    })
    item.taskType = 'fans'
    this.setData({
      shareData: item,
      imgList: [item.shareImg],
      showShareFans: true,
      shareText: item.shareTitle,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareGroup (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    let scene = business.sceneStringify({
      pageId: 1,
      storeId: wx.getStorageSync('storeId'),
      activeType: 'group',
      activeId: item.id,
      id: item.productId,
      empid: wx.getStorageSync('empidCommission')
    })
    item.taskType = 'group'
    this.setData({
      shareData: item,
      showShareGroup: true,
      imgList: [item.productImg],
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareSeckill (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    let scene = business.sceneStringify({
      pageId: 1,
      storeId: wx.getStorageSync('storeId'),
      activeType: 'seckill',
      activeId: item.id,
      id: item.productId,
      empid: wx.getStorageSync('empidCommission')
    })
    item.taskType = 'seckill'
    this.setData({
      shareData: item,
      showShareSeckill: true,
      imgList: [item.productImg],
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来秒杀吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  onShareBargain (e) {
    const dataset = e.currentTarget.dataset
    const { item } = dataset
    let scene = business.sceneStringify({
      pageId: 3,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      reduceId: item.reduceId
    })
    item.taskType = 'bargain'
    this.setData({
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
    const { item } = dataset
    let scene = business.sceneStringify({
      pageId: 2,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      id: item.id,
      parentId: item.parentId
    })
    item.taskType = 'couponsSplit'
    this.setData({
      shareData: item,
      imgList: [item.topImg],
      showShareCouponsSplit: true,
      activePrice: item.price,
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的券，快来一起瓜分吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved () {
    this.shareForward()
  },
  shareForward () {
    if (this.data.shareData.taskType === 'fans') {
      business.tjForward({ ApiUser, id: this.data.shareData.id, kind: 7 })
    }
    if (this.data.shareData.taskType === 'seckill') {
      business.tjForward({ ApiUser, id: this.data.shareData.id, kind: 6 })
    }
  },
  closeShareFans () {
    this.setData({ showShareFans: false })
  },
  closeShareGroup () {
    this.setData({ showShareGroup: false })
  },
  closeShareSeckill () {
    this.setData({ showShareSeckill: false })
  },
  closeShareBargain () {
    this.setData({ showShareBargain: false })
  },
  closeShareCouponsSplit () {
    this.setData({ showShareCouponsSplit: false })
  },
  onPullDownRefresh () {
    this.clearInterval()
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
