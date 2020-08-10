import business from '../../utils/business'
const ApiTask = require('../../api/task')
// const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
const ApiGroup = require('../../api/group')
const mixinsPagination = require('../../utils/mixins-pagination')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    tabList: ['业绩排名', '任务商品', '活动商品'],
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
    resData2: {},
    userInfo: {},
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
    wx.hideShareMenu()
    this.setData(getDefaultData(options))
    this.byTask()
    this.infoApp()
    this.getUser()
  },

  getList () {
    let { result, dataList, options } = this.data
    ApiTask.getList({
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

  byTask () {
    ApiTask.byTask({
      data: {
        taskId: this.data.options.id
      },
      success: res => {
        this.setData({ resData: res.data })
      }
    })
  },

  infoApp () {
    ApiTask.infoApp({
      data: { taskId: this.data.options.id },
      success: res => {
        const resData2 = res.data || {}
        this.setData({ resData2 })
      }
    })
  },

  getUser () {
    ApiUser.getuser({
      success: ({ data }) => {
        this.setData({ userInfo: data })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination,
  onReachBottom () {
    // let { result } = this.data
    // this.setCurPageIncrement()
    // if (result.pageNum > result.totalPage) return
    // this.getList()
  },

  close () {
    this.setData({ showShare: false })
  },

  onShareAppMessage ({ from, target }) {
    const empidCommission = wx.getStorageSync('empidCommission')
    let shareParams = {}
    if (from === 'button' && !target.dataset.activeType) {
      const product = this.data.shareData
      // ApiProduct.transmit({
      //   data: {
      //     id: product.productId,
      //     mids: [] // 为空数组，会报系统异常。
      //   }
      // })
      ApiUser.transferAdd({
        data: {
          productId: product.id,
          productCode: product.productCode || '',
          price: product.price || 0,
          addPrice: 0
        }
      })
      shareParams = {
        path: `/pages/product/product?id=${product.id}${empidCommission ? `&empid=${empidCommission}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
        title: product.name || '',
        imageUrl: product.imgUrl
      }
    }
    if (from === 'button' && target.dataset.activeType === 'group') { // 分享拼团活动
      const obj = target.dataset.item
      ApiGroup.forward({
        data: {
          empId: empidCommission,
          groupId: obj.id,
          type: 1 // 类型 1转发 2浏览
        }
      })
      shareParams = {
        path: `/pages/product/product?id=${obj.productId}&activeId=${obj.id}&activeType=group${empidCommission ? `&empid=${empidCommission}` : ''}`,
        title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
        imageUrl: obj.productImg
      }
    }
    console.log('分享的数据', shareParams)
    return shareParams
  },

  showShare (e) {
    const dataset = e.currentTarget.dataset
    const resData = dataset.item
    let scene = business.sceneStringify({
      pageId: 1,
      storeId: wx.getStorageSync('storeId'),
      activeType: dataset.activeType,
      activeId: resData.id,
      id: resData.productId,
      empid: wx.getStorageSync('empidCommission'),
      userid: wx.getStorageSync('userid')
    })
    let shareText = resData.name
    if (resData.type === 'group') {
      shareText = `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`
    }
    this.setData({
      shareData: resData,
      activeType: dataset.activeType,
      showShare: true,
      imgList: [resData.imgUrl],
      shareText,
      shareUrl: business.scene2Qr(scene, app)
    })
  }
})
