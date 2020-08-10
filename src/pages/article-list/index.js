import ApiUser from '../../api/user'
import business from '../../utils/business'

const ApiArticle = require('../../api/article')
const mixinsPagination = require('../../utils/mixins-pagination')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    tabList: ['全部', '未开始', '进行中', '已结束'],
    tabIndex: 2,
    showTab: false,
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
    obj.options = options
    options.type = options.type || obj.tabIndex
    obj.tabIndex = options.type
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  getList () {
    let { result, dataList, options } = this.data
    ApiArticle.articleList({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        status: options.type
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },

  goTaskDetail ({ currentTarget: { dataset: { item } } }) {
    if (+item.status !== 2) {
      return
    }
    let url = ''
    if (+item.type === 1) {
      url = '/pages/task-step-fans/task-step-fans'
    }
    if (+item.type === 2) {
      url = '/pages/task-step/task-step'
    }
    if (+item.type === 3) {
      url = '/pages/task-step-kpi/task-step-kpi'
    }
    wx.navigateTo({
      url: url + '?id=' + item.id
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination,

  onShareAppMessage () {
    this.shareForward()
    const shareData = this.data.shareData
    return {
      title: shareData.shareDesc,
      imageUrl: shareData.shareImg,
      path: `/pages/article-detail/index?id=${shareData.id}&empid=${wx.getStorageSync('empidCommission')}&storeId=${wx.getStorageSync('storeId')}`
    }
  },
  onShareCoupons (e) {
    const dataset = e.currentTarget.dataset
    const { item } = dataset
    let scene = business.sceneStringify({
      pageId: 10,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      userid: wx.getStorageSync('userid'),
      id: item.id
    })
    this.setData({
      shareData: item,
      imgList: [item.shareImg],
      showShareCoupons: true,
      shareText: item.shareDesc,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved () {
    this.shareForward()
  },
  shareForward () {
    business.tjForward({ ApiUser, id: this.data.shareData.id, kind: 2 })
  },
  close () {
    this.setData({ showShareCoupons: false })
  }
})
