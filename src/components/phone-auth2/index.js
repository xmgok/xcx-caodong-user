import business from '../../utils/business'
const ApiUser = require('../../api/user')
const app = getApp()

Component({
  properties: {
    isShow: {
      type: Boolean,
      value: false
    },
    isPlaceholder: {
      type: Boolean,
      value: false
    },
    location: {
      type: String,
      value: 'top'
    }
  },
  attached () {
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show () {
      // 组件中监听的`show`会先触发，页面上的`onShow`会后触发。
      this.setData({ isShow: !wx.getStorageSync('mobile') })
    }
  },
  methods: {
    bindgetphonenumber (e) {
      business.bindGetPhoneNumber(e, app, this)
    },
    sendPhoneNumber (datas = {}) {
      business.sendPhoneNumber(datas, ApiUser, this, (obj) => {
        this.setData({ isShow: false })
        this.triggerEvent('success', obj)
      })
    },
    cancel () {
      this.setData({ isShow: false })
      // wx.showModal({
      //   content: '取消之后无法享受会员价！',
      //   success: (res) => {
      //     if (res.confirm) {
      //       this.setData({ isShow: false })
      //     }
      //   }
      // })
    }
  }
})
