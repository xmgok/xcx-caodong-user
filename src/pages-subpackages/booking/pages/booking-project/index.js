import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')
const mixinsPagination = require('../../../../utils/mixins-pagination')

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
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getList()
  },
  // 是否选中
  doCheck ({ currentTarget }) {
    const index = currentTarget.dataset.index
    const list = this.data.dataList

    list[index].checked = !list[index].checked
    this.setData({ dataList: list })
  },
  getSelected () {
    return this.data.dataList.filter(v => v.checked)
  },
  confirm () {
    wx.setStorageSync('bookingChooseProject', this.getSelected())
    wx.navigateBack({ delta: 1 })
  },

  getList () {
    let { result, dataList, options } = this.data
    const storeId = options.storeId
    ApiBooking.bookingProjectList({
      data: {
        storeId: storeId ? Number(storeId) : '',
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
    const bookingChooseProject = wx.getStorageSync('bookingChooseProject') || []
    if (bookingChooseProject.length) {
      dataList.forEach(v => {
        if (bookingChooseProject.findIndex(v2 => v2.id === v.id) !== -1) {
          v.checked = true
        }
      })
    }
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
