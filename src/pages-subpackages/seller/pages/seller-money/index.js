import { PAGINATION } from '../../../../utils/consts'
import { padStart } from '../../../../utils/index'

const ApiSeller = require('../../../../api/seller')
const mixinsPagination = require('../../../../utils/mixins-pagination')

const WxCharts = require('../../../../utils/wxcharts')
const { NUMBER_TO_ZHCN } = require('../../../../utils/consts')

function getDefaultData (options) {
  const date = new Date()
  const year = date.getFullYear()
  const month = padStart(date.getMonth() + 1)
  const endDate = year + '-' + month
  const obj = { // 默认值
    loginId: wx.getStorageSync('loginId'),
    year,
    month,
    endDate,
    NUMBER_TO_ZHCN,
    tabList: ['全部', '未开始', '进行中', '已结束'],
    tabIndex: 2,
    showTab: false,
    result: PAGINATION,
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
    options.type = options.type || obj.tabIndex
    obj.tabIndex = options.type
  }
  return obj
}

Page({
  // data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.renderChart()
    this.getList()
    this.monthReport()
  },

  renderChart () {
    ApiSeller.commissionDetail({
      success: (res) => {
        if (res.data.avcAmount < 0.01 && res.data.wamount < 0.01 && res.data.gamount < 0.01 && res.data.ramount < 0.01) {
          res.data.avcAmoun = 1
          res.data.wamount = 1
          res.data.gamount = 1
          res.data.ramount = 1
        }
        /* eslint-disable */
        new WxCharts({
          canvasId: 'ringCanvas',
          type: 'ring',
          series: [{
            name: '可提现',
            data: ~~(res.data.avcAmount * 100)
          }, {
            name: '待入账',
            data: ~~(res.data.wamount * 100)
          }, {
            name: '提现中',
            data: ~~(res.data.gamount * 100)
          }, {
            name: '已提现',
            data: ~~(res.data.ramount * 100)
          }],
          width: 375,
          height: 200,
          dataLabel: false
        })
        this.setData({ resData: res.data }) // 累计佣金
      }
    })
  },

  getList () {
    let { result, dataList } = this.data
    ApiSeller.commissionlist({
      data: {
        year: this.data.year,
        month: this.data.month,
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },

  monthReport () {
    ApiSeller.monthReport({
      data: {
        year: this.data.year,
        month: this.data.month
      },
      success: res => {
        this.setData({ monthData: res.data })
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
    this.monthReport()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  ...mixinsPagination
})
