import business from '../../../../utils/business'
const ApiMessage = require('../../../../api/message')
const {
  NUMBER_TO_ZHCN
} = require('../../../../utils/consts')

function getDefaultData (options, self) {
  const obj = { // 默认值
    loginId: wx.getStorageSync('loginId'),
    tabIndex: 0,
    NUMBER_TO_ZHCN,
    showTab: true,
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [
    ],
    resData: {},
    options: {},
    messageIcons: {
      1: 'icon-gongsitongzhi',
      2: 'icon-xinzengkehu',
      3: 'icon-kehuxiadan',
      4: 'icon-huodongtongzhi',
      5: 'icon-renwutongzhi',
      6: 'icon-zhanghubiandong',
      7: 'icon-xiaofeizhewode-yuyue'
    },
    messageTxt: {
      1: '公司通知',
      2: '新增客户',
      3: '客户下单',
      4: '活动通知',
      5: '任务通知',
      6: '账户变动',
      7: '预约单通知'
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
    // this.setData(getDefaultData(options, this))
    this.getList()
  },
  onShow () {
    this.getList()
  },
  getList () {
    ApiMessage.myList({
      data: {},
      success: res => {
        const data = res.data
        this.setData({
          dataList: data
        })
      }
    })
  },
  // 消息读取
  pointClick ({
    currentTarget
  }) {
    const status = currentTarget.dataset.status
    if (status === 1) return
    const id = currentTarget.dataset.id
    ApiMessage.messageRead({
      data: {
        id: id
      },
      success: res => {
        // this.resetPaginationAndList()
        // this.getList()
      }
    })
  },
  goDatail ({
    currentTarget
  }) {
    const type = currentTarget.dataset.type
    const subType = currentTarget.dataset.subType
    switch (type) {
      case 1:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail1/index?type=${type}&&subType=${subType}`
        })
        break
      case 2:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail2/index?type=${type}&&subType=${subType}`
        })
        break
      case 3:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail3/index?type=${type}&&subType=${subType}`
        })
        break
      case 4:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail4/index?type=${type}&&subType=${subType}`
        })
        break
      case 5:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail5/index?type=${type}&&subType=${subType}`
        })
        break
      case 6:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail6/index?type=${type}&&subType=${subType}`
        })
        break
      case 7:
        wx.navigateTo({
          url: `/pages-subpackages/message/pages/detail7/index?type=${type}&&subType=${subType}`
        })
        break
      default:
        break
    }
  },
  onPullDownRefresh () {
    // this.onLoad(this.data.options)
    this.getList()
    wx.stopPullDownRefresh()
  },

  setPagination (data = {}) {
    this.setData({
      result: {
        totalPage: data.totalPage,
        totalCount: data.totalCount,
        pageNum: data.pageNum,
        pageSize: this.data.result.pageSize
      }
    })
  },

  setCurPageIncrement () {
    let {
      result
    } = this.data
    result.pageNum++
    this.setData({
      result
    })
  },

  resetPaginationAndList () {
    let {
      result
    } = this.data
    this.setData({
      dataList: [],
      result: {
        totalPage: 10,
        totalCount: 300,
        pageNum: 1,
        pageSize: result.pageSize
      }
    })
  }
})
