const ApiUser = require('../../api/user')

Page({
  data: {
    type: '',
    value: '',
    canSave: false
  },
  onLoad ({ type = '', value = '' }) {
    const titleText = { nickName: '昵称', mobile: '手机号' }
    this.setData({ type, value })
    wx.setNavigationBarTitle({ title: `编辑${titleText[type]}` })
  },
  bindInput ({ detail }) {
    const value = detail.value
    let canSave = false
    if (value === '') {
      canSave = false
    } else if (this.data.type === 'mobile' && !/^[1][0-9]{10}$/.test(value)) {
      canSave = false
    } else {
      canSave = true
    }
    this.setData({ value, canSave })
  },
  onSave () {
    if (!this.data.canSave) return
    const options = {}
    options[this.data.type] = this.data.value
    ApiUser.edit({
      data: options,
      success: ({ code, message }) => {
        wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'SUCCESS' : 'none'), duration: 1000 })
        if (code === 'SUCCESS') {
          setTimeout(() => wx.navigateBack({ delta: 1 }), 1000)
        }
      }
    })
  }
})
