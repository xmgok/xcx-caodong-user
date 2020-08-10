import business from '../../utils/business'

Component({
  properties: {
    name: {
      type: String,
      value: ''
    }
  },
  data: {},
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      wx.getSystemInfo({
        success: ({ model, statusBarHeight }) => {
          let totalTopHeight = 70
          if (~model.indexOf('iPhone X')) totalTopHeight = 88
          else if (~model.indexOf('iPhone')) totalTopHeight = 64
          this.setData({
            customNavPrevPage: wx.getStorageSync('customNavPrevPage'),
            iPhone: model.indexOf('iPhone') !== -1,
            statusBarHeight, // 小程序状态栏高度(胶囊区域)
            titleBarHeight: totalTopHeight - statusBarHeight // 手机顶部状态栏高度(信号格区域)
          })
        },
        fail: () => {
          this.setData({
            statusBarHeight: 0, // 小程序状态栏高度(胶囊区域)
            titleBarHeight: 0 // 手机顶部状态栏高度(信号格区域)
          })
        }
      })
    }
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show () {
    }
  },
  methods: {
    returnHome () {
      wx.switchTab({ url: '/pages/index/index' })
    },
    /*
    回退不好做，涉及的面很广
    问题1：reLaunch和redirectTo会清理路由栈，就算redirectTo到了上个页面，页无法回到上上页面了。
    问题2：如果使用自定义导航，则，自定义导航之前切换，是重新渲染，宋帆不愿意如此交互。
    */
    returnPage () {
      const urlLink = wx.getStorageSync('customNavPrevPage')
      wx[business.isTabBarUrl(urlLink) ? 'reLaunch' : 'redirectTo']({ url: urlLink })
      wx.removeStorageSync('customNavPrevPage')
    },
    goLink: business.goLink
  }
})
