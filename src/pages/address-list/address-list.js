const ApiAddress = require('../../api/address')

Page({
  data: {
    listData: [],
    getEnd: false
  },
  onLoad () {
  },
  onShow () {
    this.getList()
  },
  getList () {
    ApiAddress.list({
      success: ({ data = [] }) => {
        this.setData({ listData: data, getEnd: true })
      }
    })
  },
  onSetDefault ({ currentTarget }) {
    const index = currentTarget.dataset.index
    let listData = this.data.listData
    if (listData[index].isDefault > 0) return
    listData[index].isDefault = 1
    ApiAddress.add({
      data: listData[index],
      success: ({ message }) => {
        wx.hideLoading()
        listData.forEach((item, itemIndex) => {
          if (item.isDefault > 0 && itemIndex !== index) {
            item.isDefault = 0
          }
        })
        wx.showToast({ title: message, icon: 'success', duration: 1000 })
        this.setData({ listData })
      }
    })

    this.setData({ listData })
  },
  onDel ({ currentTarget }) {
    wx.showModal({
      content: '确定删除该地址吗？',
      success: ({ confirm = false }) => {
        if (!confirm) return
        let listData = this.data.listData
        const index = currentTarget.dataset.index
        const id = listData[index].id

        wx.showLoading({ title: '删除中' })
        ApiAddress.delete({
          params: { id },
          success: ({ message }) => {
            wx.hideLoading()
            wx.showToast({ title: message, icon: 'success', duration: 1000 })
            listData.splice(index, 1)
            this.setData({ listData })
          }
        })
      }
    })
  }
})
