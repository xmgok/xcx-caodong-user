import ApiProduct from '../../api/product'
import ApiCart from '../../api/cart'
import ApiVideo from '../../api/video'

const priceCtrl = require('../../utils/price')

/* 购物车赠品列表DTO
discountName (string, optional): 活动显示名称 ,
giftIds (Array[integer], optional): 可领赠品ID列表 ,
giftLimitAmount (number, optional): 限领金额 ,
giftLimitNum (integer, optional): 限领数量 ,
giftLimitType (integer, optional): 领取规则 1件 2元 ,
giftList (Array[购物车商品信息DTO], optional): 已领赠品列表 ,
groupId (integer, optional): 分组ID ,
showTag (string, optional): 显示折扣类型
*/

/* 购物车商品信息DTO
addPrice (number, optional): 加入时价格 ,
checked (integer, optional): 选中标示 0未选中 1选中 ,
createTime (string, optional): 创建时间 ,
discountId (integer, optional): 单商品优惠活动ID ,
discountName (string, optional): 单商品优惠活动名称 ,
discountText (string, optional): 商品折扣内容 ,
expressFree (integer, optional): 是否包邮 0：否 1：是 ,
giftGroup (integer, optional): 赠品满减活动id ,
id (integer, optional): ID ,
imgUrl (string, optional): 商品图片 ,
inventory (integer, optional): 库存 ,
isGift (integer, optional): 赠品 0否 1是 ,
number (integer, optional): 商品数量 ,
parentId (integer, optional): 商品库商品id ,
prePrice (number, optional): 市场价 ,
price (number, optional): 折后价 ,
productCode (string, optional): 商品名称 ,
productId (integer, optional): 商品id ,
productName (string, optional): 商品名称 ,
sellPrice (number, optional): 售卖价 ,
specCode (string, optional): 规格编号 ,
specContent (string, optional): 规格内容 ,
specId (integer, optional): 规格id ,
status (integer, optional): 商品状态(1 可售 0下架) ,
volume (number, optional): 体积 ,
weight (number, optional): 重量
*/

function getDefaultData (options) {
  const obj = { // 默认值
    iPhoneX: wx.getStorageSync('iPhoneX'),
    quantity: 1,
    currentIndex: null,
    // 赠品数据
    giftData: wx.getStorageSync('giftData') || {},
    // giftData: {
    //   giftIds: [],
    //   giftLimitAmount: 100,
    //   giftLimitNum: 2,
    //   giftLimitType: 2, // 领取规则 1件 2元 ,
    //   giftList: [],
    //   groupId: 10
    // },
    giftNum: 0, // 已选几件
    giftAmount: 0, // 已选金额
    dataList: [], // 赠品列表
    options: {},
    showPurchase: false, // 商品选择规格的弹窗
    productId: null, // 哪个商品的选择规格弹窗
    isPass: true, // 是否通过了验证
    isAll: 1 // 是否查询赠品
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getList()
  },

  getList () {
    const giftData = this.data.giftData
    ApiProduct.discountGiftList({
      data: {
        // isAll: 1,
        discountId: giftData.groupId,
        productIdList: giftData.giftIds,
        pageNum: 1,
        pageSize: 20
      },
      success: ({ data }) => {
        let dataList = data.dataList
        dataList = dataList.map(item1 => {
          item1.number = 1
          if (giftData.giftList.length) {
            giftData.giftList.forEach(item2 => {
              if (+item1.id === +item2.productId) {
                delete item2.id
                item2.checked = 1
                item1 = {
                  ...item1,
                  ...item2
                }
                console.log(item1)
              }
            })
          } else {
            item1.checked = 0
          }
          return item1
        })
        dataList = this.formatPrice(dataList)
        this.data.dataList = dataList
        const giftNum = this.getNum()
        const giftAmount = this.getMoney()
        this.setData({ giftAmount, giftNum, dataList })
        // this.validatePass()
      }
    })
  },
  getSaveData () { // 保存之前对数据进行处理，处理成后端要的格式。
    /*
    {
      'groupId': 0,
      'list': [
        {
          'number': 0,
          'specId': 0
        }
      ]
    }
    */
    return {
      groupId: this.data.giftData.groupId,
      list: this.data.dataList.filter(v => v.checked).map(v => {
        return {
          number: v.number,
          specId: v.specId
        }
      })
    }
  },
  formatPrice (list) {
    return list.map(item => {
      // 价格格式化
      const { int, dec } = priceCtrl.currency(item.sellPrice)
      item.sellPriceInteger = int
      item.sellPriceDecimal = dec
      return item
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  doCheck ({ currentTarget }) {
    const dataset = currentTarget.dataset
    const dataList = this.data.dataList
    console.log('dataList[dataset.index]', dataList[dataset.index])
    if (!dataList[dataset.index].isChoose) {
      return
    }
    dataList[dataset.index].checked = dataList[dataset.index].checked ? 0 : 1
    const giftNum = this.getNum()
    const giftAmount = this.getMoney()
    this.setData({ giftAmount, giftNum, dataList })
    // this.validatePass()
  },

  goodsPurchaseClose () {
    // wx.showTabBar()
  },

  goodsPurchaseSelected (e) {
    const detail = e.detail
    console.log('goodsPurchaseSelected e.detail', detail)
    let dataList = this.data.dataList
    dataList[this.data.currentIndex].specId = detail.spec.id
    dataList[this.data.currentIndex].specContent = detail.spec.specContent
    dataList[this.data.currentIndex].number = detail.quantity
    dataList[this.data.currentIndex].sellPrice = detail.data.sellPrice
    const giftNum = this.getNum()
    const giftAmount = this.getMoney()
    dataList = this.formatPrice(dataList)
    this.setData({ giftAmount, giftNum, dataList, showPurchase: false })
    // this.validatePass()
  },

  changeSpec ({ currentTarget: { dataset } }) {
    this.setData({ productId: '' })
    // wx.hideTabBar()
    this.setData({
      productId: dataset.id,
      showPurchase: true,
      currentIndex: dataset.index,
      quantity: dataset.number,
      specContent: dataset.specContent || ''
    })
  },

  getNum () {
    const arr = this.data.dataList.filter(v => v.checked)
    let num = 0
    if (arr.length) {
      num = arr.reduce((v1, v2) => ({ number: v1.number + v2.number })).number
    }
    return num
  },

  getMoney () {
    const arr = this.data.dataList.filter(v => v.checked).map(v => v.number * v.sellPrice)
    let num = 0
    if (arr.length) {
      num = arr.reduce((v1, v2) => v1 + v2)
    }
    return priceCtrl.keep2Decimal(num)
  },

  validatePass () {
    const giftData = this.data.giftData
    const num = this.getNum()
    let isPass = false
    if (num > 0 && this.getCheckedNum() === num) { // 商品被选中且规格被选中
      if (+giftData.giftLimitType === 1) { // 件
        isPass = +num <= +giftData.giftLimitNum
      }
      if (+giftData.giftLimitType === 2) { // 元
        isPass = +this.getMoney() <= +giftData.giftLimitAmount
      }
    }
    this.setData({ isPass })
  },

  getCheckedNum () {
    let num = 0
    const arr = this.getSaveData().list.filter(v => v.specId) // 从被选中的商品中提取出规格被选中的商品
    if (arr.length) {
      num = arr.reduce((v1, v2) => ({ number: v1.number + v2.number })).number
    }
    return num
  },

  sure () {
    if (!this.data.isPass) return
    // const num = this.getNum()
    // if (num <= 0) {
    //   wx.showToast({ title: `请选择赠品`, icon: 'none', duration: 3000 })
    //   return
    // }
    wx.showLoading({ title: '领取中...' })
    const saveData = this.getSaveData()

    let saveGift = ApiCart.saveGift
    const { watchId, from } = this.data.options
    // 视频购物
    if (watchId) {
      saveData.watchId = watchId
      saveGift = ApiVideo.cartGiftSave
    }

    // 来自下单页
    if (from === 'order-confirm') {
      saveGift = ApiVideo.cartGiftSave
    }

    saveGift({
      data: saveData,
      success: () => {
        wx.hideLoading()

        if (watchId) {
          wx.navigateTo({ url: `/pages/cart-video/cart-video?watchId=${watchId}` })
          return
        }
        if (from === 'order-confirm' || from === 'gift-goods') {
          wx.navigateBack({ delta: 1 })
          return
        }
        wx.switchTab({ url: '/pages/cart/cart' })
      }
    })
  }
})
