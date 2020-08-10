import ApiProduct from '../../../../api/product'
import ApiCoupon from '../../../../api/coupon'
import business from '../../../../utils/business'

const priceCtrl = require('../../../../utils/price')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options, self) {
  const obj = { // 默认值
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 100
    },
    iPhoneX: wx.getStorageSync('iPhoneX'),
    dataList: [],
    maxAmount: '',
    quantity: 1,
    currentIndex: null,
    giftNum: 0, // 已选几件
    giftAmount: 0, // 已选金额
    options: {},
    showPurchase: false, // 商品选择规格的弹窗
    productId: null // 哪个商品的选择规格弹窗
  }
  if (options) { // 根据options重置默认值
    // obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
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
    this.getDetail()
  },

  formatPrice (list) {
    return list.map(item => {
      // 价格格式化
      const { int, dec } = priceCtrl.currency(item.prePrice) // sellPrice
      item.sellPriceInteger = int
      item.sellPriceDecimal = dec
      item.number = item.number || 1
      return item
    })
  },
  getList () {
    ApiCoupon.couponGoods({
      params: {
        couponId: this.data.options.couponId,
        activeGoods: this.data.options.type,
        pageNum: this.data.result.pageNum,
        pageSize: this.data.result.pageSize
      },
      success: res => {
        this.setData({ dataList: this.data.dataList.concat(this.formatPrice(res.data.dataList)) })
        this.setPagination(res.data)
        this.selectedDefault()
      }
    })
  },
  getDetail () {
    const options = this.data.options
    const scene = business.sceneParse(this.data.options.scene)
    const id = scene.id || options.id
    ApiCoupon.couponInfoMy({
      params: { id },
      success: ({ data }) => {
        this.setData({ maxAmount: data.price })
      }
    })
  },

  selectedDefault () {
    const couponCustomerId = this.data.options.id
    ApiProduct.exchangeProduct({
      data: {
        couponCustomerId
      },
      success: (res) => {
        const dataList = this.data.dataList
        const productList = res.data.productList
        if (!productList) return
        productList.forEach(v1 => {
          const index = dataList.findIndex(v2 => v2.id === v1.productId)
          if (index !== -1) {
            dataList[index].checked = true
            dataList[index].specId = v1.specId
            dataList[index].number = v1.num
            dataList[index].specContent = v1.specContent
          }
        })
        const giftNum = this.getNum()
        const giftAmount = this.getMoney()
        this.setData({ giftAmount, giftNum, dataList })
      }
    })
  },
  doCheck ({ currentTarget }) {
    const dataset = currentTarget.dataset
    const dataList = this.data.dataList
    console.log('dataList[dataset.index]', dataList[dataset.index])
    dataList[dataset.index].checked = dataList[dataset.index].checked ? 0 : 1
    const giftNum = this.getNum()
    const giftAmount = this.getMoney()
    this.setData({ giftAmount, giftNum, dataList })
  },
  getNum () {
    const arr = this.data.dataList.filter(v => v.checked)
    let num = 0
    if (arr.length) {
      num = arr.reduce((v1, v2) => ({ number: v1.number + v2.number })).number
    }
    return num
  },
  getMoney () {
    const arr = this.data.dataList.filter(v => v.checked).map(v => v.number * v.prePrice) // sellPrice
    let num = 0
    if (arr.length) {
      num = arr.reduce((v1, v2) => v1 + v2)
    }
    return priceCtrl.keep2Decimal(num)
  },
  changeSpec ({ currentTarget: { dataset } }) {
    this.setData({ productId: '' })
    this.setData({
      productId: dataset.id,
      showPurchase: true,
      currentIndex: dataset.index,
      quantity: dataset.number,
      specContent: dataset.specContent || ''
    })
  },
  goodsPurchaseSelected (e) {
    const detail = e.detail
    console.log('goodsPurchaseSelected e.detail', detail)
    let dataList = this.data.dataList
    dataList[this.data.currentIndex].specId = detail.spec.id
    dataList[this.data.currentIndex].specContent = detail.spec.specContent
    dataList[this.data.currentIndex].number = detail.quantity
    dataList[this.data.currentIndex].sellPrice = detail.data.sellPrice
    dataList[this.data.currentIndex].prePrice = detail.data.prePrice
    const giftNum = this.getNum()
    const giftAmount = this.getMoney()
    dataList = this.formatPrice(dataList)
    this.setData({ giftAmount, giftNum, dataList, showPurchase: false })
  },

  getSaveData () { // 保存之前对数据进行处理，处理成后端要的格式。
    let isPass = true
    const filter = this.data.dataList.filter(v => v.checked)
    if (!filter.length) isPass = false
    const productList = filter.map(v => {
      if (!v.specId) isPass = false
      return {
        number: v.number,
        specId: v.specId
      }
    })
    return {
      isPass,
      productList
    }
  },
  sure () {
    const { productList, isPass } = this.getSaveData()
    if (!isPass) {
      wx.showToast({ title: `请选择规格`, icon: 'none', duration: 3000 })
      return
    }
    const options = this.data.options
    const couponCustomerId = options.id
    ApiProduct.exchangeProduct({
      data: {
        couponCustomerId,
        productList
      },
      success: () => {
        if (options.entry === 'exchange-coupon') { // 兑换券-去兑换(兑换券 -> 去兑换 -> 兑换)
          wx.navigateTo({ url: `/pages/order-confirm/order-confirm?couponCustomerId=${couponCustomerId}` })
        } else {
          wx.navigateBack({ delta: 1 })
        }
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },
  ...mixinsPagination
})
