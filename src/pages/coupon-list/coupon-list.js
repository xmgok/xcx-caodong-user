import ApiCoupon from '../../api/coupon'

const pagination = require('../../utils/mixins-pagination')

Page({
  data: {
    tabList: ['', '未使用', '已使用', '已过期'],
    tabIndex: 1,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: []
  },
  onLoad (options) {
    this.setData({ options })
    this.getList()
  },
  getList () {
    let { result } = this.data
    ApiCoupon.couponMyNew({
      params: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        type: this.data.tabIndex
      },
      success: res => {
        res.data.dataList.forEach(item => {
          if (item.price) {
            item['_price_big'] = item.price.split('.')[0]
            item['_price_small'] = item.price.split('.')[1]
          }
        })
        this.setData({ dataList: this.data.dataList.concat(res.data.dataList) })
        this.setPagination(res.data)
      }
    })
  },
  goToUse ({ currentTarget: { dataset: { id, type } } }) {
    wx.navigateTo({ url: `/pages/coupon-goods/coupon-goods?id=${id}&type=${type}` })
  },
  goDetail ({ currentTarget: { dataset } }) {
    wx.navigateTo({
      url: `/pages-subpackages/promotion/pages/coupon-detail-my/index?id=${dataset.item.couponCustomerId}`
    })
  },

  ...pagination
})
