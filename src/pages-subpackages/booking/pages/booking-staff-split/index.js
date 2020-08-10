import business from '../../../../utils/business'
const ApiBooking = require('../../../../api/booking')
const { DEFAULT_AVATAR_URL } = require('../../../../utils/consts')
const mixinsPagination = require('../../../../utils/mixins-pagination')
function getDefaultData (options, self) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    resData: {},
    options: {},
    activeImg: ''
  }
  if (options) { // 根据options重置默认值
    obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = {
      ...options,
      ...business.sceneParse(options.scene)
    }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.setData({
      activeImg: DEFAULT_AVATAR_URL
    })
    this.getList()
  },
  // 是否选中
  doCheck ({
    currentTarget
  }) {
    const index = currentTarget.dataset.index
    const list = this.data.dataList
    list.forEach(v => {
      v.checked = false
    })
    list[index].checked = !list[index].checked
    this.setData({
      dataList: list
    })
  },
  getSelected () {
    return this.data.dataList.filter(v => v.checked)
  },
  confirm () {
    // 分配完毕。回退。
    let empId = this.data.dataList.find(v => v.checked).id
    if (this.data.isConfirm) return
    this.data.isConfirm = true
    ApiBooking.allot({
      data: {
        code: this.data.options.code,
        empId: empId
      },
      success: ({
        status,
        message
      }) => {
        this.data.isConfirm = false
        if (status !== 200) return
        wx.showToast({
          title: message || '操作成功',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      },
      fail: () => {
        this.data.isConfirm = false
      }
    })
  },
  getList () {
    let {
      result,
      dataList,
      options
    } = this.data
    ApiBooking.getStoreList({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        storeId: wx.getStorageSync('storeId'),
        userId: options.userId
      },
      success: res => {
        const data = res.data
        dataList = dataList.concat(data.dataList)
        this.setData({
          dataList
        })
        this.setPagination(data)
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
