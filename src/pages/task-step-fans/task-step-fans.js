import business from '../../utils/business'
const ApiTask = require('../../api/task')
const ApiActivity = require('../../api/activity')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    resData: {},
    resData2: {},
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
    // this.getStep()
    this.infoApp()
  },

  forward ({ currentTarget: { dataset: { taskId, ruleId, step } } }) {
    ApiTask.sendmsg({
      data: {
        ruleId,
        url: '/task/step' // h5对应的任务步骤页面
      },
      success: res => {
        res.message && wx.showToast({ title: `${res.message}`, icon: 'none', duration: 4000 })
      }
    })
  },

  getStep () {
    wx.showLoading({ title: '数据载入中' })
    let { options } = this.data
    ApiTask.getStep({
      data: { taskId: options.id },
      success: res => {
        wx.hideLoading()
        const resData = res.data || {}
        this.setData({ resData })
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

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage ({ from, target }) {
    const info = this.data.resData2.taskActivity[0]
    ApiActivity.forwardAdd({
      data: { activityId: info.activityId, type: 1 }
    })
    const userid = wx.getStorageSync('userid') || ''
    const empidCommission = wx.getStorageSync('empidCommission') || ''
    const shareInfo = {
      path: `/pages/activity-confirm/activity-confirm?id=${info.activityId}&recordId=${info.recordId || ''}${userid ? `&userid=${userid}` : ''}${empidCommission ? `&empid=${empidCommission}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      title: info.shareTitle,
      imageUrl: info.shareImg
    }
    console.log('shareInfo', shareInfo)
    return shareInfo
  },

  onShare () {
    const info = this.data.resData2.taskActivity[0]
    const userid = wx.getStorageSync('userid') || ''
    const empidCommission = wx.getStorageSync('empidCommission') || ''
    const scene = business.sceneStringify({
      pageId: 11,
      storeId: wx.getStorageSync('storeId'),
      id: info.activityId,
      recordId: info.recordId,
      userid: userid,
      empid: empidCommission
    })
    this.setData({
      imgList: [info.shareImg],
      showShare: true,
      shareText: info.shareTitle || info.shareDesc,
      shareUrl: business.scene2Qr(scene, app)
    })
  }
})
