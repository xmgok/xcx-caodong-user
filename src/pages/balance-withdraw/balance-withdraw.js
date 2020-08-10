import ApiPercentPay from '../../api/percent-pay'

Page({
  data: {
    amount: '', // 提现金额
    minAmount: '1.00', // 最低可提现金额
    maxAmount: '', // 最多可提现金额
    frozenAmount: '',
    moneyValid: {
      success: false,
      text: ''
    },
    submitting: false
  },

  onLoad () {
    this.init()
  },

  init () {
    ApiPercentPay.withdrawAmount({
      success: ({ data: { minAmount, withdrawAmount, frozenAmount } }) => {
        this.setData({
          minAmount,
          frozenAmount,
          maxAmount: withdrawAmount
        })
      }
    })
  },
  onInput ({ currentTarget: { dataset }, detail: { value } }) {
    if (value === '') {
      this.setData({ 'moneyValid.success': false })
      return
    }

    const { name } = dataset
    if (Number.isNaN(+value)) {
      wx.showToast({ title: '请填写数字', icon: 'none', duration: 2000 })
      return
    }
    this.setData({ [name]: value })

    const { minAmount, maxAmount } = this.data
    if (name === 'amount') {
      if (value && !Number.isNaN(+value)) {
        if (+value < +minAmount) {
          this.setData({
            moneyValid: {
              success: false,
              text: `输入金额小于${minAmount}元，不可提现`
            }
          })
          return
        }
        if (+value > +maxAmount) {
          this.setData({
            moneyValid: {
              success: false,
              text: '输入金额超出可提现余额'
            }
          })
          return
        }
      }

      this.setData({
        moneyValid: {
          success: true,
          text: ''
        }
      })
    }
  },
  onWithdrawal () {
    const { amount, submitting } = this.data
    if (submitting) return

    if (amount === '') {
      wx.showToast({ title: '请输入提现金额', icon: 'none', duration: 2000 })
      return
    }
    if (!this.data.moneyValid.success) return

    this.setData({ submitting: true })
    ApiPercentPay.withdraw({
      data: {
        amount
      },
      success: ({ status, message }) => {
        if (status !== 200) return
        wx.showToast({ title: message || '操作成功', icon: 'none', duration: 2000 })
        this.setData({ submitting: false, amount: '' })
        this.init()
      }
    })
  },
  setAllMoney () {
    this.setData({
      amount: this.data.maxAmount,
      'moneyValid.success': true
    })
  }
})
