import apiCart from '../../api/cart'

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
    movableHeight: '180rpx'
  },
  onLoad () {
  },
  onShow () {
    wx.showTabBar() // 修复 员工首页(进入)代客下单(进入)购物车 不显示底部导航
    this.setData({ ableList: [] }) // 修复 购物车--去凑单--添加当前已有规格的商品，商品数量为2件时，减号不可用
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
          title: '确认要删除该商品吗？',
          success: (res) => {
            if (res.confirm) {
              instance.close()
              if (dataset.type === 'gift') {
                apiCart.delGift({
                  params: { id },
                  success: res => {
                    wx.showToast({ title: res.message, icon: 'none' })
                    this.getCartList()
                  }
                })
              } else {
                apiCart.del({
                  params: {
                    ids: String(id)
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
    apiCart.list({
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
    apiCart.edit({
      data: {
        checked: dataset.checked ? 1 : 0,
        id: dataset.id,
        specId: dataset.specid,
        number: detail
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
    apiCart.edit({
      data: { checked, id, specId: dataset.specid, number },
      success: () => {
        this.getCartList()
      }
    })
  },

  doCheckAll () {
    // 打全选接口
    this.setData({
      checkAll: !this.data.checkAll
    })
    apiCart.checkAll({
      params: {
        status: this.data.checkAll ? 1 : 0
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
    // if (detail.spec.id === this.data.editSpecid) return // 修复，数量改变不会打接口的问题。
    apiCart.edit({
      data: {
        checked: this.data.editChecked,
        id: this.data.editCartid,
        specId: detail.spec.id,
        number: detail.quantity
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
    apiCart.addGift({
      data: {
        groupId: this.data.groupId,
        specId: detail.specid
      },
      success: () => {
        this.getCartList()
      }
    })
  },

  submit () {
    wx.navigateTo({ url: `/pages/order-confirm/order-confirm?from=cart` })
  },

  goGiftPage ({ currentTarget: { dataset } }) {
    wx.setStorageSync('giftData', dataset.item)
    this.hideGift()
    wx.navigateTo({ url: `/pages/gift/index?from=cart` })
  },

  goProductPage ({ currentTarget: { dataset } }) {
    wx.navigateTo({ url: `/pages/product/product?id=${dataset.item.productId}` })
  }
})
