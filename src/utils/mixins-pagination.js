import { PAGINATION } from './consts'

module.exports = {
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

  resetPaginationAndList () {
    this.setData({
      dataList: [],
      result: PAGINATION
    })
  },

  onReachBottom () {
    let { result } = this.data
    this.setCurPageIncrement()
    if (result.pageNum > result.totalPage) return
    this.getList()
  },

  switchTab ({ currentTarget }) {
    const dataset = currentTarget.dataset
    const options = this.data.options
    options.type = dataset.index
    this.setData({ tabIndex: dataset.index, options })
    this.resetPaginationAndList()
    this.getList()
  }
}
