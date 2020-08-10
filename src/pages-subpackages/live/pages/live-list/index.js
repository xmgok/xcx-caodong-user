import ApiLive from '../../../../api/live'
import business from '../../../../utils/business'

const app = getApp()

Page({
  data: {
    listData: [],
    userInfo: ''
  },

  onLoad () {
    this.getList()
  },

  onPullDownRefresh () {
    this.getList()
    wx.stopPullDownRefresh()
  },
  getList () {
    ApiLive.open({
      success: ({ data }) => {
        this.setData({ listData: data.roomList })
      }
    })
  },
  imgLoad ({ detail, currentTarget }) {
    const id = currentTarget.dataset.id
    let listData = this.data.listData
    detail.height = 344 * detail.height / detail.width
    detail.width = 344
    listData.forEach((item) => {
      if (Number(item.id) === Number(id)) {
        item._width = detail.width
        item._height = detail.height
      }
    })

    this.setData({ listData })
  },
  handleListData (newVal) {
    if (this.data.pageNum === 1) {
      this.data.listData = []
    }
    newVal.forEach((item) => {
      item.imgUrl = item.imgUrl.split(',')
      item._width = '344'
      item._height = '344'
    })
    const listData = this.data.listData.concat(newVal)
    this.setData({ listData })
  },
  bindLoadImg ({ detail, currentTarget }) {
    const id = currentTarget.dataset.id
    let listData = this.data.listData
    detail.height = 344 * detail.height / detail.width
    detail.width = 344
    listData.forEach((item) => {
      if (Number(item.id) === Number(id)) {
        item._width = detail.width
        item._height = detail.height
      }
    })

    this.setData({ listData })
  },
  onShare ({ currentTarget: { dataset } }) {
    console.log(dataset)
    const scene = business.sceneStringify({
      pageId: 12,
      roomId: dataset.roomId,
      role: 'audience',
      empid: wx.getStorageSync('empidCommission'),
      storeId: wx.getStorageSync('storeId')
    })

    const userInfo = this.data.listData[dataset.index]
    this.setData({
      userInfo,
      showShare: true,
      imgList: [userInfo.imgUrl],
      shareText: userInfo.name,
      shareUrl: business.scene2Qr(scene, app)
    })
  },

  onShareAppMessage () {
    const empId = wx.getStorageSync('empidCommission')
    const storeId = wx.getStorageSync('storeId')
    const { id, name } = this.data.userInfo
    const path = `/pages-subpackages/live/pages/live-room/index?id=${id}${empId ? `&empid=${empId}` : ''}${storeId ? `&storeId=${storeId}` : ''}`
    console.log('分享路径', path)
    return {
      path,
      title: name || '',
      imageUrl: this.data.imgList[0]
    }
  }
})
