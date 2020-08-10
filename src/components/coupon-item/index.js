import ApiCoupon from '../../api/coupon'
import business from '../../utils/business'

const app = getApp()

Component({
  options: {},

  properties: {
    // 1-普通商品 2-活动 3-视频 4-合照
    getType: {
      type: Number,
      value: 1
    },
    activityId: {
      type: Number,
      value: 0
    },
    hasBtn: {
      type: Boolean,
      value: true
    },
    btnType: {
      type: String,
      value: 'get' // get领取券 send发放券 use使用券 select选择券 coupon-bag组合券包(组合券包)
    },
    item: {
      type: Object,
      value: {
        // type: 1,
        // activeGoods: 1,
        // beginTime: '2019.10.28',
        // couponCustomerId: null,
        // couponId: 91,
        // endTime: '2019.11.12',
        // explain: '',
        // isGet: 2,
        // laterDay: 0,
        // name: '折后100元现金抵用券',
        // price: '100.00',
        // usePrice: '1000.00',
        // useTime: 1,
        // disabledExplain: '',
        // isChoose: true
      },
      observer (item) {
        if (!item) return
        this.data.item = item
        this.init()
      }
    }
  },

  data: {
    showShareCoupons: false
  },

  attached () {
    // this.init()
  },

  methods: {
    init () {
      const item = this.data.item
      item.couponId = item.couponId || item.id
      if (item.type === 3) {
        // 折扣抹零 - 以下抹零太魔性 - 转成数字再转为字符串再抹零就超方便啦。可参考activity-confirm.js的第80到83行。
        item.discount = item.discount || 'null.null'
        const arr = item.discount.split('.')
        if (+arr[1] === 0) {
          item.discount = arr[0]
        } else if (+arr[1][arr[1].length - 1] === 0) {
          arr[1] = arr[1].substring(0, arr[1].length - 1)
          item.discount = arr.join('.')
        }
        // 折扣替换
        item.price = item.discount
      }
      if (item.price) {
        item._price_big = item.price.split('.')[0]
        item._price_small = item.price.split('.')[1]
      }
      this.setData({ item })
    },
    // 领取优惠券
    goToGet () {
      const item = this.data.item
      const id = item.couponId
      if (item.integralStatus) {
        wx.navigateTo({ url: `/pages/coupon-detail/coupon-detail?id=${id}` })
        return
      }
      if (item.wxCardId) {
        ApiCoupon.cardSign({
          data: { cardId: item.wxCardId, source: this.data.getType, activityId: this.data.activityId },
          success: (res) => {
            res.data.code = ''
            res.data.openid = ''
            console.log('cardList', [{
              cardId: item.wxCardId,
              cardExt: JSON.stringify(res.data)
            }])
            wx.addCard({
              cardList: [{
                cardId: item.wxCardId,
                cardExt: JSON.stringify(res.data)
              }],
              success (res) {
                ApiCoupon.couponGet({
                  data: { id, wxCode: res.cardList[0].code },
                  success: res => {
                    wx.showToast({ title: res.message, icon: 'none' })
                  }
                })
              }
            })
          }
        })
      } else {
        ApiCoupon.couponGet({
          data: { id, source: this.data.getType, activityId: this.data.activityId },
          success: res => {
            wx.showToast({ title: res.message, icon: 'none' })
          }
        })
      }
    },
    // 去发券
    goToSend () {
      const item = this.data.item
      if (!item.isShare) {
        wx.showToast({ title: `已超过可发券数量`, icon: 'none', duration: 3000 })
        return
      }
      let scene = business.sceneStringify({
        pageId: 7,
        storeId: wx.getStorageSync('storeId'),
        empid: wx.getStorageSync('empidCommission'),
        id: item.couponId
      })
      this.setData({
        showShareCoupons: true,
        shareText: item.shareDesc || item.name,
        imgList: [item.shareImg || `https://qiniu.icaodong.com/xcx/common/coupon-share-poster3.png?v=1.0.0`],
        shareUrl: business.scene2Qr(scene, app)
      })
      this.triggerEvent('share', { item })
    },
    // 去使用
    goToUse () {
      const item = this.data.item
      if (item.useType === 2 || item.useType === 3) { // 已使用或者已过期的券，不允许跳去使用
        return
      }
      wx.navigateTo({ url: `/pages/coupon-goods/coupon-goods?id=${item.couponId}&type=${item.activeGoods}` })
    },
    // 去兑换
    goExchange () {
      const { item } = this.data
      wx.navigateTo({ url: `/pages-subpackages/promotion/pages/coupon-exchange-goods/index?id=${item.couponCustomerId}&couponId=${item.couponId}&type=${item.activeGoods}&entry=exchange-coupon` })
    },
    // 去优惠券详情页
    goToDetail () {
      const { btnType, item } = this.data
      if (btnType === 'use') {
        wx.navigateTo({
          url: `/pages-subpackages/promotion/pages/coupon-detail-my/index?id=${item.couponCustomerId}`
        })
      }
      if (btnType === 'send') {
        wx.navigateTo({
          url: `/pages/coupon-detail/coupon-detail?id=${item.couponId}`
        })
      }
      this.triggerEvent('detail', { item })
    },
    closeShareCoupons () {
      this.setData({ showShareCoupons: false })
    },
    saved () {
      const item = this.data.item
      this.triggerEvent('saved', { item })
    }
  }
})
