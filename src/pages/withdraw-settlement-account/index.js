// const ApiSeller = require('../../api/seller')
const mixins = require('../../utils/mixins')

function getDefaultData (options) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    resData: {},
    options: {},
    bankList: [
      {
        id: 0,
        name: '美国'
      },
      {
        id: 1,
        name: '中国'
      },
      {
        id: 2,
        name: '巴西'
      },
      {
        id: 3,
        name: '日本'
      }
    ],
    form: {
      kaihuiming: '',
      zhihangmingcheng: '',
      kahao: '',
      region: [],
      bankId: '',
      bankName: ''
    }
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
  },

  bindBankChange ({ detail }) {
    let form = this.data.form
    form.bankId = detail.value
    form.bankName = this.data.bankList.find(v => +v.id === +form.bankId).name
    this.setData({ form })
  },

  bindRegionChange ({ detail }) {
    let form = this.data.form
    form.region = detail.value
    this.setData({ form })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  submit () {
    const form = this.data.form
    if (!form.kaihuming) {
      wx.showToast({ title: `请输入开户名`, icon: 'none', duration: 3000 })
      return
    }
    if (!form.bankName) {
      wx.showToast({ title: `请选择开户银行`, icon: 'none', duration: 3000 })
      return
    }
    if (!form.region.length) {
      wx.showToast({ title: `请选择省市区`, icon: 'none', duration: 3000 })
      return
    }
    if (!form.kahao.replace(' ', '').length !== 19) {
      wx.showToast({ title: `卡号格式有误`, icon: 'none', duration: 3000 })
      return
    }
    form.kahao = form.kahao.replace(' ', '')
    console.log(form)
  },

  ...mixins
})
