const ApiAddress = require('../../api/address')

Page({
  data: {
    keyword: '',
    listData: [],
    getEnd: false
  },

  onShow () {
    this.getList()
  },

  getList () {
    ApiAddress.paramList({
      params: { paramkey: this.data.keyword },
      success: ({ data = [] }) => {
        this.setData({ listData: data, getEnd: true })
      }
    })
  },
  bindKeyInputConfirm ({ detail }) {
    this.setData({ listData: [], getEnd: false, keyword: detail.value })
    this.getList()
  }
})
