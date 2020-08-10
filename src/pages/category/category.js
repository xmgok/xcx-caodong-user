const ApiAddress = require('../../api/category')

Page({
  data: {
    categoryList: [],
    categoryIndex: 0
  },

  onLoad () {
    this.getList()
  },

  onShow () {
  },

  onPullDownRefresh () {
    this.getList()
  },

  getList () {
    wx.showLoading({ title: '加载中' })
    ApiAddress.list({
      success: ({ data }) => {
        wx.hideLoading()
        this.setData({ categoryList: data })
        wx.stopPullDownRefresh()
      }
    })
  },
  switchTab ({ currentTarget }) {
    const index = currentTarget.dataset.index
    const itemData = this.data.categoryList[index]
    this.setData({ categoryIndex: index })
    if (itemData.childList.length <= 0) {
      wx.navigateTo({
        url: `/pages/search/search?categoryId=${itemData.id}&categoryName=${itemData.name}`
      })
    }
  },
  goSearchPanel () {
    wx.navigateTo({
      url: '/pages/search-panel/search-panel'
    })
  }
})
