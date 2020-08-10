import ApiActivity from '../../api/activity'
import business from '../../utils/business'

const app = getApp()
const ApiUser = require('../../api/user')
const IDCardValidate = require('../../utils/IDCardValidate')
const ApiCommon = require('../../api/common')

Page({
  data: {
    isFill: 1,
    // isReceiverAddress: 1,
    form: {
      mobile: '',
      name: '',
      receiverAddress: '',
      receiverPhone: '',
      receiverName: '',
      recordId: '',
      idcardNo: '',
      prizeStoreName: '',
      prizeStoreId: '',
      customInfo: ''
    },
    // 扩展字段配置
    fillExtend: {
      address: false, // 收货地址
      IDCard: false, // 身份证号
      awardStore: false, // 领奖门店
      storeIds: [], // 已选门店
      custom: false, // 自定义信息
      customTitle: '' // 自定义信息标题
    },
    storeList: [],
    storeIndex: 0
    // canSave: false
  },

  onLoad ({ recordId = '', isFill = 1 }) {
    const form = this.data.form
    form.recordId = recordId

    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('page-activity-confirm', ({ fillExtend }) => {
      console.log(fillExtend)
      this.setData({ form, isFill, fillExtend })

      // 门店列表
      ApiActivity.getStoreList({
        data: { idList: fillExtend.storeIds },
        success: ({ data = [] }) => this.setData({ storeList: data })
      })
    })
  },

  bindInput ({ currentTarget, detail }) {
    const type = currentTarget.dataset.type
    const value = detail.value
    this.setData({ [`form.${type}`]: value })
    // this.verification()
  },
  verification () {
    const form = this.data.form
    // let error = 0
    let arr = []
    if (this.data.isFill > 0) {
      arr = ['name', 'mobile']
    }
    if (this.data.fillExtend.address) {
      arr.push('receiverAddress')
    }
    if (this.data.fillExtend.IDCard) {
      arr.push('idcardNo')
    }
    if (this.data.fillExtend.awardStore) {
      arr.push('prizeStoreName')
    }
    if (this.data.fillExtend.custom) {
      arr.push('customInfo')
    }
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (form[item] === '') {
        // error++
        const formKeyMap = {
          name: '姓名',
          mobile: '手机号码',
          receiverAddress: '地址',
          idcardNo: '身份证',
          prizeStoreName: '门店',
          customInfo: this.data.fillExtend.customTitle
        }
        if (formKeyMap[item]) {
          wx.showToast({ title: `请填写${formKeyMap[item]}`, icon: 'none' })
          return false
        }
      } else {
        switch (item) {
          case 'idcardNo':
            if (!IDCardValidate.checkIdCardNo(form[item])) {
              // error++
              wx.showToast({ title: '请填写正确的身份证号', icon: 'none' })
              return false
            }
            break
        }
      }
    }

    // this.setData({ canSave: (!(error > 0)) })
    return true
  },
  onSave () {
    // if (!this.data.canSave) return
    if (!this.verification()) return

    const submit = () => {
      ApiActivity.fillData({
        data: this.data.form,
        success: ({ code, message }) => {
          wx.showToast({ title: message, icon: (code === 'SUCCESS' ? 'success' : 'none') })
          if (code === 'SUCCESS') {
            setTimeout(() => wx.navigateBack({ delta: 1 }), 1000)
          }
        }
      })
    }

    // 有门店时订阅消息
    if (this.data.fillExtend.awardStore) {
      ApiCommon.subscribeMsg({
        data: { sceneId: 3 },
        success: (res) => {
          wx.requestSubscribeMessage({ // 订阅消息
            tmplIds: res.data,
            success: (res) => console.log('success res', res),
            fail: (res) => console.log('fail res', res),
            complete: () => {
              submit()
            }
          })
        }
      })
    } else {
      submit()
    }
  },
  bindgetphonenumber (e) {
    business.bindGetPhoneNumber(e, app, this)
  },
  sendPhoneNumber (datas = {}) {
    business.sendPhoneNumber(datas, ApiUser, this, ({ data, message }) => {
      let form = this.data.form
      form.mobile = data
      this.setData({ form })
      // this.verification()
    })
  },
  getAddress () {
    wx.chooseAddress({
      success: (res) => {
        let form = this.data.form
        form.receiverAddress = `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`
        form.receiverPhone = res.telNumber
        form.receiverName = res.userName
        this.setData({ form })
        // this.verification()
      }
    })
  },
  bindPickerChange ({ detail: { value } }) {
    const { id, name } = this.data.storeList[value]
    this.setData({
      storeIndex: value,
      'form.prizeStoreId': id,
      'form.prizeStoreName': name
    })
  }
})
