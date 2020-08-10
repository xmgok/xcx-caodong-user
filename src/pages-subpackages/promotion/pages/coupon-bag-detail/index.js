import ApiCouponBag from '../../../../api/coupon-bag'
import ApiUser from '../../../../api/user'

import business from '../../../../utils/business'
const pagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options, self) {
  const obj = { // 默认值
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    showDialog: false,
    iPhoneX: wx.getStorageSync('iPhoneX'),
    brandName: wx.getStorageSync('brandName'),
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
    business.tjPreview({ ApiUser, options: this.options, id: this.options.id, kind: 4, pageThis: this })
    this.getList()
    this.getInfo()
  },
  getInfo () {
    ApiCouponBag.info({
      data: {
        couponPackId: this.data.options.id
      },
      success: res => {
        this.setData({ resData: res.data })
      }
    })
  },
  getList () {
    let { result, dataList } = this.data
    ApiCouponBag.infoList({
      data: {
        couponPackId: this.data.options.id,
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        type: this.data.tabIndex
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },
  onGet () {
    const resData = this.data.resData
    if (resData.isGet !== 0) return
    if (this.data.isConfirm) return
    this.data.isConfirm = true
    wx.showLoading({ title: '领取中' })
    ApiCouponBag.acquire({
      data: {
        couponPackId: this.data.options.id
      },
      success: () => {
        wx.hideLoading()
        const timeout = 2000
        wx.showToast({ title: `领取成功`, icon: 'none', duration: timeout })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, timeout)
        // this.resetPaginationAndList()
        // this.showDialog()
        // this.getList()
      },
      fail: () => {
        wx.hideLoading()
        this.data.isConfirm = false
      }
    })
  },
  showDialog () {
    this.setData({ showDialog: true })
  },
  hideDialog () {
    this.setData({ showDialog: false })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },
  ...pagination
})
