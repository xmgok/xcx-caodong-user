import ApiCart from '../../api/cart'
import ApiCoupon from '../../api/coupon'
// import ApiVideo from '../../api/video'
import ApiSeckill from '../../api/seckill'
import { timeCountDown } from '../../utils/index'
import business from '../../utils/business'

const ApiTask = require('../../api/task')
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
const addressApi = require('../../api/address')
const priceCtrl = require('../../utils/price')
const ApiGroup = require('../../api/group')
const ApiComment = require('../../api/comment')
const ApiSeller = require('../../api/seller')
const app = getApp()
const VIDEO_IMG_SUFFIX = app.VIDEO_IMG_SUFFIX

Page({
  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    userType: '',
    product: null,
    current: 0,
    currentNum: 1,
    showPurchase: false,
    showShare: false,
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
    imgList: [],
    checkIdList: [],
    // 是否onLoad执行中，用于避免在 onShow 中重复执行onLoad中的请求
    isOnLoad: false,
    empId: '',
    chooseSpec: '',
    chooseNum: '',
    purchaseType: 'buy',
    showCoupon: false,
    ids: [],
    couponList: [],
    showCouponPopup: false,
    promotions: {},
    showPromotionsPopup: false,
    type: 2,
    productCode: '',
    goodsStatus: '',
    activeId: '',
    activeType: '',
    activePrice: '',
    recordId: '', // 参团需要这个id
    groupDetail: { list: [] },
    commentDetail: { dataList: [] },
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    list: [],
    isShowAllGroup: false, // 全部拼团
    isAuth: true, // 假设默认已经授权了头像和昵称
    cartNum: 0,
    timerObj: {
      timer1: null, // 秒杀未开始
      timer2: null // 秒杀进行中
    },
    seckillDetail: {
      list: []
    }, // 秒杀信息
    seckillSecondsFormat: {},
    seckillSecondsFormat2: {}
  },

  /*
  type 1商品库id 2门店id 3商品编码
  */
  onLoad ({ id = '', empid = '', userid = '', scene = '', type = 2, productCode = '', activeId = '',
    activeType = '', taskRuleId = '', reffer = '', storeCode = '', storeId = '' }) {
    scene = business.sceneParse(scene)
    wx.hideShareMenu()
    console.log('商详页onLoad id', id)
    console.log('商详页onLoad scene', scene)
    if (Object.keys(scene).length) {
      id = scene.id || id
      type = scene.type || type
      empid = scene.empid || empid
      userid = scene.userid || userid
      activeId = scene.activeId || activeId
      activeType = scene.activeType || activeType
      taskRuleId = scene.taskRuleId || taskRuleId
      reffer = scene.reffer || reffer
      storeCode = scene.storeCode || storeCode
      storeId = scene.storeId || storeId
    }
    if ((+type !== 3 && !id) || (+type === 3 && !productCode)) {
      wx.navigateBack()
      return
    }
    this.setData({
      ids: [Number(id)],
      type: Number(type),
      productCode,
      userType: wx.getStorageSync('userType'),
      activeId,
      activeType,
      reffer
    })

    // 解决消费者转发直播无法带导购及门店信息，可能会导致门店不一致时商品查不到
    // 直播商品需带&reffer=live以标记是来自直播商品跳转
    // 当之前导购分享的直播所传storeId或storeCode与商品上带的不同时，重新登录
    const localEmpid = app.globalData.empid
    const localStoreCode = wx.getStorageSync('storeCode')
    const localStoreId = wx.getStorageSync('storeId')
    const navigatorOpenType = 'redirectTo'
    if (reffer === 'live' &&
      !localEmpid &&
      ((storeCode && storeCode !== localStoreCode) ||
        (storeId && storeId !== localStoreId))) {
      app.login({ storeCode, storeId, empid, navigatorOpenType })
      return
    }

    this.setData({ isOnLoad: true, empId: wx.getStorageSync('empidCommission') })
    // 没有打login接口。且是员工端，且是拼团。则重定向到group-product-staff页。
    if (!app.data.isLogin && this.data.userType === 'staff' && activeType === 'group') { // 员工点了别的员工分享的页面(一定会打login，打login会切换身份和门店以及重定向页面)，应该跳消费者首页，此处如果不处理，会跳到员工端首页。
      wx.redirectTo({ url: `/pages/group-product-staff/group-product-staff?activeId=${activeId}&activeType=group` })
      return
    }

    if (taskRuleId) {
      ApiTask.taskforwardSave({
        data: {
          empId: wx.getStorageSync('empidCommission'),
          itemId: id,
          ruleId: taskRuleId,
          type: 2 // 类型 1转发 2进入
        }
      })
    }

    if (empid) {
      // 检测转发人是否是分销商(分销商转发带的也是empid)
      ApiSeller.isDistributor({
        data: { duserId: empid },
        success: (res) => {
          let parentIsSeller = res.data.distributor
          if (wx.getStorageSync('userType') === 'staff') parentIsSeller = false
          wx.setStorageSync('parentIsSeller', parentIsSeller)
          if (parentIsSeller) {
            ApiSeller.shopInfo({
              data: { duserId: empid },
              success: (res) => {
                wx.setStorageSync('storeName', res.data.shopName)
              }
            })
          }
        }
      })
    }
    // 检测当前用户是否是分销商
    const loginId = wx.getStorageSync('loginId')
    ApiSeller.isDistributorHandleStoreId({
      data: { duserId: loginId },
      success: (res) => {
        const isSeller = res.data.distributor
        wx.setStorageSync('isSeller', isSeller)
        if (isSeller) {
          wx.setStorageSync('empid', loginId)
          wx.setStorageSync('empidCommission', loginId)
        }
        this.setData({ isSeller })
      }
    })
    ApiUser.getuser({
      success: (res) => {
        // 如果接口里没有头像或没有昵称，则检测有无授权头像(默认按照已经授权了头像进行处理)
        if (!res.data.headUrl || !res.data.nickName) {
          this.fnIsAuth()
        }
      }
    })
    ApiCoupon.couponPopup({
      params: {
        ids: this.data.ids,
        type: this.data.type,
        productCode
      },
      success: res => {
        this.setData({
          couponList: res.data,
          showCoupon: res.data.length
        })
      }
    })
    // ApiProduct.discount({
    //   params: {
    //     productId: id,
    //     type: this.data.type,
    //     productCode
    //   },
    //   success: ({ data }) => {
    //     this.setData({ promotions: data || [] }) // [{ activityName: '满减满减', activityRules: '满减满减满减满减满减满减满减满减满减满减满减满减满减满减满减满减' }, { activityName: '满减满减', activityRules: '满减满减满减满减满减满减满减满减满减满减满减满减满减满减满减' }]
    //   }
    // })
    ApiProduct.discountProductRules({
      params: {
        productId: id,
        type: this.data.type,
        productCode
      },
      success: ({ data }) => {
        this.setData({ promotions: data || [] })
      }
    })
    // wx.showLoading()
    ApiProduct.getDetails({
      params: { id, type: this.data.type, productCode: this.data.productCode },
      success: ({ data }) => {
        if (data.id && activeType === '' && (userid || empid)) {
          // 分享进来统计
          ApiProduct.shareIn({
            data: {
              empId: empid,
              forwarderId: userid,
              productId: data.id
            }
          })
        }
        ApiComment.listGoods({
          data: {
            pageNum: 1,
            pageSize: 3,
            productId: data.parentId, // 此处给的是商品库id
            type: ''
          },
          success: ({ data }) => {
            this.setData({ commentDetail: data })
          }
        })
        // wx.hideLoading()
        let goodsStatus = ''
        if (data.status === 0) {
          goodsStatus = String(data.status)
          wx.showToast({ title: '该商品已下架', icon: 'none' })
          // setTimeout(() => this.goTo(), 2000)
        }

        data.detailImages = (data.showImages || '').split(',')
        const { int, dec } = priceCtrl.currency(data.price)
        data.priceInteger = int
        data.priceDecimal = dec
        data.materialList = data.materialMainList
        data.materialnotMainList = data.materialnotMainList.map((item) => {
          if (item.type > 1) {
            item.imgUrl = `${item.imgUrl}${VIDEO_IMG_SUFFIX}`
          }
          return item
        })
        this.setData({ product: data, goodsStatus })
        const seckillData = data.seckillData
        if (activeType !== 'seckill' && seckillData) { // 普通商品进入后发现是秒杀商品。
          this.setData({ activeType: 'seckill', activeId: seckillData.id })
          this.fnSeckillOpt(seckillData)
        }
      },
      fail: () => {
        // this.goTo()
      }
    })
    this.getAddressList(true, () => this.setData({ isOnLoad: false }))
    // 拼团详情和拼团列表，是拼团才调用。
    if (activeType === 'group') {
      ApiGroup.forward({
        data: {
          empId: empid,
          groupId: activeId,
          forwarderId: this.options.userid,
          type: 2 // 类型 1转发 2浏览
        }
      })
      this.fnGroupDetail()
      this.lookAllJlOrGroup()
    }
    // 秒杀
    if (activeType === 'seckill') {
      this.fnSeckillDetail(activeId)
      business.tjPreview({ ApiUser, options: this.options, id: this.data.activeId, kind: 6, pageThis: this })
    }
    this.getCartCount()
  },
  onShow () {
    if (!this.data.isOnLoad) this.getAddressList(false)
  },

  bindgetuserinfo (e) {
    wx.getUserInfo({
      success: (res) => {
        this.setData({ isAuth: true })
        ApiUser.edit({
          data: { headUrl: res.userInfo.avatarUrl, nickName: res.userInfo.nickName },
          success: () => {
            this.submit(e) // 优化之获取完用户信息后弹窗
            wx.setStorageSync('nickName', res.userInfo.nickName)
            wx.setStorageSync('headUrl', res.userInfo.avatarUrl)
          }
        })
      }
    })
  },

  fnIsAuth () {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: () => {
              this.setData({ isAuth: true })
            }
          })
        } else {
          this.setData({ isAuth: false })
        }
      }
    })
  },
  // copy (e) {
  //   wx.setClipboardData({
  //     data: e.currentTarget.dataset.text,
  //     success: function () {
  //       wx.getClipboardData({
  //         success: function () {
  //           wx.showToast({
  //             title: '复制成功'
  //           })
  //         }
  //       })
  //     }
  //   })
  // },

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
          const data = {
            currentAddress: defaultAddress || '',
            currentAddressId: (defaultAddress && defaultAddress.id) || ''
          }
          this.setData(data)
          this.storeAddress(data)
        }
      }
    })
  },
  goodsPurchaseSelected ({ detail }) {
    this.setData({ showPurchase: false })
    if (detail.buyType === 'cart') { // 加入购物车
      if (this.data.joinCart) return
      this.data.joinCart = true
      ApiCart.add({
        data: {
          number: detail.quantity,
          specId: detail.spec.id
        },
        success: (res) => {
          wx.showToast({ title: res.message, icon: 'none' })
          this.getCartCount()
        },
        complete: () => {
          delete this.data.joinCart
        }
      })
      return
    }

    // 加入购物车 cart
    // 立即购买 buy
    // 单独购买 groupAloneBuy
    // 开团 groupOpenBuy
    // 参团 groupJoinBuy
    // wx.setStorageSync('to-order-confirm-active-data', {
    //   buyType: detail.buyType,
    //   activeId: detail.activeId,
    //   activeType: detail.activeType,
    //   recordId: detail.recordId // 参团需要这个id
    // })
    // wx.setStorageSync('to-order-confirm', [{
    //   productId: detail.spec.productId,
    //   specId: detail.spec.id,
    //   productNum: detail.quantity
    // }])

    wx.navigateTo({ url: '../order-confirm/order-confirm' })
  },
  goodsPurchaseClose ({ detail }) {
    this.setData({
      chooseNum: (detail.quantity || 1),
      chooseSpec: (detail.spec || '')
    })
  },
  storeAddress (data) {
    wx.setStorage({
      key: 'to-order-confirm-address',
      data
    })
  },
  submit ({ currentTarget }) {
    this.setData({
      showPurchase: true,
      purchaseType: currentTarget.dataset.type,
      recordId: currentTarget.dataset.recordId || ''
    })
  },
  onSwiperChange ({ detail: { current } }) {
    this.setData({
      // current,
      currentNum: ++current
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
          console.log(item)
          // 选中的微信地址存在于地址列表中
          if (keys.every(key => item[key] === address[key])) {
            const data = {
              currentAddress: item,
              currentAddressId: item.id
            }
            this.setData(data)
            this.storeAddress(data)
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

    this.storeAddress({
      currentAddressId: id,
      currentAddress
    })
  },
  toEditAddress (e) {
    const id = +e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/address-add/address-add?id=${id}` })
  },

  onShareAppMessage () {
    const activeId = this.data.activeId
    const activeType = this.data.activeType
    const { materialList } = this.data.product
    this.setData({
      imgList: materialList.map(i => i.imgUrl),
      checkIdList: materialList.map(i => i.id)
    })
    const product = this.data.product
    ApiProduct.transmit({
      data: {
        id: product.id,
        mids: this.data.checkIdList
      }
    })

    const empId = wx.getStorageSync('empidCommission')
    ApiUser.transferAdd({
      data: {
        productId: product.id,
        productCode: product.productCode || '',
        price: product.price || 0,
        addPrice: 0,
        empId
      }
    })

    const userid = wx.getStorageSync('userid')
    if (activeType === 'group') {
      ApiGroup.forward({
        data: {
          empId,
          groupId: activeId,
          type: 1 // 类型 1转发 2浏览
        }
      })
    }
    if (activeType === 'seckill') {
      this.shareForward()
    }
    // product.id一定是门店商品id，所以即使type为1进来，这里带出去的也是门店商品id，再进来时type应为默认值2。所以不用担心。type为1表示使用商品库的id到门店的商品表里查询。商品一定是属于门店的。所以转发时不用带type。
    const path = `/pages/product/product?id=${product.id}${userid ? `&userid=${userid}` : ''}${empId ? `&empid=${empId}` : ''}${activeId ? `&activeId=${activeId}` : ''}${activeType ? `&activeType=${activeType}` : ''}&storeId=${wx.getStorageSync('storeId')}`
    console.log('分享路径', path)
    return {
      path,
      title: product.name || '',
      imageUrl: this.data.imgList[0]
    }
  },
  previewImage ({ currentTarget }) {
    const index = currentTarget.dataset.index
    const imgUrls = this.data.product.materialMainList.map((item) => {
      return item.imgUrl
    })
    wx.previewImage({ current: imgUrls[index], urls: imgUrls })
  },
  previewImage2 ({ currentTarget: { dataset: { index, images } } }) {
    wx.previewImage({ current: index, urls: images })
  },
  getCoupons () {
    this.setData({ showCouponPopup: true })
  },
  onShare () {
    const { materialList } = this.data.product
    this.setData({
      imgList: materialList.map(i => i.imgUrl),
      checkIdList: materialList.map(i => i.id),
      showShare: true
    })
  },
  showPromotions () {
    this.setData({ showPromotionsPopup: true })
  },
  onUnload () {
    this.clearInterval()
  },
  clearInterval () {
    Object.keys(this.data.timerObj).forEach(item => {
      clearInterval(this.data.timerObj[item])
    })
    this.data.list.forEach(v => {
      clearInterval(v._timer)
    })
  },
  resetPaginationAndList () {
    this.clearInterval()
    let { result } = this.data
    this.setData({
      list: [],
      result: {
        totalPage: 10,
        totalCount: 300,
        pageNum: 1,
        pageSize: result.pageSize
      }
    })
  },
  hideAllGroup () {
    this.setData({ isShowAllGroup: false })
  },
  showAllGroup () {
    wx.showLoading({
      title: '数据加载中...'
    })
    this.resetPaginationAndList()
    this.lookAllJlOrGroup(() => {
      wx.hideLoading()
      this.setData({ isShowAllGroup: true })
    })
  },
  fnGroupDetail () {
    ApiGroup.groupDetails({
      data: {
        groupId: this.data.activeId
      },
      success: (res) => {
        const groupDetail = res.data
        const list = groupDetail.list
        list.forEach((item, index) => {
          timeCountDown({
            seconds: item.countDown,
            callback: {
              run: (json) => {
                item.remainingSecondsFormat = json
                this.setData({ groupDetail })
              },
              over: () => {
                list.splice(index, 1)
                this.setData({ groupDetail })
              }
            }
          })
        })
        this.setData({ groupDetail, activePrice: groupDetail.activePrice })
      }
    })
  },
  lookAllJlOrGroup (cb) {
    let { list, activeId, result } = this.data
    let { pageNum } = result
    ApiGroup.recordList({
      data: {
        groupId: activeId,
        pageNum
      },
      success: (data) => {
        console.log('全部接龙数据：', data)
        list = list.concat(data.data.dataList)
        list.forEach((item, index) => {
          timeCountDown({
            seconds: item.countDown,
            callback: {
              run: (json) => {
                item.remainingSecondsFormat = json
                this.setData({ list })
              },
              over: () => {
                list.splice(index, 1)
                this.setData({ list })
              }
            }
          })
          item._timer = timeCountDown.timer
        })
        this.setData({ list })
        this.setPagination(data.data)
        cb && cb()
      }
    })
  },
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
  bindScrollToLowerGroup () {
    console.log('滚动到底了')
    let {
      result
    } = this.data
    this.setCurPageIncrement()
    if (result.pageNum > result.totalPage) {
      return
    }
    this.lookAllJlOrGroup()
  },
  getCartCount () {
    ApiCart.count({
      success: ({ data }) => this.setData({ cartNum: data })
    })
  },
  fnSeckillOpt (seckillData) {
    if (seckillData.countDown && seckillData.status === 3) {
      timeCountDown({
        seconds: seckillData.countDown,
        callback: {
          run: (json) => {
            this.data.seckillSecondsFormat = json
            this.setData({ seckillSecondsFormat: this.data.seckillSecondsFormat })
          },
          over: () => {
            seckillData.status = 4
            this.setData({ seckillDetail: seckillData })
          }
        }
      })
      this.data.timerObj.timer1 = timeCountDown.timer
    } else if (seckillData.countDown24h && seckillData.status === 2) {
      timeCountDown({
        seconds: seckillData.countDown24h,
        callback: {
          run: (json) => {
            this.data.seckillSecondsFormat2 = json
            this.setData({ seckillSecondsFormat2: this.data.seckillSecondsFormat2 })
          },
          over: () => {
            seckillData.status = 4
            this.setData({ seckillDetail: seckillData })
          }
        }
      })
      this.data.timerObj.timer2 = timeCountDown.timer
    }
    const { int, dec } = priceCtrl.currency(seckillData.activePrice)
    seckillData.activePriceInteger = int
    seckillData.activePriceDecimal = dec
    this.setData({ seckillDetail: seckillData, activePrice: seckillData.activePrice })
  },
  // 秒杀详情
  fnSeckillDetail (id) {
    ApiSeckill.seckillDetail({
      data: {
        seckillId: id
      },
      success: (res) => {
        this.fnSeckillOpt(res.data)
      }
    })
  },
  saved () {
    console.log('saved')
    this.shareForward()
  },
  shareForward () {
    if (this.data.activeType === 'seckill') {
      business.tjForward({ ApiUser, id: this.data.activeId, kind: 6 })
    }
  }
})
