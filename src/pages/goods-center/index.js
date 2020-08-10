import business from '../../utils/business'
const ApiGroup = require('../../api/group')
const mixinsPagination = require('../../utils/mixins-pagination')
const app = getApp()

Page({
  data: {
    resData: {},
    userType: '',
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    keyword: ''
  },
  onLoad () {
    wx.hideShareMenu()
    this.setData({ userType: wx.getStorageSync('userType') })
    this.getList()
  },
  onShow () {
  },
  getList () {
    let { result, dataList } = this.data
    ApiGroup.activeList({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        keyword: this.data.keyword
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },
  ...mixinsPagination,
  onShareAppMessage (e) {
    if (e.from !== 'button') {
      return
    }
    const dataset = e.target.dataset
    // const index = dataset.index
    // const obj = this.data.dataList[index]
    const item = dataset.item
    const groupId = item.id
    const obj = this.data.dataList.filter(v => +v.id === +groupId)[0]
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
    const empid = wx.getStorageSync('empidCommission')
    ApiGroup.forward({
      data: {
        empId: empid,
        groupId: groupId,
        type: 1 // 类型 1转发 2浏览
      }
    })
    const path = `/pages/product/product?id=${obj.productId}&activeId=${groupId}&activeType=group${empid ? `&empid=${empid}` : ''}&storeId=${wx.getStorageSync('storeId')}`
    console.log('分享路径', path)
    return {
      path,
      title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      imageUrl: obj.productImg
    }
  },
  close () {
    this.setData({ showShare: false })
  },
  showShare (e) {
    const dataset = e.currentTarget.dataset
    const index = dataset.index
    const resData = this.data.dataList[index]
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
      resData,
      showShare: true,
      imgList: [resData.productImg],
      shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  handleSearchConfirm ({ detail }) {
    this.setData({ keyword: detail })
    this.resetPaginationAndList()
    this.getList()
  }
})
