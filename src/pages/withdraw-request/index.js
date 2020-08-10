const ApiSeller = require('../../api/seller')
const mixins = require('../../utils/mixins')

function getDefaultData (options) {
  const obj = { // 默认值
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
      amount: ''
    },
    resData: {},
    options: {}
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

  onShow () {
    // 获取提现手续费。
    // ApiSeller.getCommissionAmount({
    //   success: () => {
    //   }
    // })
    // 获取可提现佣金。
    ApiSeller.getDistributorCommission({
      success: (res) => {
        this.setData({ resData: res.data })
      }
    })
  },

  bindBankChange ({ detail }) {
    let form = this.data.form
    form.bankId = detail.value
    form.bankName = this.data.bankList.find(v => +v.id === +form.bankId).name
    this.setData({ form })
  },

  getAllMoney () {
    let form = this.data.form
    form.amount = this.data.resData.avcAmount
    this.setData({ form })
  },

  submit () {
    const form = this.data.form
    if (this.data.resData.acid) {
      wx.showToast({ title: `请先绑卡`, icon: 'none', duration: 3000 })
      return
    }
    if (!form.amount) {
      wx.showToast({ title: `请输入金额`, icon: 'none', duration: 3000 })
      return
    }
    ApiSeller.saveCashApply({
      data: form,
      success: (res) => {
        wx.showToast({ title: res.message, icon: 'none', duration: 3000 })
      }
    })
    console.log(form)
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixins
})
