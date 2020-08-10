import ApiCart from '../../api/cart'
import ApiCoupon from '../../api/coupon'
import mixins from '../../utils/mixins'
import business from '../../utils/business'
const mixinsPagination = require('../../utils/mixins-pagination')

Page({
  data: {
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 10
    },
    list: [],
    cartNum: 0,
    showPurchase: false,
    productId: 0,
    pageNum: 1,
    pageSize: 999,
    resData: {},
    keyword: ''
  },

  onLoad (options) {
    this.setData({ options })
    this.getList()
    this.getCount()
    this.getDetail()
  },

  ...mixins,

  getCount () {
    ApiCart.count({
      success: res => {
        this.setData({ cartNum: res.data })
      }
    })
  },
  getDetail () {
    const options = this.data.options
    const scene = business.sceneParse(this.data.options.scene)
    ApiCoupon.couponInfo({
      params: {
        ids: scene.id || options.id
      },
      success: ({ data }) => {
        data.forEach(v => {
          v._price_big = v.price.split('.')[0]
        })
        this.setData({ resData: data[0] })
      }
    })
  },
  getList () {
    ApiCoupon.couponGoods({
      params: {
        couponId: this.data.options.id,
        activeGoods: this.data.options.type,
        pageNum: this.data.result.pageNum,
        pageSize: this.data.result.pageSize,
        keyword: this.data.keyword
      },
      success: res => {
        let list = res.data.dataList.map(item => {
          item._priceInt = item.price.split('.')[0]
          item._priceDec = item.price.split('.')[1]
          return item
        })
        this.setData({ list: this.data.list.concat(list) })
        this.setPagination(res.data)
      }
    })
  },
  addToCart ({ currentTarget: { dataset: { id } } }) {
    this.setData({ productId: '' })
    this.setData({
      productId: id,
      showPurchase: true
    })
  },
  goodsPurchaseSelected ({ detail }) {
    ApiCart.add({
      data: {
        number: detail.quantity,
        specId: detail.spec.id
      },
      success: (res) => {
        this.getCount()
        this.setData({ showPurchase: false, ass: '' })

        wx.showToast({ title: res.message, icon: 'none' })
      }
    })
  },
  ...mixinsPagination,
  bindKeyInputConfirm ({ detail }) {
    this.setData({ keyword: detail.value, list: [], pageNum: 1 })
    this.getList()
  }
})
