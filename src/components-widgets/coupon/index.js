import ApiCoupon from '../../api/coupon'

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  data: {
    recommendList: []
  },
  attached () {
    this.getList()
  },
  methods: {
    getList () {
      const result = this.data.result.filter(v => v.id)
      if (!result.length) return
      ApiCoupon.couponInfo({
        params: {
          ids: result.map(v => v.id).join(',')
        },
        success: ({ data }) => {
          data.forEach(v => {
            v.price = v.price.split('.')[0]
          })
          this.setData({ recommendList: data })
        }
      })
    },
    goToUse ({ currentTarget: { dataset: { id, item } } }) {
      if (item.integralStatus) {
        wx.navigateTo({ url: `/pages/coupon-detail/coupon-detail?id=${item.couponId}` })
        return
      }
      if (item.wxCardId) {
        ApiCoupon.cardSign({
          data: { cardId: item.wxCardId },
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
          data: { id },
          success: res => {
            wx.showToast({ title: res.message, icon: 'none' })
          }
        })
      }
    }
  }
})
