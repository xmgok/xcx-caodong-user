import ApiLive from '../../../../api/live'
import business from '../../../../utils/business'

const app = getApp()

// 直播室状态
const LIVE_STATUS = { 101: '直播中', 102: '未开始', 103: '已结束', 104: '禁播', 105: '暂停中', 106: '异常' }
// 禁用样式状态
const DISABLED_STATUS = [103, 104, 106]

Page({
  data: {
    listData: [],
    pageNum: 1,
    pageSize: 20,
    loading: false,
    reachBottom: false,
    roomInfo: '',
    showShare: false
  },

  onLoad () {
    this.getList()
  },

  onPullDownRefresh () {
    this.setData({ listData: [], pageNum: 1, loading: false, reachBottom: false })
    this.getList()
  },

  onReachBottom () {
    this.getList()
  },

  getList () {
    if (this.data.reachBottom || this.data.loading) return
    this.setData({ loading: true })

    wx.showLoading()
    ApiLive.getLiveList({
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: ({ data: { dataList } }) => {
        wx.hideLoading()
        wx.stopPullDownRefresh()

        const listData = (dataList || []).map(v => {
          v._liveStatusText = LIVE_STATUS[v.status]
          v._statusCls = DISABLED_STATUS.indexOf(v.status) > -1 ? 'disabled' : ''

          v.coverImg = `https${v.coverImg.substring(v.coverImg.indexOf('://'))}`
          v.anchorImg = `https${v.anchorImg.substring(v.anchorImg.indexOf('://'))}`
          return v
        })
        this.setData({
          listData: this.data.listData.concat(listData),
          loading: false,
          reachBottom: listData.length < this.data.pageSize,
          pageNum: ++this.data.pageNum
        })
      }
    })
  },

  onShare ({ currentTarget: { dataset } }) {
    const scene = business.sceneStringify({
      pageId: 14,
      id: dataset.roomId,
      empid: wx.getStorageSync('empidCommission'),
      storeId: wx.getStorageSync('storeId')
    })

    const roomInfo = this.data.listData.find(v => v.roomId === dataset.roomId)
    this.setData({
      roomInfo,
      showShare: true,
      imgList: [roomInfo.coverImg],
      shareText: roomInfo.name,
      shareUrl: business.scene2Qr(scene, app)
    })
  },

  onShareAppMessage () {
    const empId = wx.getStorageSync('empidCommission')
    const storeId = wx.getStorageSync('storeId')
    const { roomId, name } = this.data.roomInfo
    const path = `/pages-subpackages/live/pages/live-board/index?id=${roomId}${empId ? `&empid=${empId}` : ''}${storeId ? `&storeId=${storeId}` : ''}`
    console.log('分享路径', path)
    this.setData({ showShare: false })

    return {
      path,
      title: name || '',
      imageUrl: this.data.imgList[0]
    }
  },

  posterClosed () {
    this.setData({ showShare: false })
  },

  posterSaved () {
    this.setData({ showShare: false })
  }
})
