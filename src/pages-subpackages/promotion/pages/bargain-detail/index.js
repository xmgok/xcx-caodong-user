import ApiBargain from '../../../../api/bargain'
import { timeCountDown } from '../../../../utils/index'
import business from '../../../../utils/business'
const mixinsPagination = require('../../../../utils/mixins-pagination')
const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    showPurchase: false,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    bargained: {},
    showDialog: false,
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    options = this.options
    if (options.reduceId) { // 任务转发进入
      ApiBargain.create({
        data: {
          reduceId: options.reduceId // 砍价ID
        },
        success: (res) => {
          this.data.options.id = res.data
          this.getList()
          this.getInfo()
          this.sharePreview()
        },
        fail: (res) => {
          if (res.message === '活动已结束') {
            this.setData({ is500: true })
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/index/index' })
            }, 1000)
          }
        }
      })
    } else { // 砍价列表进入
      this.getList()
      this.getInfo()
      this.sharePreview()
    }
  },

  onUnload () {
    this.clearInterval()
  },
  clearInterval () {
    clearInterval(this.data.resData._timer)
  },

  getList () {
    let { result, dataList } = this.data
    ApiBargain.detailsList({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        recordId: this.options.id
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },

  getInfo () {
    this.clearInterval()
    ApiBargain.info({
      data: {
        recordId: this.options.id
      },
      success: res => {
        this.setData({ resData: res.data })
        const resData = this.data.resData
        if (resData._isRuning) {
          timeCountDown({
            seconds: resData.countDown,
            callback: {
              run: (json) => {
                resData.remainingSecondsFormat = json
                this.setData({ resData })
              },
              over: () => {
                this.onPullDownRefresh()
              }
            }
          })
          resData._timer = timeCountDown.timer
        }
      }
    })
  },

  onPullDownRefresh () {
    this.clearInterval()
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination,

  onShareAppMessage () {
    this.shareForward()
    let shareParams = {}
    const shareData = this.data.resData
    const userid = wx.getStorageSync('userid')
    const empidCommission = wx.getStorageSync('empidCommission')
    shareParams = {
      path: `/pages-subpackages/promotion/pages/bargain-detail/index?id=${shareData.recordId}${userid ? `&userid=${userid}` : ''}${empidCommission ? `&empid=${empidCommission}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起砍价吧。`,
      imageUrl: shareData.productImg
    }
    return shareParams
  },
  onShareCoupons (e) {
    const dataset = e.currentTarget.dataset
    const { item } = dataset
    if (item.isPay) return
    let scene = business.sceneStringify({
      pageId: 3,
      storeId: wx.getStorageSync('storeId'),
      userid: wx.getStorageSync('userid'),
      empid: wx.getStorageSync('empidCommission'),
      id: item.recordId
    })
    this.setData({
      shareData: item,
      imgList: [item.productImg],
      showShareCoupons: true,
      activePrice: item.productPrice, // diffAmount
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起砍价吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved () {
    this.shareForward()
  },
  shareForward () {
    ApiBargain.forward({
      data: {
        forwarderId: wx.getStorageSync('loginId'),
        recordId: this.data.options.id,
        type: 1
      }
    })
  },
  sharePreview () {
    // 防止下拉刷新也统计
    if (this.data.isTriggerTjPreview) return
    this.data.isTriggerTjPreview = true
    // 统计
    ApiBargain.forward({
      data: {
        forwarderId: this.data.options.userid || this.data.options.empid,
        recordId: this.data.options.id,
        type: 2
      }
    })
  },
  close () {
    this.setData({ showShareCoupons: false })
  },
  submit (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    if (item.isPay) return
    this.setData({ showPurchase: true, buyData: item })
  },
  goodsPurchaseSelected () {
    this.setData({ showPurchase: false })
    wx.navigateTo({ url: '/pages/order-confirm/order-confirm' })
  },
  goodsPurchaseClose () {
    this.setData({ showPurchase: false })
  },
  onBargain () {
    let { resData } = this.data
    ApiBargain.detailsCreate({
      data: {
        recordId: resData.recordId,
        reduceId: resData.reduceId
      },
      success: res => {
        this.showDialog()
        this.setData({ bargained: res.data })
        this.resetPaginationAndList()
        this.getList()
        this.getInfo()
      }
    })
  },
  showDialog () {
    this.setData({ showDialog: true })
  },
  hideDialog () {
    this.setData({ showDialog: false })
  },
  wantToJoin (e) {
    const dataset = e.currentTarget.dataset
    const item = dataset.item
    ApiBargain.create({
      data: {
        reduceId: item.reduceId // 砍价ID
      },
      success: ({ data }) => {
        wx.navigateTo({
          url: `/pages-subpackages/promotion/pages/bargain-detail/index?id=${data}`
        })
      }
    })
  },
  goGoodsDetail (e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/product/product?id=${item.productId}&type=1`
    })
  }
})
