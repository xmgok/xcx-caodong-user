import business from '../../../../utils/business'
const ApiMessage = require('../../../../api/message')
const {
  NUMBER_TO_ZHCN
} = require('../../../../utils/consts')
const mixinsPagination = require('../../../../utils/mixins-pagination')
const { DEFAULT_AVATAR_URL } = require('../../../../utils/consts')
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
    dataList: [

    ],
    resData: {},
    options: {},
    txtOBJ: {
      1: '总部通知',
      2: '分公司通知',
      3: '门店通知'
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
    this.setData({
      activeImg: DEFAULT_AVATAR_URL
    })
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
  // 消息读取
  pointClick ({
    currentTarget
  }) {
    const id = currentTarget.dataset.id
    const status = currentTarget.dataset.status

    if (status === 1) return

    ApiMessage.messageRead({
      data: {
        id: id
      },
      success: res => {
        this.resetPaginationAndList()
        this.getList()
      }
    })
  },
  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
