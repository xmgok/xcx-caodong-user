import business from '../../utils/business'
const ApiGroup = require('../../api/group')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    resData: {},
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
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
    this.getDetail()
    this.getList()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  returnPrevPage () {
    wx.navigateBack({
      delta: 1
    })
  },
  getDetail () {
    ApiGroup.empDetails({
      data: {
        groupId: this.data.options.activeId
      },
      success: (res) => {
        this.setData({ resData: res.data })
      }
    })
  },
  getList () {
    let { result, dataList } = this.data
    ApiGroup.empList({
      data: {
        groupId: this.data.options.activeId,
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },
  setPagination (data = {}) {
    this.setData({
      result: {
        totalPage: data.totalPage,
        totalCount: data.totalCount,
        pageNum: data.pageNum,
        pageSize: this.data.result.pageSize
      }
    })
  },
  setCurPageIncrement () {
    let { result } = this.data
    result.pageNum++
    this.setData({ result })
  },
  bindscrolltolower () {
    let { result } = this.data
    this.setCurPageIncrement()
    if (result.pageNum > result.totalPage) return
    this.getList()
  },
  onShareAppMessage ({ from, target }) {
    const empid = wx.getStorageSync('empidCommission')
    let shareParams = {}
    const obj = this.data.resData
    ApiGroup.forward({
      data: {
        empId: empid,
        groupId: obj.id,
        type: 1 // 类型 1转发 2浏览
      }
    })
    shareParams = {
      path: `/pages/product/product?id=${obj.productId}&activeId=${obj.id}&activeType=group${empid ? `&empid=${empid}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      // title: obj.productName,
      title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      imageUrl: obj.productImg
    }
    console.log('分享的数据', shareParams)
    return shareParams
  },
  showShare () {
    const resData = this.data.resData
    let scene = business.sceneStringify({
      pageId: 1,
      storeId: wx.getStorageSync('storeId'),
      activeType: 'group',
      activeId: resData.id,
      id: resData.productId,
      empid: wx.getStorageSync('empidCommission'),
      userid: wx.getStorageSync('userid')
    })
    this.setData({
      showShare: true,
      imgList: [resData.productImg],
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  }
})
