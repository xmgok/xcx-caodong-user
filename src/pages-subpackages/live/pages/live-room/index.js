import ApiLive from '../../../../api/live'
import webimhandler from '../../components/mlvb-live-room/webim_handler'
import priceCtrl from '../../../../utils/price'
import business from '../../../../utils/business'
import timMix from './timMix'

const app = getApp()

Page({
  component: null,
  data: {
    headerHeight: app.globalData.headerHeight,
    statusBarHeight: app.globalData.statusBarHeight,
    iPhoneX: wx.getStorageSync('iPhoneX'),
    showGoodsSelector: false, // 显示选择商品列表
    showPurchase: false, // 显示规格选择
    productList: [], // 商品列表
    currentProduct: '', // 选中商品
    currentProductIdx: -2, // 选中商品索引，用于规格回显（-1代表置顶商品）
    topProduct: '', // 置顶商品
    userInfo: '', // 主播信息
    pageNum: 1, // 商品列表分页
    pageSize: 10,
    submitting: false,
    loadComplete: false,

    // === Live ===
    roomId: '',
    roomName: '',
    role: '', // anchor 主播；audience 观众
    showLiveRoom: false, // 是否开启直播
    anchorOnline: true, // 主播是否在线
    shouldExit: false,

    // === IM ===
    identifier: '', // 当前用户身份标识，必选
    userSig: '', // 当前用户签名，必选
    nickName: '', // 当前用户昵称，选填
    avChatRoomId: '', // 群ID, 必选
    messageList: [], // 消息列表
    systemMsg: '', // 系统消息
    stickProductMsg: '', // 推送的置顶商品
    msgContent: '', // 发送消息
    scrollTop: 0 // 用于消息滚动到底部
  },

  onShow () {
    if (this.data.shouldExit) {
      wx.showModal({
        title: '提示',
        content: '收到退房通知',
        showCancel: false,
        complete: function () {
          wx.navigateBack({ delta: 1 })
        }
      })
    }
  },

  // 仅在非主播时传roomId
  onLoad ({ id = '', role, scene = '' }) {
    const userId = wx.getStorageSync('userid') || wx.getStorageSync('empid')
    const nickName = wx.getStorageSync('nickName')

    scene = business.sceneParse(scene)

    let isShowBack = true
    const { pages } = business.getCurrentPage()
    if (pages.length < 2) {
      isShowBack = false
    }

    this.setData({
      isShowBack,
      roomId: scene.id || id,
      // Hack: 为在im系统提示消息中获取当前用户昵称（identifierNick参数无实际作用）
      identifier: `${userId};;${nickName}`,
      nickName,
      role: scene.role || role === 'anchor' ? 'anchor' : 'audience',
      showLiveRoom: true
    })

    // 开始直播/观看直播
    if (this.data.showLiveRoom) {
      wx.showLoading()
      setTimeout(() => wx.hideLoading(), 5000)

      this.component = this.selectComponent('#id_liveroom')
      this.component.start()
    }
  },

  onUnload () {
    console.warn('webimhandler.logout', this.data.nickName)
    webimhandler.logout() // 登出
  },

  // im 相关操作
  ...timMix,

  // 取当前主播信息（由组件内接口返回）
  onAnchorInfo ({ detail: { roomList } }) {
    const userInfo = roomList[0]
    this.setData({
      userInfo,
      avChatRoomId: userInfo.groupId,
      roomId: this.data.roomId || userInfo.id,
      roomName: userInfo.name || userInfo.nickname,
      nickname: userInfo.nickname
    })

    wx.setNavigationBarTitle({ title: userInfo.name })

    // 初始化IM
    ApiLive.sign({
      data: { identifier: this.data.identifier },
      success: ({ data: userSig }) => {
        this.setData({ userSig })
        this.initIM()
      }
    })
  },

  // 获取置顶商品
  getTopProduct () {
    ApiLive.topProduct({
      data: { roomId: this.data.roomId },
      success: ({ data }) => {
        // 无置顶商品
        if (!data) return

        const { int, dec } = priceCtrl.currency(data.salePrice)
        this.setData({
          topProduct: {
            ...data,
            _priceInt: int,
            _priceDec: dec,
            _quantity: 1
          }
        })
      }
    })
  },

  // 获取商品列表
  getProductList () {
    if (this.data.loadComplete) return

    ApiLive.listProduct({
      data: {
        roomId: this.data.roomId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: ({ data }) => {
        const { dataList = [] } = data
        const loadComplete = dataList.length < this.data.pageSize
        this.setData({
          productList: this.data.productList
            .concat(dataList.map((item) => {
              const { int, dec } = priceCtrl.currency(item.salePrice)
              return {
                ...item,
                _priceInt: int,
                _priceDec: dec,
                _quantity: 1
              }
            })),
          loadComplete
        })
      }
    })
  },

  // 商品列表分页加载
  productScrollLower () {
    if (!this.data.loadComplete) {
      this.setData({ pageNum: this.data.pageNum + 1 })
      this.getProductList()
    }
  },

  // 直播事件监听
  onRoomEvent (e) {
    var self = this
    var args = e.detail
    console.log(e.detail)
    wx.hideLoading()

    switch (args.tag) {
      case 'roomClosed': {
        wx.showModal({
          content: `房间已解散`,
          showCancel: false,
          complete: () => {
            wx.navigateBack({ delta: 1 })
          }
        })
        break
      }
      case 'error': {
        if (args.detail !== '多次拉流失败') {
          wx.showToast({ title: `${args.detail}[${args.code}]`, icon: 'none', duration: 1500 })
        }
        if (args.code === 5000) {
          this.data.shouldExit = true
        } else if (args.code === -2301) {
          this.setData({ anchorOnline: false })
        } else {
          if (args.code !== -9004) {
            setTimeout(() => wx.navigateBack({ delta: 1 }), 1500)
          } else {
            self.setData({ linked: false, phoneNum: '' })
          }
        }
        break
      }
      default: {
        console.log('onRoomEvent default: ', e)
        break
      }
    }
  },

  // 点击事件处理
  handleTap ({ currentTarget: { dataset } }) {
    const { type, index, productId } = dataset

    // 显示/隐藏弹窗
    const popupPrefix = ['show-popup:', 'hide-popup:']
    for (let i = 0; i < popupPrefix.length; i++) {
      if (type.startsWith(popupPrefix[i])) {
        this.setData({ [type.split(popupPrefix[i])[1]]: i === 0 })
        return
      }
    }

    switch (type) {
      // 商品列表
      case 'goods':
        this.setData({
          showGoodsSelector: true,
          productList: [],
          pageNum: 1,
          loadComplete: false
        })

        this.getTopProduct()
        this.getProductList()
        break
      // 选商品规格
      case 'goods-detail':
        this.setData({ showPurchase: false })

        let currentProduct = this.data.productList[index]
        // 置顶商品
        if (index === -1) {
          currentProduct = this.data.topProduct
        }
        currentProduct.roomId = this.data.roomId

        this.setData({
          currentProduct,
          currentProductIdx: +index,
          showPurchase: true
        })
        break
      // 开播提醒
      case 'remind':
        console.log('开播提醒')
        break
      // 商品置顶
      case 'stick':
        ApiLive.topSet({
          data: {
            roomId: +this.data.roomId,
            productId
          },
          success: ({ data }) => {
            wx.showToast({ title: '置顶成功', icon: 'success' })
            this.getTopProduct()
          }
        })
        break
      case 'order':
        wx.navigateTo({ url: '/pages/order-list/order-list' })
        break
      case 'share':
        const { roomId, roomName, userInfo } = this.data
        const scene = business.sceneStringify({
          pageId: 12,
          id: roomId,
          role: 'audience',
          empid: wx.getStorageSync('empidCommission')
        })

        this.setData({
          showShare: true,
          imgList: [userInfo.imgUrl],
          shareText: roomName,
          shareUrl: business.scene2Qr(scene, app)
        })
        break
    }
  },

  goodsSelectorClose () {
    this.setData({
      productList: [],
      pageNum: 1,
      loadComplete: false,
      showGoodsSelector: false
    })
  },

  // 关闭弹窗
  selectorClose ({ currentTarget: { dataset } }) {
    this.setData({ [dataset.name]: false })

    if (dataset.name === 'showCommentSelector') this.setData({ commentTo: {} })
  },

  onQuantityChangeTop ({ detail: quantity, currentTarget: { dataset } }) {
    console.log(quantity, dataset.index)
    this.setData({ [`topProduct._quantity`]: quantity })
  },

  // 商品购买数量变更
  onQuantityChange ({ detail: quantity, currentTarget: { dataset } }) {
    console.log(quantity, dataset.index)
    this.setData({ [`productList[${dataset.index}]._quantity`]: quantity })
  },

  // 选择商品规格
  goodsPurchaseSelected ({ detail }) {
    console.log(detail)

    // 更新商品选择列表
    const { productList, currentProductIdx } = this.data
    let curr
    if (currentProductIdx >= 0) {
      curr = productList[currentProductIdx]
    } else if (currentProductIdx === -1) {
      curr = this.data.topProduct
    }

    if (curr && detail.spec) {
      const { specContent, id, price, imgUrl } = detail.spec
      const { int, dec } = priceCtrl.currency(price)
      curr = {
        ...curr,
        specContent: specContent,
        specId: id,
        price: price,
        _priceInt: int,
        _priceDec: dec,
        _quantity: detail.quantity,
        imgUrl: imgUrl || curr.imgUrl
      }

      if (currentProductIdx >= 0) {
        this.setData({ [`productList[${currentProductIdx}]`]: curr })
      } else if (currentProductIdx === -1) {
        this.setData({ topProduct: curr })
      }
    }

    wx.setStorageSync('to-order-confirm-active-data', {
      buyType: detail.buyType,
      activeId: detail.activeId,
      activeType: detail.activeType,
      recordId: detail.recordId // 参团需要这个id
    })

    this.setData({
      showGoodsSelector: true,
      showPurchase: false
    })
  },

  goodsPurchaseClose ({ detail }) {
    console.log(detail)
  },

  // 立即购买
  submit () {
    const { productList, topProduct } = this.data
    const selectProd = productList
      .filter(v => !!v.specId && v._quantity > 0)
      .map(v => ({
        productId: v.productId,
        specId: v.specId,
        productNum: v._quantity
      }))

    if (topProduct && !!topProduct.specId && topProduct._quantity > 0) {
      selectProd.push({
        productId: topProduct.productId,
        specId: topProduct.specId,
        productNum: topProduct._quantity
      })
    }

    if (!selectProd.length) {
      wx.showToast({ title: '请选择商品规格', icon: 'none' })
      return
    }

    // 下单消息发送
    ApiLive.order({ data: { roomId: this.data.roomId } })

    console.log('productList', productList)
    console.log('topProduct', topProduct)
    console.log('selectProd', selectProd)

    wx.setStorageSync('to-order-confirm', selectProd)
    wx.navigateTo({ url: `/pages/order-confirm/order-confirm?watchId=${this.data.roomId}` })
  },

  onBack () {
    wx.navigateBack({ delta: 1 })
  },

  onShareAppMessage () {
    const empId = wx.getStorageSync('empidCommission')
    const { roomId, roomName } = this.data
    const path = `/pages-subpackages/live/pages/live-room/index?id=${roomId}${empId ? `&empid=${empId}` : ''}`
    console.log('分享路径', path)
    return {
      path,
      title: roomName || '',
      imageUrl: this.data.imgList[0]
    }
  }
})
