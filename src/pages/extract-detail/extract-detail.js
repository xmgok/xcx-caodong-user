const Api = require('../../api/percent-pay')

Page({
  data: {
    listData: [],
    pageNum: 1,
    pageSize: 999,
    ajax: false,
    getEnd: false
  },
  onLoad () {
    this.getList()
  },
  getList () {
    this.setData({ ajax: true })
    Api.detail({
      success: res => {
        this.setData({
          listData: res.data.dataList || [],
          ajax: false,
          getEnd: res.data.totalCount < this.data.pageSize
        })
      }
    })
  }
})
