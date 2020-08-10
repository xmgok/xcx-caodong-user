import apiVideo from '../../api/video'

Page({
  data: {
    quantity: 1,
    cartGiftList: [],
    isShowGift: false,
    storeName: '',
    ableList: [],
    disableList: [],
    totalAmount: '',
    preTotalAmount: '',
    subtractAmount: '',
    totalNum: '',
    checkNum: '',
    showPurchase: false,
    showGaveaway: false,
    checkAll: 0,
    gaveawayId: '',
    groupId: '',
    editSpecid: '',
    editChecked: 0,
    editCartid: '',
    movableHeight: '180rpx',
    watchId: ''
  },

  onLoad ({ watchId = '' }) {
    this.setData({ watchId })
  },

  onShow () {
    this.getCartList()
  },

  showGift () {
    wx.hideTabBar()
    this.setData({ isShowGift: true })
  },
  hideGift () {
    wx.showTabBar()
    this.setData({ isShowGift: false })
  },
  // cart delete
  onSwipeClose ({ detail, currentTarget: { dataset } }) { // 删除
    const { position, instance } = detail
    let id = dataset.id
    switch (position) {
      case 'left':
      case 'cell':
        instance.close()
        break
      case 'right':
        wx.showModal({
          content: '确认要删除该商品吗？',
          success: (res) => {
            if (res.confirm) {
              instance.close()
              if (dataset.type === 'gift') {
                apiVideo.cartGiftDel({
                  params: {
                    id,
                    watchId: this.data.watchId
                  },
                  success: res => {
                    wx.showToast({ title: res.message, icon: 'none' })
                    this.getCartList()
                  }
                })
              } else {
                apiVideo.cartDelete({
                  params: {
                    ids: String(id),
                    watchId: this.data.watchId
                  },
                  success: res => {
                    wx.showToast({ title: res.message, icon: 'none' })
                    this.getCartList()
                  }
                })
              }
            }
          }
        })
        break
    }
  },

  getCartList () { // 获取列表
    this.setData({ storeName: wx.getStorageSync('storeName') })
    wx.removeStorageSync('giftData')
    wx.showLoading()
    apiVideo.cartList({
      data: {
        watchId: this.data.watchId
      },
      success: ({ data }) => {
        wx.hideLoading()
        let ableList = data.groups || []
        let disableList = data.invalidCarts || []

        ableList = ableList.map(v => {
          v.carts = v.carts.map(item => {
            item.number = item.number > item.inventory ? item.inventory : item.number
            item['_priceInt'] = String(item.price).split('.')[0]
            item['_priceDec'] = String(item.price).split('.')[1]
            return item
          })
          return v
        })

        const cartGiftList = data.cartGiftList || []
        this.setData({
          useGiftType: data.useGiftType,
          cartGiftList,
          ableList,
          disableList,
          totalAmount: data.totalAmount,
          preTotalAmount: data.preTotalAmount,
          subtractAmount: data.subtractAmount,
          totalNum: data.totalNum,
          checkNum: data.checkNum,
          checkAll: data.checkAll
        })
      }
    })
  },

  onQuantityChange ({ currentTarget: { dataset }, detail }) {
    apiVideo.cartEdit({
      data: {
        checked: dataset.checked ? 1 : 0,
        id: dataset.id,
        specId: dataset.specid,
        number: detail,
        watchId: this.data.watchId
      },
      success: () => {
        this.getCartList()
      }
    })
  },

  doCheck ({ currentTarget: { dataset } }) {
    let checked = dataset.checked ? 0 : 1
    let { id, number } = dataset
    // 打选择接口
    apiVideo.cartEdit({
      data: {
        checked,
        id,
        number,
        specId: dataset.specid,
        watchId: this.data.watchId
      },
      success: () => {
        this.getCartList()
      }
    })
  },

  doCheckAll () {
    // 打全选接口
    this.setData({ checkAll: !this.data.checkAll })
    apiVideo.cartCheckedAll({
      params: {
        status: this.data.checkAll ? 1 : 0,
        watchId: this.data.watchId
      },
      success: () => {
        this.getCartList()
      }
    })
  },

  changeSpec ({ currentTarget: { dataset } }) {
    this.setData({
      productId: '',
      editSpecid: dataset.specid,
      editChecked: dataset.checked,
      editCartid: dataset.cartid
    })
    wx.hideTabBar()
    this.setData({
      productId: dataset.id,
      showPurchase: true,
      quantity: dataset.number,
      specContent: dataset.specContent || ''
    })
  },

  goodsPurchaseSelected ({ detail }) {
    this.setData({ showPurchase: false })
    wx.showTabBar()
    if (detail.spec.id === this.data.editSpecid) return
    apiVideo.cartEdit({
      data: {
        checked: 1, // 改变规格时默认选中
        id: this.data.editCartid,
        specId: detail.spec.id,
        number: detail.quantity,
        watchId: this.data.watchId
      },
      success: () => {
        this.getCartList()
      }
    })
  },

  goodsPurchaseClose () {
    wx.showTabBar()
  },

  getGaveaway ({ currentTarget: { dataset } }) {
    let gaveawayId = dataset.id
    this.setData({ gaveawayId: '' })
    wx.hideTabBar()
    this.setData({
      gaveawayId,
      groupId: dataset.groupid,
      showGaveaway: true
    })
  },

  gaveawayClose () {
    wx.showTabBar()
  },

  gaveawaySure ({ detail }) {
    wx.showTabBar()
    this.setData({
      showGaveaway: false
    })
    if (!detail.checked) return
    apiVideo.cartGiftSave({
      data: {
        groupId: this.data.groupId,
        specId: detail.specid,
        watchId: this.data.watchId
      },
      success: () => {
        this.getCartList()
      }
    })
  },

  submit () {
    wx.redirectTo({ url: `/pages/order-confirm/order-confirm?from=cart-video&watchId=${this.data.watchId}` })
  },

  goGiftPage ({ currentTarget: { dataset } }) {
    wx.setStorageSync('giftData', dataset.item)
    this.hideGift()
    wx.navigateTo({ url: `/pages/gift/index?watchId=${this.data.watchId}` })
  }
})
