const ApiAddress = require('../../api/address')

Page({
  data: {
    type: '',
    canSave: false,
    form: {
      id: '',
      name: '',
      phone: '',
      region: [],
      address: '',
      postcode: '',
      isDefault: false
    }
  },
  onLoad ({ id = '', type = '' }) {
    if (id) this.getInfo(id)
    this.setData({ type })
    if (type === 'customer') {
      wx.setNavigationBarTitle({ title: id ? '编辑客户' : '新增客户' })
    }
  },
  getInfo (id) {
    wx.showLoading({ title: '加载中' })
    ApiAddress.info({
      params: { id },
      success: ({ data }) => {
        wx.hideLoading()
        let form = Object.assign(this.data.form, data)
        form.region = [data.province, data.city, data.area]
        this.setData({ form, canSave: true })
      }
    })
  },
  onSetDefault () {
    let form = this.data.form
    form.isDefault = !form.isDefault
    this.setData({ form })
  },
  bindRegionChange ({ detail }) {
    let form = this.data.form
    form.region = detail.value
    this.setData({ form })
    this.verification()
  },
  bindInput ({ currentTarget, detail }) {
    const type = currentTarget.dataset.type
    const value = detail.value
    let form = this.data.form
    form[type] = value
    this.setData({ form })
    this.verification()
  },
  bindblur ({ currentTarget, detail }) {
    const type = currentTarget.dataset.type
    const value = detail.value
    const errorText = {
      name: '请输入收货人',
      phone: '请输入手机号',
      address: '请输入收货地址'
    }
    if (!value) {
      wx.showToast({ title: errorText[type], icon: 'none', duration: 3000 })
    } else if (type === 'phone' && !/^[1][0-9]{10}$/.test(value)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none', duration: 3000 })
    }
  },
  verification () {
    const form = this.data.form
    let error = 0;
    ['name', 'phone', 'region', 'address'].forEach((item) => {
      if (form[item] === '') {
        error++
      } else if (item === 'phone' && !/^[1][0-9]{10}$/.test(form[item])) {
        error++
      } else if (form[item].length <= 0) {
        error++
      }
    })
    this.setData({ canSave: (!(error > 0)) })
  },
  onSave () {
    if (!this.data.canSave) return
    let form = this.data.form
    let region = form.region
    form.isDefault = Number(form.isDefault)
    form.province = region[0]
    form.city = region[1]
    form.area = region[2]
    wx.showLoading({ title: '保存中' })
    ApiAddress.add({
      data: form,
      success: ({ message }) => {
        wx.hideLoading()
        wx.showToast({ title: message, icon: 'success', duration: 1000 })

        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        // 编辑订单确认页也选择的地址后更新
        if (prevPage.route === 'pages/order-confirm/order-confirm') {
          const currentAddress = prevPage.data.currentAddress
          if (currentAddress && currentAddress.id === form.id) {
            prevPage.setData({ currentAddress: form })
          }
        }

        setTimeout(() => wx.navigateBack({ delta: 1 }), 1500)
      }
    })
  }
})
