import { filterMixin, filterData } from './filterMixin'
const ApiCustomer = require('../../../../api/cus-m')

Page({
  data: {
    listData: [],
    pageSize: 10,
    pageNum: 1,
    loading: false,
    getEnd: false,
    keyword: '',

    // 简单条件筛选
    payStatus: '', // 下单状态 0未下单 1已下单
    isVip: '', // 是否会员 0非会员 1会员
    payStatusIdx: 0, // 下单状态索引
    isVipIdx: 0, // 是否会员索引
    simpleFilterActive: { payStatus: false, isVip: false },
    isVipActive: false,
    payStatusList: [{ value: 1, label: '已下单' }, { value: 0, label: '未下单' }],
    isVipList: [{ value: 1, label: '会员' }, { value: 0, label: '非会员' }],
    // 排序
    sortOption: 1, // 排序选项 1活跃度 2浏览商品件数 3浏览时长 4浏览次数 5最后操作时间 6最近登录
    sortType: 2, // 排序方式 1正序 2逆序
    sortList: [
      { label: '活跃度', value: 1, sortType: 2 },
      { label: '浏览商品', value: 2, sortType: '' },
      { label: '浏览时长', value: 3, sortType: '' },
      // { label: '浏览次数', value: 4, sortType: '' },
      { label: '最近浏览', value: 5, sortType: '' }
    ],
    // 复杂条件筛选
    showFilterPopup: false,
    ...filterData,

    iPhoneX: wx.getStorageSync('iPhoneX')
  },

  ...filterMixin,

  onShow () {
    this._doSearch()
  },

  onLoad () {
    this.getLabelList()
  },

  onReachBottom () {
    this.getList()
  },

  onPullDownRefresh () {
    this._doSearch()
    wx.stopPullDownRefresh()
  },

  getList () {
    if (this.data.getEnd || this.data.loading) return
    this.setData({ loading: true })

    const { pageSize, pageNum, payStatus, isVip, sortOption, sortType, keyword, form } = this.data
    console.log(isVip)
    ApiCustomer.customerList({
      data: {
        pageNum,
        pageSize,
        payStatus,
        sortOption,
        sortType,
        username: keyword,
        ...form,
        isVip: form.isVip === '' ? isVip : form.isVip
      },
      success: ({ data = {} }) => {
        const dataList = data.dataList || []
        this.setData({
          listData: this.data.listData.concat(dataList),
          loading: false,
          getEnd: (dataList.length < pageSize),
          pageNum: pageNum + 1
        })
      }
    })
  },
  _doSearch () {
    this.setData({ listData: [], pageNum: 1, loading: false, getEnd: false })
    this.getList()
  },
  handleSearchConfirm ({ detail }) {
    this.setData({ keyword: detail })
    this._doSearch()
  },
  // 筛选条件变化
  bindPickerChange ({ target: { dataset: { field } }, detail: { value } }) {
    const fieldVal = this.data[`${field}List`][value].value
    this.setData({
      [`${field}Idx`]: value,
      [field]: fieldVal,
      [`simpleFilterActive.${field}`]: true
    })

    // 处理isVip内外部同步问题
    if (field === 'isVip') this.setData({ 'form.isVip': fieldVal })

    this._doSearch()
  },
  // 选择筛选全部
  selectAll () {
    this.setData({
      payStatus: '',
      isVip: '',
      simpleFilterActive: { payStatus: false, isVip: false },
      'form.isVip': ''
    })
    this._doSearch()
  },
  // 排序
  sortChange ({ currentTarget: { dataset: { index } } }) {
    const sortList = this.data.sortList.map((item, idx) => {
      let sortType = ''
      // 切换排序
      if (idx === index) {
        sortType = {
          '': 2, // 未排序 -> 逆序
          1: '', // 正序 -> 未排序
          2: 1 // 逆序 -> 正序
        }[item.sortType]
      }

      return {
        ...item,
        sortType
      }
    })

    // 设置排序查询字段
    const currSort = sortList.find(item => !!item.sortType)
    if (currSort) {
      this.setData({ sortOption: currSort.value, sortType: currSort.sortType })
    } else {
      this.setData({ sortOption: '', sortType: '' })
    }

    this.setData({ sortList })
    this._doSearch()
  },
  openFilterPopup () {
    this.setData({ showFilterPopup: true })
  },
  onPopupClose () {
    this.setData({ showFilterPopup: false })
  }
})
