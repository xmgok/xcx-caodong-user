const ApiProductsearch = require('../../api/productsearch')

Page({
  data: {
    keyword: '',
    showHistory: true,
    history: []
  },

  onLoad () {
    ApiProductsearch.list({
      success: ({ data = [] }) => {
        const history = data.map((item) => item.content)
        this.setData({ history })
      }
    })
  },
  handleSearchConfirm ({ detail }) {
    this._doSearch(detail)
  },
  handleSearchCancel () {
    this.setData({ keyword: '' })
    wx.navigateBack({ delta: 1 })
  },
  bindTagTap ({ target: { dataset: { value } } }) {
    this._doSearch(value)
  },
  _doSearch (value) {
    wx.navigateTo({ url: `/pages/search/search?keyword=${value}` })
  },
  handleDeleteHistory () {
    wx.showModal({
      content: '确定要删除历史记录吗？',
      success: ({ confirm }) => {
        if (!confirm) return
        ApiProductsearch.clear(({
          success: ({ message = '' }) => {
            wx.showToast({ title: message, icon: 'none', duration: 1000 })
            this.setData({ history: [] })
          }
        }))
      }
    })
  },
  onPullDownRefresh () {
    this.onLoad(this.options)
    wx.stopPullDownRefresh()
  }
})
