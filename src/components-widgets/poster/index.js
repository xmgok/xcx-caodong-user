import { goLink } from '../../utils/business'

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  attached () {
  },
  methods: {
    goLink,

    bindTap () {
      const appNavigate = [{
        imgUrl: '173_1583889192294_407382728.jpg', // zz
        appId: 'wxc0546077129ffb2e'
      },
      {
        imgUrl: '173_1583889204806_49818433.jpg', // minifun
        appId: 'wx493e495ca5b90968'
      }]
      appNavigate.forEach(item => {
        if (this.data.result.imgUrl.indexOf(item.imgUrl) > -1) {
          wx.navigateToMiniProgram({
            appId: item.appId,
            path: 'pages/index/index',
            success: (res) => console.log(res)
          })
        }
      })
    }
  }
})
