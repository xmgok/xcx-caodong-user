import variables from '../../utils/variables'

Component({
  properties: {},
  data: {
    primaryColor: variables['$primary-staff'],
    storeName: ''
  },
  attached () {
    this.setData({
      changeStore: wx.getStorageSync('changeStore'),
      storeName: wx.getStorageSync('storeName')
    })
  },
  methods: {
    goDetail () {
      wx.navigateTo({ url: '/pages-subpackages/common/pages/store-detail/index' })
    }
  }
})
