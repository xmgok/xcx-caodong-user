const ApiCusM = require('../../../../api/cus-m')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options) {
  const obj = { // 默认值
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    isShowEdit: false,
    dataList: [],
    resData: {},
    labelIds: [],
    options: {}
  }
  if (options) { // 根据options重置默认值
    let item = options.item
    item = JSON.parse(item || JSON.stringify({}))
    options.item = item
    obj.labelIds = [item.id]
    obj.isShowEdit = Boolean(item.isEdit)
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  bindinput ({ detail }) {
    this.setData({ 'options.item.name': detail.value })
  },
  labelDel () {
    const item = this.data.options.item
    ApiCusM.delete({
      data: {
        id: item.id
      },
      success: () => {
        wx.showModal({
          content: '确认要删除该标签吗？',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({ icon: 'none', title: '删除成功' })
              this.data.labelIds = []
              // this.resetPaginationAndList()
              // this.getList()
              wx.navigateBack({ delta: 1 })
            }
          }
        })
      }
    })
  },
  labelUpdate () {
    const item = this.data.options.item
    if (!item.name) {
      wx.showToast({ icon: 'none', title: '标签名称不能为空' })
      return
    }
    ApiCusM.update({
      data: {
        id: item.id,
        name: item.name
      },
      success: () => {
        wx.showToast({ icon: 'none', title: '修改成功' })
        // this.resetPaginationAndList()
        // this.getList()
        wx.navigateBack({ delta: 1 })
      }
    })
  },

  getList () {
    let { result, dataList } = this.data
    ApiCusM.customerList({
      data: {
        labelIds: this.data.labelIds,
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList, totalCount: res.data.totalCount })
        this.setPagination(res.data)
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
