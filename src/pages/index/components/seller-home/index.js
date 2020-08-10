import { PAGINATION } from '../../../../utils/consts'

const ApiSeller = require('../../../../api/seller')

Component({
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show () {
    }
  },
  properties: {
    reachBottomNum: {
      type: Number,
      value: 0,
      observer (newValue) {
        console.log('reachBottomNum newValue', newValue)
        this.onReachBottom()
      }
    },
    refreshNum: {
      type: Number,
      value: 0,
      observer (newValue) {
        console.log('refreshNum newValue', newValue)
        this.refresh()
      }
    }
  },
  data: {
    result: PAGINATION
  },
  attached () {
    this.init()
  },
  methods: {
    init () {
      this.sellerGoodsList()
    },
    refresh () {
      this.setData({ sellerGoodsList: [], result: PAGINATION })
      this.sellerGoodsList()
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
      let { result } = this.data
      result.pageNum++
      this.setData({ result })
    },
    onReachBottom () {
      let { result } = this.data
      this.setCurPageIncrement()
      if (result.pageNum > result.totalPage) return
      this.sellerGoodsList()
    },
    sellerGoodsList () {
      let { result } = this.data
      ApiSeller.getProdCommissions({
        data: {
          keyword: this.data.keyword,
          pageNum: result.pageNum,
          pageSize: result.pageSize
        },
        success: res => {
          if (!this.data.sellerGoodsList) {
            this.data.sellerGoodsList = []
          }
          this.setData({ sellerGoodsList: this.data.sellerGoodsList.concat(res.data.dataList) })
          this.setPagination(res.data)
        }
      })
    }
  }
})
