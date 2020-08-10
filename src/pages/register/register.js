const ApiUser = require('../../api/user')
const app = getApp()

Page({
  data: {
    form: {
      type: 1, // 1草动商城 2五五拓客
      password: '',
      mobile: '',
      code: '',
      imageCode: '',
      uuid: ''
    },
    codeImg: '',
    canSave: false,
    timer: 60,
    timeText: '获取验证码',
    eye: false
  },

  onLoad () {
    const uuid = this.getGuid()
    const form = this.data.form
    form.uuid = uuid
    this.setData({ form })
    this.changeCodeImg()
  },

  getMsgCode () {
    const mobile = this.data.form.mobile
    if (!/^[1][0-9]{10}$/.test(mobile)) {
      wx.showToast({ title: '请输入合法的手机号', icon: 'none' })
      return
    }

    clearInterval(this.timerFn)
    ApiUser.getSmscode({
      data: { mobile },
      success: ({ code, message }) => {
        wx.showToast({ title: message, icon: 'none' })
        if (code !== 'SUCCESS') return
        this.timerFn = setInterval(() => {
          if (this.data.timer <= 0) {
            clearInterval(this.timerFn)
            this.setData({ timer: 60, timeText: '获取验证码' })
          } else {
            this.data.timer--
            this.setData({ timer: this.data.timer, timeText: `${this.data.timer}秒后重发` })
          }
        }, 1000)
      }
    })
  },
  timerFn () {
  },
  bindInput ({ currentTarget, detail }) {
    const type = currentTarget.dataset.type
    const value = detail.value
    let form = this.data.form
    form[type] = value
    this.setData({ form })
    this.verification()
  },
  changeCodeImg () {
    const codeImg = `${app.config.domainPath}/user/imagecode?uuid=${this.data.form.uuid}&date=${new Date().getTime()}`
    this.setData({ codeImg })
    this.verification()
  },
  verification () {
    const form = this.data.form
    let error = 0
    let arr = ['mobile', 'code', 'password', 'imageCode']
    arr.forEach((item) => {
      if (form[item] === '') {
        error++
      } else if (item === 'mobile' && !/^[1][0-9]{10}$/.test(form[item])) {
        error++
      } else if (item === 'password' && form[item].length < 6) {
        error++
      }
    })
    this.setData({ canSave: error === 0 })
  },
  onSave () {
    if (!this.data.canSave) return

    const reffer = wx.getStorageSync('reffer')
    console.log(reffer)
    const data = { ...this.data.form }
    // 商家注册添加来源
    if (reffer) data.reffer = reffer

    ApiUser.sysuserRegister({
      data,
      success: ({ code, message, data }) => {
        wx.showToast({ title: message, icon: (code === 'SUCCESS' ? 'success' : 'none') })
        if (code === 'SUCCESS') {
          setTimeout(() => wx.redirectTo({ url: `/pages/enterprise-status/enterprise-status?domain=${data.weburl}` }), 2000)
        }
      }
    })
  },
  bindblur ({ currentTarget, detail }) {
    const type = currentTarget.dataset.type
    const value = detail.value
    const errorText = {
      password: '请输入密码',
      mobile: '请输入手机号',
      code: '请输入短信验证码'
    }
    if (!value) {
      wx.showToast({ title: errorText[type], icon: 'none', duration: 3000 })
    } else if (type === 'mobile' && !/^[1][0-9]{10}$/.test(value)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none', duration: 3000 })
    } else if (type === 'password' && value.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none', duration: 3000 })
    }
  },
  getGuid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  },
  changeEye () {
    this.setData({ eye: !this.data.eye })
  }
})
