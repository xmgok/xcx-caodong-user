import mixins from '../../../../utils/mixins'
import ApiCustomer from '../../../../api/cus-m'
import ApiOrder from '../../../../api/order'
import { padStart } from '../../../../utils/index'
import { NUMBER_TO_ZHCN } from '../../../../utils/consts'

const orderStatusMap = ['', '待付款', '待发货', '待收货', '已完成', '已取消', '已关闭', '待自提']
const PAGINATION = {
  totalPage: 0,
  totalCount: 0,
  pageNum: 1,
  pageSize: 30
}

function getDefaultData (options) {
  const myDate = new Date()
  const year = myDate.getFullYear()
  const month = padStart(myDate.getMonth() + 1)
  const date = padStart(myDate.getDate())
  const endDate = year + '-' + month + '-' + date
  const obj = { // 默认值
    year,
    month,
    date,
    endDate,
    NUMBER_TO_ZHCN,
    tabList: ['商品订单', '浏览商品', '浏览轨迹'],
    tabIndex: 0,
    showTab: true,
    isShowSelectLabel: false,
    pagination: { ...PAGINATION },
    listData: [],
    detailData: {}, // 客户详情
    myLabelList: {}, // 可选标签列表
    currentLabel2: '',
    currentLabelObj: {},
    browseTime: '', // 总游览时长
    productSummary: '', // 浏览商品行为汇总
    totalTakeOrder: '', // 订单汇总
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

    this.getDetail()
    this.getList()
  },

  onShow () {
    this.getDetail()
  },

  onReachBottom () {
    let { pagination } = this.data
    this.setCurPageIncrement()
    if (pagination.pageNum > pagination.totalPage) return
    this.getList()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixins,

  switchTab ({ currentTarget: { dataset } }) {
    this.data.options.tabIndex = dataset.index
    this.setData({
      tabIndex: dataset.index,
      listData: [],
      pagination: {
        ...PAGINATION
      }
    })
    this.getList()
  },

  // 客户详情
  getDetail () {
    ApiCustomer.customerInfo({
      params: {
        customerId: this.data.options.userId
      },
      success: ({ data = {} }) => {
        const currentLabelObj = this.data.currentLabelObj
        data.userLabel.forEach(v => {
          currentLabelObj[v.name] = v.name
        })
        this.setData({ detailData: data, currentLabelObj })
      }
    })
  },
  getList () {
    let { pagination, listData, options } = this.data
    const { userId } = options

    // 商品订单
    if (this.data.tabIndex === 0) {
      ApiOrder.totalTakeOrder({
        params: { userId },
        success: ({ data }) => {
          this.setData({ totalTakeOrder: data })
        }
      })
      ApiOrder.list({
        params: {
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          orderType: 2,
          userId
        },
        success: ({ data = {} }) => {
          listData = listData.concat(data.dataList).map(item => {
            const [_orderAmountInt, _orderAmountDec] = (item.orderAmount || '').split('.')
            return {
              ...item,
              _orderStatus: orderStatusMap[item.orderStatus],
              _orderAmountInt,
              _orderAmountDec
            }
          })
          this.setData({ listData })
          this.setPagination(data)
        }
      })
      // 浏览商品
    } else if (this.data.tabIndex === 1) {
      ApiCustomer.productSummary({
        params: { userId },
        success: ({ data = {} }) => {
          this.setData({ productSummary: data })
        }
      })

      ApiCustomer.actionProductList({
        params: {
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          userId
        },
        success: ({ data = {} }) => {
          listData = listData.concat(data.dataList)
          this.setData({ listData })
          this.setPagination(data)
        }
      })
      // 浏览轨迹
    } else if (this.data.tabIndex === 2) {
      const { year, month, date } = this.data
      const params = {
        date: `${year}-${month}-${date}`,
        userId
      }

      // 浏览总时长
      ApiCustomer.browseTime({
        params,
        success: ({ data = {} }) => {
          this.setData({ browseTime: data })
        }
      })

      // 浏览轨迹列表
      ApiCustomer.actionList({
        params: {
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          ...params
        },
        success: ({ data = {} }) => {
          listData = listData.concat(data.dataList)
          this.setData({ listData })
          this.setPagination(data)
        }
      })
    }
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
    this.setData({ currentLabel: dataset.name, currentLabelObj })
  },
  saveLabel () {
    const { options, currentLabel2 } = this.data

    let name = Object.keys(this.data.currentLabelObj)
    if (currentLabel2) {
      name = name.concat(currentLabel2)
    }
    ApiCustomer.addListLabel({
      data: {
        customerId: options.userId,
        name
      },
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'none', duration: 3000 })
        this.hideSelectLabel()
        this.getDetail()
      }
    })
  },
  resetLabel () {
    this.setData({ currentLabel2: '', currentLabelObj: {} })
  },
  // 变更浏览轨迹搜索日期
  bindDateChange ({ detail: { value } }) {
    const [year, month, date] = value.split('-')
    this.setData({ year, month, date })
    this.resetPaginationAndList()
    this.getList()
  },

  setPagination (data = {}) {
    this.setData({
      pagination: {
        totalPage: data.totalPage,
        totalCount: data.totalCount,
        pageNum: data.pageNum,
        pageSize: this.data.pagination.pageSize
      }
    })
  },
  setCurPageIncrement () {
    let { pagination } = this.data
    pagination.pageNum++
    this.setData({ pagination })
  },
  resetPaginationAndList () {
    let { pagination } = this.data
    this.setData({
      listData: [],
      pagination: {
        ...PAGINATION,
        pageSize: pagination.pageSize
      }
    })
  }
})
