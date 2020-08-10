import ApiCoupon from '../../api/coupon'
import ApiUser from '../../api/user'
import business from '../../utils/business'

const ApiTask = require('../../api/task')

function getDefaultData (options, self) {
  const obj = { // 默认值
    resData: {},
    options: {},
    show: false,
    brandName: wx.getStorageSync('brandName'),
    iPhoneX: wx.getStorageSync('iPhoneX')
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
    this.getDetail()
  },
  getDetail () {
    const options = this.data.options
    const scene = business.sceneParse(this.data.options.scene)
    const ids = scene.id || options.id
    ApiCoupon.couponInfo({
      params: {
        ids: ids
      },
      success: ({ data }) => {
        data.forEach(v => {
          v._price_big = v.price.split('.')[0]
        })
        this.setData({ resData: data[0] })
        business.tjPreview({
          ApiUser,
          options,
          id: ids,
          kind: 1,
          success: (res) => {
            this.data.noticeId = res.data
            console.log('res', res)
            console.log('this.data.noticeId', this.data.noticeId)
          }
        })
      }
    })
    if (options.taskRuleId) {
      ApiTask.taskforwardSave({
        data: {
          empId: wx.getStorageSync('empidCommission'),
          itemId: ids,
          ruleId: options.taskRuleId,
          type: 2 // 类型 1转发 2进入
        }
      })
    }
  },
  getCoupon () {
    const resData = this.data.resData
    if (resData.integralStatus) {
      this.bindShow()
      return
    }
    this.goToUse()
  },
  goToUse () {
    this.setData({ show: false })
    const resData = this.data.resData
    const id = resData.couponId || resData.id
    if (resData.isGet !== 0) return
    if (resData.wxCardId) {
      ApiCoupon.cardSign({
        data: { cardId: resData.wxCardId },
        success: (res) => {
          res.data.code = ''
          res.data.openid = ''
          console.log('cardList', [{
            cardId: resData.wxCardId,
            cardExt: JSON.stringify(res.data)
          }])
          wx.addCard({
            cardList: [{
              cardId: resData.wxCardId,
              cardExt: JSON.stringify(res.data)
            }],
            success: (res) => {
              ApiCoupon.couponGet({
                data: { id, wxCode: res.cardList[0].code },
                success: res2 => {
                  wx.showToast({ title: res2.message, icon: 'none' })
                  if (this.data.noticeId) {
                    ApiCoupon.getInform({ data: { id: this.data.noticeId } })
                  }
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
          if (this.data.noticeId) {
            ApiCoupon.getInform({ data: { id: this.data.noticeId } })
          }
        }
      })
    }
  },
  onShareAppMessage () {
    const resData = this.data.resData
    const options = this.data.options
    const empidCommission = wx.getStorageSync('empidCommission')
    const shareParams = {
      path: `/pages/coupon-detail/coupon-detail?id=${options.id}${empidCommission ? `&empid=${empidCommission}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      imageUrl: resData.shareImg || `https://qiniu.icaodong.com/xcx/common/coupon-share-poster3.png?v=1.0.0`,
      title: resData.shareDesc || resData.name
    }
    console.log('分享路径', shareParams)
    return shareParams
  },
  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  bindShow () {
    this.setData({ show: true })
  },
  bindHide () {
    this.setData({ show: false })
  },
  onChange (e) {
    console.log(e)
  }
})
