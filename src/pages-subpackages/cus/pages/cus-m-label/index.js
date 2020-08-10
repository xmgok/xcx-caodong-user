const ApiCusM = require('../../../../api/cus-m')
const mixins = require('../../../../utils/mixins')

function getDefaultData (options) {
  const obj = { // 默认值
    addLabelValue: '',
    keyword: '',
    isShowSelectLabel: false,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
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

  onShow () {
    this.getList()
    this.setData(getDefaultData(this.options))
  },

  labelAdd () {
    const addLabelValue = this.data.addLabelValue
    if (!addLabelValue) {
      wx.showToast({ icon: 'none', title: '标签名称不能为空' })
      return
    }
    if (addLabelValue.length > 6) {
      wx.showToast({ icon: 'none', title: '标签名长度不能超过6个' })
      return
    }

    ApiCusM.add({
      data: {
        name: addLabelValue
      },
      success: () => {
        wx.showToast({ icon: 'none', title: '新增成功' })
        this.getList()
        this.hideSelectLabel()
        this.setData({ addLabelValue: '' })
      }
    })
  },

  showSelectLabel () {
    this.setData({ isShowSelectLabel: true })
  },

  hideSelectLabel () {
    this.setData({ isShowSelectLabel: false })
  },

  handleSearchCancel () {
    wx.navigateBack()
  },
  handleSearchConfirm ({ detail }) {
    if (!detail) {
      wx.showToast({ icon: 'none', title: '请输入关键字' })
      return
    }
    wx.navigateTo({ url: `/pages-subpackages/cus/pages/cus-m-label-search/index?keywords=${detail}` })
  },

  getList () {
    ApiCusM.type_list({
      success: res => {
        this.setData({ resData: res.data })
      }
    })
  },

  onPullDownRefresh () {
    this.onShow()
    wx.stopPullDownRefresh()
  },

  ...mixins
})
