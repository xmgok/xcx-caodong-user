// const ApiUser = require('../../api/user')

Page({
  data: {
    status: 0,
    statusJson: {
      '0': { title: '注册成功', text1: '恭喜您，注册成功', text2: ['快去PC端登录草动管理后台，', '上传企业资料，完成审核即可使用了哦'] },
      '1': { title: '审核中', text1: '已完善企业信息', text2: ['您已上传企业资料，', '系统正在审核中'] },
      '2': { title: '审核通过', text1: '通过审核，开通成功', text2: ['恭喜已通过企业资料审核，', '欢迎使用草动'] },
      '3': { title: '审核未通过', text1: '审核未通过', text2: ['非常遗憾，您尚未通过企业资料审核，', '您可修改资料或重新提交申请'] }
    },
    domain: 'www.icaodong.com'
  },
  onLoad ({ domain }) {
    this.setData({ domain })
    // wx.showLoading({ title: '加载中' })
    // // -1可注册 0注册成功 1资料已完善 2审核通过 3审核未通过
    // ApiUser.companyInfoStatus({
    //   success: ({ data }) => {
    //     const status = data.status
    //     // const url = data.url
    //     wx.hideLoading()
    //     if (status > -1) {
    //       wx.setNavigationBarTitle({ title: this.data.statusJson[status].title })
    //     }
    //     this.setData({ status })
    //   }
    // })
  },

  copy () {
    wx.setClipboardData({
      data: this.data.domain,
      fail () {
        wx.showToast({ title: '复制失败', icon: 'none', duration: 2000 })
      }
    })
  }
})
