import business from '../../../../utils/business'
const ApiSeller = require('../../../../api/seller')
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
    txtOBJ: {
      1: '总部通知',
      2: '分公司通知',
      3: '门店通知'
    },
    options: {}
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
    console.log(options)
    this.setData(getDefaultData(options, this))
    this.getList()
    this.getTabData()
  },

  getTabData () {
    this.setData({
      tabList: ['全部(99)', '二级(55)', '三级(44)']
    })
  },

  getList () {
    let {
      result,
      dataList,
      options
    } = this.data
    ApiSeller.mycorps({
      data: {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        rank: options.type + 1
      },
      success: res => {
        const data = res.data
        dataList = dataList.concat(data.dataList)
        this.setData({
          dataList,
          tabList: [`全部(${(data.secondCount + data.thirdCount) || 0})`, `二级(${data.secondCount || 0})`, `三级(${data.thirdCount || 0})`]
        })
        this.setPagination(data)
      }
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

  ...mixinsPagination,

  onShareAppMessage () {
    ApiSeller.saveInvitationLog()
    return {
      title: '快来成为分销商，赚佣金啦！',
      imageUrl: 'https://qiniu.icaodong.com/xcx/common/seller-share.png?v=1.0.0',
      path: `/pages-subpackages/seller/pages/seller-request/index?type=seller&parentId=${this.data.loginId}&empid=${this.data.loginId}&storeId=${wx.getStorageSync('storeId')}`
    }
  }
})
