import business from '../../utils/business'
const ApiTebu = require('../../api/tebu-active')
const ApiUser = require('../../api/user')
const mixinsPagination = require('../../utils/mixins-pagination')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    isShowHint: false,
    inputValue: '',
    idMark: '',
    dataList: [],
    infoData: {},
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    const scene = business.sceneParse(options.scene)
    options = {
      ...options,
      ...scene
    }
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    // 如果已经点亮了，则跳优惠券领取页面。
    // 留言之后，才发送优惠券。
    this.setData(getDefaultData(options))
    this.getDetail()
  },

  getDetail () {
    const options = this.data.options
    console.log('options', options)
    ApiTebu.info({
      data: {
        inviteId: options.userid || options.empid || ''
      },
      success: res => {
        // res.data.isLighten = 1 // 测试数据
        // res.data.isMessage = 1 // 测试数据
        this.setData({ infoData: res.data })
        if (res.data.isLighten === 0 && res.data.isMessage === 1) {
          this.getList()
        } else if (res.data.isLighten === 0 && res.data.isMessage === 0) {
          this.setData({ isShowCoupon: true })
          // wx.redirectTo({ url: `/pages/tb-active-coupon/index?inviteId=${options.empid || options.userid || ''}` })
        }
      }
    })
  },

  getList () {
    ApiTebu.message_list({
      data: {
        pageNum: 1,
        pageSize: 200
      },
      success: res => {
        const dataList = res.data.dataList.reverse()
        this.setData({ dataList: dataList, idMark: `id${dataList.length ? dataList[dataList.length - 1].id : ''}` })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination,

  taphigh (e) {
    console.log('点亮风火台')
    if (this.data.taphighIsClick) return
    this.data.taphighIsClick = true
    ApiUser.msgFormIdAdd({
      data: { formId: (e.detail.formId || ''), type: 2 }
    })
    const options = this.data.options
    ApiTebu.lighten({
      data: {
        inviteId: options.userid || options.empid || ''
      },
      success: res => {
        const infoData = this.data.infoData
        this.setData({ resData: res.data, isShowHint: true })
        this.getList()
        setTimeout(() => {
          infoData.isLighten = 0
          infoData.isMessage = 1
          this.setData({ infoData, isShowHint: false })
        }, 4000)
      },
      complete: () => {
        delete this.data.taphighIsClick
      }
    })
  },
  bindscrolltoupper () {
    console.log('滚动到顶部')
  },
  bindinput (e) {
    console.log('输入框输入', e)
    this.setData({ inputValue: e.detail.value })
  },
  bindsubmit () {
    console.log('留言')
    if (this.data.bindsubmitIsClick) return
    this.data.bindsubmitIsClick = true
    if (!this.data.inputValue) {
      wx.showToast({ title: '留言不能为空', icon: 'none' })
      return
    }
    const options = this.data.options
    ApiTebu.lighten({
      data: {
        inviteId: options.userid || options.empid || '',
        message: this.data.inputValue
      },
      success: res => {
        this.setData({ resData: res.data, inputValue: '' })
        this.getList()
        setTimeout(() => {
          // wx.redirectTo({ url: `/pages/tb-active-coupon/index?inviteId=${options.empid || options.userid || ''}` })
          this.setData({ isShowCoupon: true, 'infoData.isLighten': 0, 'infoData.isMessage': 0 })
        }, 2000)
      },
      complete: () => {
        delete this.data.bindsubmitIsClick
      }
    })
  },

  onShareAppMessage () {
    const queryStr = business.queryStringify({
      userid: wx.getStorageSync('userid'),
      empid: wx.getStorageSync('empidCommission'),
      storeId: wx.getStorageSync('storeId')
    }, true)
    const shareInfo = {
      path: `/pages/tb-active-detail/index${queryStr}`,
      title: `邀请你参加和谢霆锋点亮风火台活动`,
      imageUrl: `https://qiniu.icaodong.com/tebu/onshare.jpg`
    }
    console.log('shareInfo', shareInfo)
    return shareInfo
  },
  onShare () {
    let scene = business.sceneStringify({
      pageId: 13,
      userid: wx.getStorageSync('userid'),
      empid: wx.getStorageSync('empidCommission'),
      storeId: wx.getStorageSync('storeId')
    })
    this.setData({
      imgList: [`https://qiniu.icaodong.com/tebu/onposter.jpg`],
      showShare: true,
      shareText: `邀请你参加点风火台活动，有机会赢取谢霆锋亲笔签名海报`,
      shareUrl: business.scene2Qr(scene, app)
    })
  }
})
