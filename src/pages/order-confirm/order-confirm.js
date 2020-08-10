const addressApi = require('../../api/address')
const orderApi = require('../../api/order')
// const priceCtrl = require('../../utils/price')
const pay = require('../../utils/pay')
// const mixins = require('../../utils/mixins')
// const ApiUser = require('../../api/user')
const ApiCommon = require('../../api/common')
const mixins = require('../../utils/mixins')
// const app = getApp()

Page({
  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    productAmount: '0.00',
    receiver: [],
    // 弹出地址列表选择
    showAddressPicker: false,
    // 当前选择地址
    currentAddress: '',
    // 当前选择地址id
    currentAddressId: '',
    // 地址列表
    addressList: [],
    // 地址列表是否加载中
    addressLoading: false,
    couponCustomerId: 0, // 优惠券id
    expressPrice: '',
    expressId: 0, // 运费模板id
    conponList: [],
    currentConpon: {},
    cartGiftList: [],
    showCouponPopup: false,
    freightList: [],
    showDeliveryPopup: false,
    currentFreight: {},
    productList: [],
    // 是否onLoad执行中，用于避免在 onShow 中重复执行onLoad中的请求
    isOnLoad: false,
    subtotal: 0,
    subtotalInt: '',
    subtotalDec: '',
    goodsList: [],
    discountPrice: '0.00',
    remark: '',
    customerMobile: '',
    // 商品详情
    goods: {},
    // 已选择规格
    selectedSpec: {},
    specIndex: 0,
    // 是否正在支付中
    isPaying: false,
    // 按钮是否可用
    disabled: false,
    submitting: false,
    from: 'product', // 订单来源
    canTake: 0, // 是否支持自提
    isTake: 0, // 是否选择自提
    takeName: '', // 自提名称
    takeAddress: '', // 自提地址
    hasOpenScore: true, // 有没有开启积分
    isUseScore: false, // 是否使用积分
    useIntegral: '', // 使用多少积分
    unitIntegral: 1, // 积分的最小单元
    integralAmount: '0.00', // 积分抵扣金额
    scoreMax: '', // 最多可使用多少积分
    rate: '',
    activeData: {}, // 活动数据
    watchId: '', // 视频观看id
    isShowGift: false
  },

  onLoad ({ from = 'product', watchId = '' }) {
    this.setData({
      from,
      isOnLoad: true,
      userType: wx.getStorageSync('userType'),
      watchId,
      options: this.options
    })
  },

  onShow () {
    const { from, isOnLoad } = this.data
    if (from === 'product') {
      const productList = wx.getStorageSync('to-order-confirm')
      const activeData = wx.getStorageSync('to-order-confirm-active-data')
      this.setData({ productList, activeData })
      this.getOrderInfos()
      // this.initializeData(res.data)
    } else {
      // ...购物车获取
      this.getOrderInfos()
    }

    isOnLoad && wx.getStorage({
      key: 'to-order-confirm-address',
      success: ({ data }) => {
        if (data) {
          this.setData({
            currentAddress: data.currentAddress,
            currentAddressId: data.currentAddressId
          })
        }
        this.getAddressList(!!data, () => this.setData({ isOnLoad: false }))
      },
      fail: () => this.getAddressList(true, () => this.setData({ isOnLoad: false }))
    })

    if (!isOnLoad) this.getAddressList(false)
  },

  getAddressList (setDefault = false, cb) {
    addressApi.list({
      success: ({ data: addressList }) => {
        cb && cb()

        this.setData({
          addressList,
          addressLoading: true
        })

        if (setDefault) {
          let defaultAddress = addressList.find(i => i.isDefault === 1)
          if (!defaultAddress && addressList.length) {
            defaultAddress = addressList[0]
          }
          this.setData({
            currentAddress: defaultAddress || '',
            currentAddressId: (defaultAddress && defaultAddress.id) || ''
          })
        }
      }
    })
  },

  getOrderInfos () {
    let datas = {
      couponCustomerId: this.options.couponCustomerId || this.data.couponCustomerId, // 保持券的选中this.options.couponCustomerId(兑换券 -> 去兑换 -> 兑换)
      expressId: this.data.expressId,
      isTake: this.data.isTake
    }
    if (this.data.hasOpenScore && this.data.useIntegral !== '') { // 后台开启了积分且消费者使用了积分，此处不使用 this.data.useIntegral > 0 是防止输入框里输入0会变成空字符串(此逻辑是和后台接口有关的逻辑)。
      datas.integral = this.data.useIntegral
    }
    if (this.options.couponCustomerId) { // 兑换券进入(兑换券 -> 去兑换 -> 兑换)
      datas.source = 6
    } else if (this.data.from === 'cart') { // 购物车进入
      datas.source = 1
    } else if (this.data.from === 'cart-video') { // 视频购物车进入
      datas.source = 4
      datas.watchId = this.data.watchId
    } else { // 非购物车进入
      const { buyType, activeId, activeType, recordId } = this.data.activeData
      if (activeType === 'group') { // 拼团
        datas.groupId = activeId
        if (buyType === 'groupAloneBuy') { // 拼团单独购买
          delete datas.groupId
          datas.source = 0
        }
        if (buyType === 'groupOpenBuy') { // 开团
          datas.source = 2
          datas.productList = this.data.productList
        }
        if (buyType === 'groupJoinBuy') { // 参团
          datas.source = 3
          datas.productList = this.data.productList
        }
      }
      if (activeType === 'seckill') { // 秒杀
        datas.recordId = activeId
        datas.productList = this.data.productList
        datas.source = 8
      }
      if (activeType === 'bargain') { // 砍价
        datas.productList = this.data.productList
        datas.recordId = recordId
        datas.source = 5
      }
      if (activeType === 'live') { // 直播
        datas.productList = this.data.productList
        datas.watchId = this.data.watchId
        datas.source = 7
      }
    }
    orderApi.preview({
      data: datas,
      success: ({ data }) => {
        let productList = data.productList.map(item => {
          item.priceInt = item.price.split('.')[0]
          item.priceDec = item.price.split('.')[1]
          return item
        })
        let freightList = data.freightList || []
        freightList = freightList.map(item => {
          item.isChoose = 0
          if (item.expressId === data.currentFreight.expressId) {
            item.isChoose = 1
          }
          return item
        })

        let cartGiftLength = 0
        const cartGiftList = (data.cartGiftList || [])
        cartGiftList.forEach(item => {
          cartGiftLength += item.giftList.length
        })

        let setDatas = {
          exchangeAmount: data.exchangeAmount || '0.00',
          productAmount: data.productAmount || '0.00',
          conponList: data.conponList || [],
          cartGiftList,
          cartGiftLength,
          discountPrice: data.discountPrice || '0.00',
          freightList,
          currentConpon: data.currentConpon,
          couponCustomerId: data.currentConpon ? (data.currentConpon.couponCustomerId || 0) : 0,
          currentFreight: data.currentFreight,
          expressPrice: data.expressPrice,
          subtotal: Number(data.totalAmount),
          subtotalInt: data.totalAmount.split('.')[0],
          subtotalDec: data.totalAmount.split('.')[1],
          goodsList: productList,
          takeName: data.name,
          canTake: data.isTakeTheir,
          takeAddress: data.address,
          hasOpenScore: +data.isIntegral === 1, // 有没有开启积分
          unitIntegral: +data.unitIntegral, // 积分的最小单元
          currentIntegral: +data.currentIntegral, // 当前积分总数
          useIntegral: data.useIntegral === null ? '' : +data.useIntegral, // 使用多少积分
          integralAmount: data.integralAmount || '0.00', // 积分抵扣金额
          scoreMax: data.scoreMax, // 最多可使用多少积分
          rate: data.rate
        }
        if (data.currentFreight) {
          setDatas.expressId = data.currentFreight.expressId
        }
        this.setData(setDatas)
      }
    })
  },

  addressPicker () {
    if (this.data.userType === 'staff') {
      this.setData({ showAddressPicker: true, addressLoading: true })
      return
    }
    wx.getSetting({
      success: ({ authSetting }) => {
        if (authSetting['scope.address'] === false) {
          wx.openSetting({ success: () => this.wxAddress() })
          return
        }
        this.wxAddress()
      }
    })
  },
  wxAddress () {
    wx.chooseAddress({
      success: (data = {}) => {
        const address = {
          id: '',
          name: data.userName || '',
          phone: data.telNumber || '',
          province: data.provinceName || '',
          city: data.cityName || '',
          area: data.countyName || '',
          address: data.detailInfo || '',
          isDefault: 1,
          postcode: data.postalCode || ''
        }

        // IMPORTANT 地址列表中有就不再重复添加
        const addressList = this.data.addressList
        const keys = ['name', 'phone', 'province', 'city', 'area', 'address', 'postcode']
        for (let i = 0, len = addressList.length - 1; i < len; i++) {
          const item = addressList[i]
          // 选中的微信地址存在于地址列表中
          if (keys.every(key => item[key] === address[key])) {
            const data = {
              currentAddress: item,
              currentAddressId: item.id
            }
            this.setData(data)
            return
          }
        }

        addressApi.add({
          data: address,
          success: () => {
            this.getAddressList(true, () => this.setData({ isOnLoad: false }))
          }
        })
      }
    })
  },
  onRemarkChange ({ detail }) {
    this.setData({ remark: detail.value })
  },
  closeAddressPopup () {
    this.setData({ showAddressPicker: false })
  },
  onAddressChange ({ detail }) {
    this.setData({ currentAddressId: +detail })
  },
  onAddressSelect (e) {
    const id = +e.currentTarget.dataset.id
    const currentAddress = this.data.addressList.find(i => i.id === id)
    this.setData({
      currentAddressId: id,
      currentAddress,
      showAddressPicker: false
    })

    // if (currentAddress) {
    //   this.setData({ disabled: false })
    // }
  },
  toEditAddress (e) {
    const id = +e.currentTarget.dataset.id
    // this.setData({ showAddressPicker: false })
    wx.navigateTo({ url: `/pages/address-add/address-add?id=${id}` })
  },
  getCoupons () {
    this.setData({ showCouponPopup: true })
  },
  changeSend () {
    this.setData({ showDeliveryPopup: true })
  },
  selectedCoupon ({ detail: { value } }) {
    this.setData({
      couponCustomerId: value
    })
    this.getOrderInfos()
  },
  selectedDelivery ({ detail: { value } }) {
    this.setData({
      expressId: value
    })
    this.getOrderInfos()
  },

  changeTake ({ currentTarget }) {
    this.setData({
      isTake: currentTarget.dataset.type
    })
    this.getOrderInfos()
  },
  onSubmit () {
    if (this.data.scoreIsValid === false) { // 这个false(积分不合法)不等同于undefined(没有积分的操作)。建议提交订单的时候验证。失去焦点验证导致前端的逻辑复杂(因为存在失去焦点的瞬间刚好是点击的下单，目前就是照顾这种情况，写了这么多代码的注释)。
      // 如果后续需要做修复完直接提交订单(不用再点一次下单)，那这里就直接清理定时器并打修复的接口，然后在回调里把scoreIsValid改成合法的，然后再调用一次onSubmit。
      return
    }
    clearTimeout(this.data.scoreTimer) // 积分值合法的话就清理定时器，直接带给后端。
    if (!this.data.currentAddress && !this.data.isTake) {
      wx.showToast({ title: '请添加收货地址', icon: 'none', duration: 2000 })
      return
    }
    const customerMobile = this.data.customerMobile
    if (customerMobile && !/1\d{10}/.test(customerMobile)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none', duration: 2000 })
      return
    }
    let params = {
      orderType: 1,
      couponCustomerId: this.data.couponCustomerId,
      expressId: this.data.expressId,
      // productList: this.data.productList,
      specId: this.data.selectedSpec.id,
      receiverId: this.data.currentAddressId,
      remark: this.data.remark,
      customerMobile: customerMobile || undefined,
      isTake: this.data.isTake
    }
    if (this.data.hasOpenScore && this.data.useIntegral > 0) { // 后台开启了积分且消费者使用了积分
      params.integral = this.data.useIntegral
    }
    if (this.options.couponCustomerId) { // 兑换券进入(兑换券 -> 去兑换 -> 兑换)
      params.source = 6
    } else if (this.data.from === 'cart') { // 购物车进入
      params.source = 1
    } else if (this.data.from === 'cart-video') { // 视频购物车进入
      params.source = 4
      params.orderType = 4
      params.watchId = this.data.watchId
    } else { // 非购物车进入
      const { buyType, activeId, activeType, recordId } = this.data.activeData
      if (activeType === 'group') { // 拼团
        params.orderType = 3
        params.groupId = activeId
        if (buyType === 'groupAloneBuy') { // 拼团单独购买
          delete params.groupId
          params.orderType = 1
          params.source = 0
        }
        if (buyType === 'groupOpenBuy') { // 开团
          params.source = 2
          params.productList = this.data.productList
        }
        if (buyType === 'groupJoinBuy') { // 参团
          params.recordId = recordId
          params.source = 3
          params.productList = this.data.productList
        }
      }
      if (activeType === 'seckill') { // 秒杀
        params.recordId = activeId
        params.productList = this.data.productList
        params.orderType = 7
        params.source = 8
      }
      if (activeType === 'bargain') { // 砍价
        params.productList = this.data.productList
        params.recordId = recordId
        params.orderType = 5
        params.source = 5
      }
      if (activeType === 'live') { // 直播
        params.productList = this.data.productList
        params.watchId = this.data.watchId
        params.source = 7
      }
    }

    const empid = wx.getStorageSync('empidCommission')
    if (empid) {
      params.empId = empid
    }

    wx.showToast({ title: '正在生成订单', icon: 'loading', duration: 10 * 1000 })
    if (this.data.submitting) return
    this.setData({ submitting: true })
    const fnCreate = () => {
      orderApi.create({
        data: params,
        success: ({ data: { recordId, orderCode, payType } }) => {
          wx.hideToast()

          wx.showToast({ title: '生成订单成功', icon: 'loading', duration: 2000 })
          if (payType === 0) { // 0元订单
            // 0元拼团订单
            const activeData = this.data.activeData
            if (activeData.buyType !== 'groupAloneBuy' && activeData.activeType === 'group') { // 非单独购买的拼团支付成功，跳拼团详情页。单独购买当做普通商品购买。
              wx.redirectTo({ url: `/pages/group-detail/group-detail?recordId=${recordId}&referer=orderConfirm` })
              return
            }
            // 0元普通订单
            wx.redirectTo({ url: `../order-detail/order-detail?orderCode=${orderCode}` })
            return
          }
          pay.payment({
            recordId,
            orderCode,
            activeData: this.data.activeData,
            fail: () => this.setData({ submitting: false })
          })
        },
        fail: () => this.setData({ submitting: false })
      })
    }
    ApiCommon.subscribeMsg({
      data: { sceneId: 4 },
      success: (res) => {
        wx.requestSubscribeMessage({ // 订阅消息。
          tmplIds: res.data,
          success: (res) => console.log('success res', res),
          fail: (res) => console.log('fail res', res),
          complete: () => {
            fnCreate()
          }
        })
      },
      fail: () => {
        this.setData({ submitting: false })
      }
    })
  },
  scoreBlur (e) { // 积分是失去了焦点才延时修正
    this.setData({ useIntegral: e.detail.value })
    this.data.scoreIsValid = this.data.useIntegral % this.data.unitIntegral === 0 && this.data.useIntegral <= this.data.currentIntegral
    clearTimeout(this.data.scoreTimer)
    this.data.scoreTimer = setTimeout(() => {
      if (this.data.scoreIsValid) {
        this.getOrderInfos()
        return
      }
      wx.showModal({
        title: '',
        showCancel: false,
        content: `使用积分需要是${this.data.unitIntegral}的整数倍且不能大于${this.data.currentIntegral}，点击确定自动修正`,
        success: (res) => {
          if (res.confirm) {
            this.getOrderInfos()
            this.data.scoreIsValid = true
          }
        }
      })
    }, 100)
  },
  showGift () {
    this.setData({ isShowGift: true })
  },
  hideGift () {
    this.setData({ isShowGift: false })
  },
  goGiftPage ({ currentTarget: { dataset } }) {
    wx.setStorageSync('giftData', dataset.item)
    this.setData({ isShowGift: false })
    wx.navigateTo({ url: `/pages/gift/index?from=order-confirm` })
  },

  showHint () {
    wx.showModal({
      title: '积分抵扣规则',
      showCancel: false,
      content: ` 积分抵扣不超过订单总额的${this.data.rate}%，本次最多使用${this.data.scoreMax}积分`
    })
  },

  switchChange ({ currentTarget: { dataset }, detail: { value } }) {
    const { name, noTrim, formData, formName } = dataset
    const newValue = noTrim ? value : (value.trim ? value.trim() : value)
    // 处理form对象上的数据，因表单上的数据一般放在form对象里统一处理。
    if (formName && formData) {
      formData[name] = newValue
      this.setData({ [formName]: formData })
      console.log(`this.data.${formName}`, this.data[formName])
      return
    }
    // 处理data上的数据
    this.setData({ [name]: newValue })
    console.log(`this.data.${name}`, this.data[name])
    if (this.data[name] === false) {
      this.setData({ useIntegral: '' })
      this.getOrderInfos()
    }
  },

  goExchangeGoods ({ currentTarget: { dataset: { item } } }) {
    wx.navigateTo({ url: `/pages-subpackages/promotion/pages/coupon-exchange-goods/index?id=${item.couponCustomerId}&couponId=${item.couponId}&type=${item.activeGoods}` })
  },

  ...mixins
})
