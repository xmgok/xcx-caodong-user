import business from '../../../../utils/business'
const ApiSeckill = require('../../../../api/seckill')
const mixinsPagination = require('../../../../utils/mixins-pagination')
const priceCtrl = require('../../../../utils/price')

function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    tabIndex: 0,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [
    ],
    resData: {},
    options: {},
    tabList: ['抢购中', '未开始'],
    tagOBJ: {
      0: '立即抢',
      2: '立即抢',
      1: '未开始'
    }
  }
  if (options) { // 根据options重置默认值
    obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = {
      ...options,
      ...business.sceneParse(options.scene)
    }
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
  formatPrice (list) {
    return list.map(item => {
      // 价格格式化
      const { int, dec } = priceCtrl.currency(item.activePrice)
      item.bigPrice = int
      item.samllPrice = dec
      return item
    })
  },
  getList () {
    let {
      result,
      dataList,
      options
    } = this.data
    ApiSeckill.list({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        status: options.type === 0 || !options.type ? 2 : options.type
      },
      success: res => {
        const data = res.data
        dataList = dataList.concat(data.dataList)
        this.setData({ dataList: this.data.dataList.concat(this.formatPrice(data.dataList)) })
        this.setPagination(data)
      }
    })
  },
  goProductDetail ({ currentTarget }) {
    const id = currentTarget.dataset.id
    const productId = currentTarget.dataset.productId
    wx.navigateTo({ url: `/pages/product/product?activeType=seckill&activeId=${id}&id=${productId}` })
  },
  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },
  ...mixinsPagination
})
