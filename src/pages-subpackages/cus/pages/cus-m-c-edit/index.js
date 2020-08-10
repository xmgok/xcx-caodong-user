import business from '../../../../utils/business'
import ApiCustomer from '../../../../api/cus-m'

function getDefaultData (options) {
  const obj = { // 默认值
    type: '',
    value: '',
    canSave: false,
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    const scene = business.sceneParse(options.scene)
    options = {
      ...options,
      ...scene
    }
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),
  onLoad ({ type = '', value = '' }) {
    const titleText = { nickName: '昵称', mobile: '手机号', remark: '备注' }
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
    // let canSave = !(value === '' || (this.data.type === 'mobile' && !/^[1][0-9]{10}$/.test(value))) // 改成一行可读性太差。
    this.setData({ value, canSave })
  },
  onSave () {
    if (!this.data.canSave) return
    const options = {
      id: this.options.id
    }
    options[this.data.type] = this.data.value
    ApiCustomer.update_customer({
      data: options,
      success: ({ code, message }) => {
        wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'SUCCESS' : 'none'), duration: 1000 })
        if (code === 'SUCCESS') {
          setTimeout(() => wx.navigateBack({ delta: 1 }), 1000)
        }
      }
    })
  },
  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
