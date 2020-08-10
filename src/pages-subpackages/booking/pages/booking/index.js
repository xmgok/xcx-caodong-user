import business from '../../../../utils/business'
const mixins = require('../../../../utils/mixins')
const ApiBooking = require('../../../../api/booking')
const ApiCommon = require('../../../../api/common')

const ApiUser = require('../../../../api/user')
const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    form: {
      endTime: '',
      mobile: '',
      remarks: '',
      serviceIds: [],
      startTime: '',
      storeId: '',
      userName: ''
    },
    chooseTime: {},
    chooseStore: {},
    chooseProject: [],
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

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.clearStore()
  },

  onShow () {
    this.init()
  },

  init () {
    this.info()
    this.getChooseTime()
    this.getChooseStore()
    this.getChooseProject()
  },

  clearStore () {
    wx.removeStorageSync('bookingChooseTime')
    wx.removeStorageSync('bookingChooseStore')
    wx.removeStorageSync('bookingChooseProject')
  },

  info () {
    ApiBooking.settingDetail({
      success: ({ data }) => {
        if (data.type === 1) this.getMyStore()
        this.setData({ resData: data })
      }
    })
  },

  toChooseStore () {
    if (this.data.resData.type === 1) return
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-store/index` })
  },
  toChooseTime () {
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-time/index` })
  },
  toChooseProject () {
    if (this.data.resData.type !== 1 && !this.data.chooseStore.id) {
      wx.showToast({ title: '请先选择服务门店', icon: 'none', duration: 2000 })
      return
    }
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-project/index?storeId=${this.data.chooseStore.id}` })
  },
  toCall ({ currentTarget: { dataset: { managerMobile } } }) {
    wx.makePhoneCall({ phoneNumber: managerMobile })
  },
  openLocation ({ currentTarget: { dataset: { item } } }) {
    console.log('openLocation item', item)
    wx.openLocation({
      longitude: Number(item.longitude),
      latitude: Number(item.latitude),
      scale: 18,
      name: item.name,
      address: item.address,
      fail: (e) => {
        console.log('openLocation fail', e)
      }
    })
  },

  getChooseTime () {
    let chooseTime = wx.getStorageSync('bookingChooseTime')
    if (chooseTime && chooseTime.time) {
      this.data.form.startTime = `${chooseTime.day} ${chooseTime.time}:00`
      this.setData({ chooseTime, form: this.data.form })
    }
  },
  getChooseStore () {
    let chooseStore = wx.getStorageSync('bookingChooseStore')
    if (chooseStore && chooseStore.id) {
      this.data.form.storeId = chooseStore.id
      this.setData({ chooseStore, form: this.data.form })
    }
  },
  getMyStore () {
    ApiBooking.myStore({
      success: ({ data }) => {
        this.data.form.storeId = data.id
        this.setData({ chooseStore: data, form: this.data.form })
      }
    })
  },
  getChooseProject () {
    let chooseProject = wx.getStorageSync('bookingChooseProject') || []
    this.data.form.serviceIds = chooseProject.map(v => v.id)
    this.setData({ chooseProject, form: this.data.form })
  },

  confirm () {
    if (this.data.isConfirm) return
    this.data.isConfirm = true
    ApiCommon.subscribeMsg({
      data: { sceneId: 1 },
      success: (res) => {
        wx.requestSubscribeMessage({ // 订阅消息。
          tmplIds: res.data,
          success: (res) => console.log('success res', res),
          fail: (res) => console.log('fail res', res),
          complete: () => {
            this.fnCreate()
          }
        })
      },
      fail: () => {
        this.data.isConfirm = false
      }
    })
  },

  fnCreate () {
    ApiBooking.create({
      data: {
        ...this.data.form
      },
      success: ({ data }) => {
        this.clearStore()
        wx.redirectTo({ url: `/pages-subpackages/booking/pages/booking-success/index?code=${data.code}` })
      },
      fail: () => {
        this.data.isConfirm = false
      }
    })
  },

  bindgetphonenumber (e) {
    business.bindGetPhoneNumber(e, app, this)
  },
  sendPhoneNumber (datas = {}) {
    business.sendPhoneNumber(datas, ApiUser, this, ({ data }) => {
      this.setData({ 'form.mobile': data })
    })
  },

  onPullDownRefresh () {
    this.init()
    wx.stopPullDownRefresh()
  },

  ...mixins
})
