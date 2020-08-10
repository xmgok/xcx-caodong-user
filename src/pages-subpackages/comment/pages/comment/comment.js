const ApiComment = require('../../../../api/comment')
const ApiProduct = require('../../../../api/product')
// import business from '../../../../utils/business'

function getDefaultData (options) {
  const obj = { // 默认值
    upload: {
      maxLength: 9,
      list: []
    },
    form: {
      'content': '',
      'imgCount': '',
      'imgUrl': '',
      'orderCode': '',
      'productId': 0,
      'specId': '',
      'star': 0,
      'isHidden': 0
    },
    checked: false,
    iPhoneX: wx.getStorageSync('iPhoneX'),
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
    obj.form.orderCode = options.orderCode
    obj.form.specId = options.specId
    obj.form.productId = options.productId
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  getList () {
    ApiProduct.getInfo({
      data: { id: this.data.options.productId },
      success: (res) => {
        this.setData({ resData: res.data })
      }
    })
  },

  starClick (e) {
    const dataset = e.currentTarget.dataset
    const form = this.data.form
    form.star = dataset.index + 1
    this.setData({ form })
  },

  doCheck () {
    this.setData({ checked: !this.data.checked })
    const form = this.data.form
    form.isHidden = this.data.checked ? 1 : 0
    this.setData({ form })
  },

  change (event) {
    this.setData({ upload: event.detail })
    const form = this.data.form
    const upload = this.data.upload
    form.imgCount = upload.list.length
    form.imgUrl = upload.list.map(v => v.imgUrl).join(',')
    this.setData({ form })
  },

  onInput ({ currentTarget, detail }) {
    const name = currentTarget.dataset.name
    const value = detail.value
    let form = this.data.form
    form[name] = value
    console.log(form[name])
    this.setData({ form })
  },

  submit () {
    if (this.data.form.star <= 0) {
      wx.showToast({
        icon: 'none',
        title: '请打星'
      })
      return
    }
    ApiComment.add({
      data: {
        ...this.data.form
      },
      success: (res) => {
        wx.redirectTo({ url: `/pages-subpackages/comment/pages/comment-detail-my/comment-detail-my?id=${res.data.id}` })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
