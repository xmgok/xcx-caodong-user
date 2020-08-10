import business from '../../utils/business'
const ApiUser = require('../../api/user')
const app = getApp()

Page({
  data: {
    form: {
      mobile: '',
      imgCode: '',
      smsCode: '',
      uuid: ''
      // imgCode (string, optional): 图形验证码 ,
    },
    codeImg: '',
    canSave: false,
    timer: 60,
    timeText: '获取验证码'
  },

  onReady () {
    const uuid = this.getGuid()
    const form = this.data.form
    form.uuid = uuid
    this.setData({ form })
    this.changeCodeImg()
  },

  changeCodeImg () {
    const codeImg = `${app.config.domainPath}/user/imagecode?uuid=${this.data.form.uuid}&date=${new Date().getTime()}`
    this.setData({ codeImg })
  },
  getMsgCode () {
    const mobile = this.data.form.mobile
    const imgCode = this.data.form.imgCode
    if (!/^[1][0-9]{10}$/.test(mobile)) {
      wx.showToast({ title: '请输入合法的手机号', icon: 'none' })
      return
    }
    if (!imgCode) {
      wx.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }

    clearInterval(this.timerFn)
    ApiUser.getSmscode({
      data: { mobile, imgCode },
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
  verification () {
    const form = this.data.form
    let error = 0
    let arr = ['mobile', 'imgCode', 'smsCode']
    arr.forEach((item) => {
      if (form[item] === '') {
        error++
      } else if (item === 'mobile' && !/^[1][0-9]{10}$/.test(form[item])) {
        error++
      }
    })
    this.setData({ canSave: (!(error > 0)) })
  },
  getGuid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  },
  onSave (e) {
    if (!this.data.canSave) return
    //   birthday (string, optional): 出生日期 ,
    //   headUrl (string, optional): 头像 ,
    //   id (integer, optional): id ,
    //   mobile (string, optional): 手机号 ,
    //   name (string, optional): 姓名 ,
    //   nickName (string, optional): 昵称 ,
    //   remark (string, optional): 备注 ,
    //   wxOpenid (string, optional): 微信openid
    // console.log(e.detail.userInfo)
    ApiUser.emplogin({
      data: this.data.form,
      success: ({ code, message, data }) => {
        wx.showToast({ title: message, icon: (code === 'SUCCESS' ? 'success' : 'none') })
        if (code === 'SUCCESS') {
          business.loginSetStorage(data)
          if (!data.nickName || !data.headUrl) { // 如果没有头像和昵称则更新头像和昵称
            let { avatarUrl, nickName, gender, province, city, country } = e.detail.userInfo
            ApiUser.edit({
              data: {
                headUrl: avatarUrl,
                nickName,
                gender,
                province,
                city,
                country
              }
            })
          }
          wx.reLaunch({ url: '/pages/index/index' })
        }
      }
    })
  },
  bindgetphonenumber (e) {
    business.bindGetPhoneNumber(e, app, this)
  },
  sendPhoneNumber (datas = {}) {
    ApiUser.empAuthLogin({
      data: datas,
      success: ({ code, message, data }) => {
        wx.showToast({ title: message, icon: (code === 'SUCCESS' ? 'success' : 'none') })
        if (code === 'SUCCESS') {
          business.loginSetStorage(data)
          wx.reLaunch({ url: '/pages/index/index' })
        }
      },
      complete: () => {
        this.setData({ isBindGetPhoneNumber: false })
      }
    })
  }
})
