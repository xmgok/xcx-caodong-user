import business from '../../../../utils/business'
const ApiMessage = require('../../../../api/message')
const {
  NUMBER_TO_ZHCN
} = require('../../../../utils/consts')
const mixinsPagination = require('../../../../utils/mixins-pagination')

function getDefaultData (options, self) {
  const obj = { // 默认值
    loginId: wx.getStorageSync('loginId'),
    tabList: ['全部', '二级', '三级'],
    tabIndex: 0,
    NUMBER_TO_ZHCN,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    resData: {},
    options: {},
    txtOBJ: {
      1: '预约单待分配',
      2: '预约单服务',
      3: '预约单已完成',
      4: '预约单已取消',
      5: '预约单已关闭'

    }

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
    this.getList()
  },
  onShow () {
    this.setData(getDefaultData(this.options, this))
    this.getList()
  },
  getList () {
    let {
      result,
      dataList,
      options
    } = this.data
    ApiMessage.myListDetail({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        type: options.type
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
  // 预约单详情
  goOrderDetail ({
    currentTarget
  }) {
    const { item, id } = currentTarget.dataset
    ApiMessage.messageRead({
      data: { id },
      success: res => {
        // this.resetPaginationAndList()
        // this.getList()
      }
    })
    wx.navigateTo({
      url: `/pages-subpackages/booking/pages/booking-detail-staff/index?code=${item.content.bookingCode}&userId=${item.content.userId}`
    })
  },
  bindChange (e) {
    const arr = e.detail.value.split('-')
    this.setData({
      year: arr[0],
      month: arr[1]
    })
    this.resetPaginationAndList()
    this.getList()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
