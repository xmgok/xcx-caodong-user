import ApiPercentPay from '../../api/percent-pay'
import { dateFormat } from '../../utils/index'

// 审核状态
const STATUS_MAP = { 1: '待审核', 2: '已发放', 3: '已驳回' }

Page({
  data: {
    date: dateFormat(new Date(), 'yyyy-MM'),
    _date: dateFormat(new Date(), 'yyyy年MM月'),
    endDate: dateFormat(new Date(), 'yyyy-MM'),
    allAmount: '0.00',
    allVerify: '0.00',
    list: [],
    loading: false,
    getEnd: false,
    totalPage: 0,
    totalCount: 0,
    pageNum: 1,
    pageSize: 10,
    STATUS_MAP
  },

  onLoad () {
    this.getAmountData()
    this.getList()
  },

  onReachBottom () {
    if (this.data.getEnd) return
    this.getList()
  },

  bindDateChange ({ detail: { value } }) {
    this.setData({
      date: value,
      _date: dateFormat(new Date(value), 'yyyy年MM月'),
      pageNum: 1,
      list: [],
      getEnd: false,
      loading: false
    })
    this.getAmountData()
    this.getList()
  },
  getAmountData () {
    ApiPercentPay.withdrawAmountData({
      data: {
        applyTime: `${this.data.date}-01`
      },
      success: ({ data: { allAmount, allVerify } }) => {
        this.setData({
          allAmount: allAmount || '0.00',
          allVerify: allVerify || '0.00'
        })
      }
    })
  },
  getList () {
    let {
      list,
      pageNum,
      pageSize,
      loading,
      getEnd,
      date
    } = this.data

    if (getEnd || loading) return

    this.setData({ loading: true })
    ApiPercentPay.withdrawList({
      data: {
        applyTime: `${date}-01`,
        pageNum,
        pageSize
      },
      success: ({ data: { dataList } }) => {
        this.setData({
          list: list.concat(dataList).map(item => {
            return {
              ...item
            }
          }),
          pageSize,
          loading: false,
          getEnd: (dataList.length < pageSize),
          pageNum: ++pageNum
        })
      }
    })
  }
})
