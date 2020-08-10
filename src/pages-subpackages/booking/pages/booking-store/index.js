import business from '../../../../utils/business'

const ApiBooking = require('../../../../api/booking')
const mixins = require('../../../../utils/mixins')
const mixinsPagination = require('../../../../utils/mixins-pagination')

const app = getApp()

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    loginId: wx.getStorageSync('loginId'),
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    search: {
      latitude: '',
      longitude: '',
      name: '',
      city: ''
    },
    myCity: '',
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    // obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  // data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.clearStore()
  },
  onShow () {
    wx.setNavigationBarTitle({ title: `${this.data.options.type === 'switchStore' ? '切换' : '预约'}门店` })
    this.init()
  },
  init () {
    this.resetPaginationAndList()
    this.getChooseCity()
    wx.getLocation({
      success: res => {
        this.data.search.latitude = String(res.latitude)
        this.data.search.longitude = String(res.longitude)
        this.setData({ search: this.data.search })
        this.getCurrentCity(String(res.latitude), String(res.longitude))
      },
      fail: () => {
        this.data.search.latitude = app.latitude
        this.data.search.longitude = app.longitude
        this.setData({ search: this.data.search })
        this.getCurrentCity(app.latitude, app.longitude)
      }
    })
  },

  getCurrentCity (latitude, longitude) {
    ApiBooking.getCurrentCity({
      data: {
        latitude,
        longitude
      },
      success: (res) => {
        this.setData({ myCity: res.data })
        this.getList()
      }
    })
  },

  clearStore () {
    wx.removeStorageSync('bookingChooseCity')
  },

  // 选项
  doCheck ({ currentTarget }) {
    const index = currentTarget.dataset.index
    const dataList = this.data.dataList
    dataList.forEach(e => {
      e.checked = false
    })
    dataList[index].checked = !dataList[index].checked
    this.setData({ dataList })
  },
  getSelected () {
    return this.data.dataList.find(v => v.checked) || {}
  },
  confirm () {
    const obj = this.getSelected()
    if (this.data.options.type === 'switchStore') { // 消费者 - 切换门店
      if (obj.id === wx.getStorageSync('storeId')) {
        wx.showToast({ title: `请选择和当前门店不同的门店进行切换`, icon: 'none', duration: 3000 })
        return
      }
      wx.removeStorageSync('empidCommission')
      app.globalData.hasSwitchStore = true
      app.login({ storeId: obj.id, redirectUrl: '/pages/index/index' })
      return
    }
    const bookingChooseStore = wx.getStorageSync('bookingChooseStore')
    if (bookingChooseStore && obj.id !== bookingChooseStore.id) {
      wx.removeStorageSync('bookingChooseProject')
    }
    wx.setStorageSync('bookingChooseStore', obj)
    wx.navigateBack({ delta: 1 })
  },
  bindConfirm () {
    this.resetPaginationAndList()
    this.getList()
    console.log('search')
  },

  toChooseCity () {
    wx.navigateTo({ url: `/pages-subpackages/booking/pages/booking-city/index?myCity=${this.data.myCity}` })
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

  getList () {
    let { result, dataList, options } = this.data
    ApiBooking[options.type === 'switchStore' ? 'switchStoreList' : 'bookingStoreList']({
      data: {
        ...this.data.search,
        city: this.data.search.city || this.data.myCity,
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: res => {
        const data = res.data
        dataList = dataList.concat(data.dataList)
        this.toSelected(dataList)
        this.setData({ dataList })
        this.setPagination(data)
      }
    })
  },

  toSelected (dataList) {
    const bookingChooseStore = wx.getStorageSync('bookingChooseStore') || {}
    if (bookingChooseStore.id) {
      dataList.forEach(v => {
        if (bookingChooseStore.id === v.id) {
          v.checked = true
        }
      })
    }
  },
  getChooseCity () {
    let chooseCity = wx.getStorageSync('bookingChooseCity')
    if (chooseCity && chooseCity.name) {
      this.data.search.city = chooseCity.name
      this.setData({ search: this.data.search })
    }
  },

  bindChange (e) {
    const arr = e.detail.value.split('-')
    this.setData({
      year: arr[0],
      month: arr[1]
    })
    this.resetPaginationAndList()
    this.getList()
  },

  onPullDownRefresh () {
    this.init()
    wx.stopPullDownRefresh()
  },

  goDetail (e) {
    const { item } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages-subpackages/common/pages/store-detail/index?id=${item.id}` })
  },

  ...mixins,
  ...mixinsPagination
})
