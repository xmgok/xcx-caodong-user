import mixins from '../../../../utils/mixins'
import ApiCustomer from '../../../../api/cus-m'

function getDefaultData (options) {
  const obj = { // 默认值
    showTab: true,
    isShowSelectLabel: false,
    labelData: {},
    detailData: {}, // 客户详情
    myLabelList: {}, // 可选标签列表
    currentLabel2: '',
    currentLabelObj: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
    if (options.tabIndex) {
      obj.tabIndex = options.tabIndex
    }
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))

    this.getList()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixins,

  getList () {
    ApiCustomer.app_customer_label_list({
      data: {
        customerId: this.data.options.id
      },
      success: ({ data = {} }) => {
        this.setData({ labelData: data })
      }
    })
  },
  bindlongpress (e) {
    const dataset = e.currentTarget.dataset
    const index = dataset.index
    const labelData = this.data.labelData
    labelData.my[index].active = true
    this.setData({ labelData })
  },
  deleteLabel (e) {
    const dataset = e.currentTarget.dataset
    wx.showModal({
      content: '确认要删除该标签吗？',
      success: (res) => {
        if (res.confirm) {
          ApiCustomer.delete_relation({
            data: {
              customerId: this.data.options.id,
              id: dataset.item.id
            },
            success: () => {
              this.getList()
            }
          })
        }
      }
    })
  },
  showSelectLabel () {
    this.setData({ isShowSelectLabel: true })
    ApiCustomer.myLabelList({
      params: {},
      success: ({ data = {} }) => {
        console.log(data)
        this.setData({ myLabelList: data })
      }
    })
  },
  hideSelectLabel () {
    this.setData({
      isShowSelectLabel: false,
      currentLabel2: ''
    })
  },
  tagSelect ({ currentTarget: { dataset } }) {
    const currentLabelObj = this.data.currentLabelObj
    if (currentLabelObj[dataset.name]) {
      delete currentLabelObj[dataset.name]
    } else {
      currentLabelObj[dataset.name] = dataset.name
    }
    this.setData({ currentLabelObj })
  },
  saveLabel () {
    const { options, currentLabel2 } = this.data

    let name = Object.keys(this.data.currentLabelObj)
    if (currentLabel2) {
      name = name.concat(currentLabel2)
    }
    ApiCustomer.addListLabel({
      data: {
        customerId: options.id,
        name
      },
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'none', duration: 3000 })
        this.hideSelectLabel()
        this.getList()
      }
    })
  },
  resetLabel () {
    this.setData({ currentLabel2: '', currentLabelObj: {} })
  }
})
