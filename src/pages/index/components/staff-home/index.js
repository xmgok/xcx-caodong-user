import variables from '../../../../utils/variables'

const WxCharts = require('../../../../utils/wxcharts')
const ApiCustomerorders = require('../../../../api/customerorders')
const ApiUser = require('../../../../api/user')
const ApiSeller = require('../../../../api/seller')
const ApiOrder = require('../../../../api/order')
const ApiHome = require('../../../../api/home')

Component({
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show () {
      this.staffMarkInfoGet() // 图标上是否展示红点点
    }
  },
  properties: {
    refreshNum: {
      type: Number,
      value: 0,
      observer (newValue) {
        console.log('refreshNum newValue', newValue)
        this.init()
      }
    }
  },
  data: {
    markInfo: {},
    primaryColor: variables['$primary-staff']
  },
  attached () {
    this.init()
  },
  methods: {
    init () {
      this.staffMarkInfoGet() // 图标上是否展示红点点
      this.staffInfoGet()
      this.staffDistInfoGet()
      this.staffTotalTakeOrderToday()
      this.staffPotentialCustomersGet()
      this.staffAchievementGet()
      this.staffRenderChart()
    },
    staffRenderChart () {
      /* eslint-disable */
      ApiCustomerorders.history({
        params: { days: 7 },
        success: ({ data }) => {
          let cateGory = data.map(item => {
            return item.assetDate
          })
          let cateData = data.map(item => {
            return Number(item.achievement)
          })
          new WxCharts({
            self: this,
            canvasId: 'ringCanvas',
            type: 'column',
            categories: cateGory,
            series: [{
              name: '业绩',
              data: cateData,
              color: variables['$primary-staff'],
              format: function (val) {
                return '￥' + val.toFixed(2)
              }
            }],
            // 经测试，只有下面这4个颜色和上面那1个可以修改。
            xAxis: {
              gridColor: '#979797',
              fontColor: '#96989C'
            },
            yAxis: {
              gridColor: '#979797',
              fontColor: '#96989C',
              format: function (val) {
                return val.toFixed(2)
              },
              min: 0
            },
            width: 350,
            height: 200
          })
        }
      })
    },
    staffInfoGet () { // 获取员工信息
      ApiUser.getuser({
        success: ({ data }) => {
          this.setData({ staffInfo: data })
        }
      })
    },
    staffAchievementGet () {
      ApiUser.achievement({
        success: ({ data }) => {
          this.setData({ staffAchievement: data || {} })
        }
      })
    },
    staffTotalTakeOrderToday () {
      ApiOrder.totalTakeOrderToday({
        success: ({ data }) => {
          this.setData({ staffOrder: data || {} })
        }
      })
    },
    staffDistInfoGet () {
      ApiSeller.getdistInfo({
        success: (res) => {
          this.setData({ staffSellerData: res.data })
          if (res.data.visible && res.data.dtype === 2) {
            ApiSeller.getInvitationCount({
              success: (res) => {
                this.setData({ staffSelleLog: res.data })
              }
            })
          }
        }
      })
    },
    staffGetHomeCustomQr (res) {
      const { path, width, height } = res.detail
      this.setData({ staffHomeCustomQr: path, staffHomeCustomQrWidth: width, staffHomeCustomQrHeight: height })
    },
    staffShowHomeQr () {
      this.setData({ isShowHomeQr: true, isHideModule5: true })
    },
    staffHideHomeQr () {
      this.setData({ isShowHomeQr: false, isHideModule5: false })
    },
    staffDownLoadHomeQr () {
      wx.showLoading({ title: '图片下载中...' })
      wx.getSetting({
        success: ({ authSetting }) => {
          if (authSetting['scope.writePhotosAlbum'] === false) {
            wx.openSetting({
              success: () => this.saveImg()
            })
          } else {
            this.saveImg()
          }
        }
      })
    },
    saveImg () {
      wx.getImageInfo({
        src: this.data.staffHomeCustomQr,
        fail: (res) => {
          console.log('getImageInfo fail', res)
        },
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success: () => {
              wx.showToast({ title: `图片下载成功`, icon: 'none', duration: 3000 })
              this.staffHideHomeQr()
            },
            fail: (res) => {
              console.log('saveImageToPhotosAlbum fail', res)
            },
            complete () {
              wx.hideLoading()
            }
          })
        }
      })
    },
    staffPotentialCustomersGet () {
      ApiUser.potentialCustomers({
        success: ({ data }) => {
          this.setData({ staffPotentialCustomers: data || {} })
        }
      })
    },
    staffMoreEntryHint (e) {
      const dataset = e.currentTarget.dataset
      if (dataset.type === 'employee') {
        wx.showToast({ title: '商家尚未开启分销功能', icon: 'none', duration: 3000 })
      } else {
        wx.showToast({ title: '敬请期待', icon: 'none', duration: 3000 })
      }
    },
    // 图标上是否展示红点点
    staffMarkInfoGet () {
      ApiHome.markInfo({
        success: ({ data }) =>
          this.setData({ markInfo: data })

      })
    }
  }
})
