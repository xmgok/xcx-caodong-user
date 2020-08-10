const ApiUser = require('../../api/user')

Page({
  data: {
    form: {
      id: '',
      name: '',
      mobile: '',
      remark: ''
    },
    canSave: false,
    requireList: [
      { type: 'name', text: '客户名称' },
      { type: 'mobile', text: '手机号' },
      { type: 'remark', text: '备注' }
    ]
  },
  onLoad ({ id = '' }) {
    if (id) {
      let form = {
        id,
        name: '郝漂亮',
        mobile: '18500003050',
        remark: '喜欢购买美妆产品'
      }
      this.setData({ form, canSave: true })
    }
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
    this.data.requireList.forEach((item) => {
      const type = item.type
      if (form[type] === '') {
        error++
      } else if (type === 'mobile' && !/^[1][0-9]{10}$/.test(form[type])) {
        error++
      }
    })
    this.setData({ canSave: (!(error > 0)) })
  },
  onSave () {
    if (!this.data.canSave) return
    if (this.data.form.id) {
      ApiUser.edit({
        data: this.data.form,
        success: ({ data = [] }) => {
        }
      })
    } else {
      ApiUser.addCustomer({
        data: this.data.form,
        success: ({ data = [] }) => {
        }
      })
    }
    wx.navigateBack({ delta: 1 })
  }
})
