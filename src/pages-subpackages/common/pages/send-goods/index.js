import ApiAddress from '../../../../api/address'

import business from '../../../../utils/business'
const priceCtrl = require('../../../../utils/price')
const ApiOrder = require('../../../../api/order')

function getDefaultData (options, self) {
  const obj = { // 默认值
    showLogisticsPicker: false,
    resData: {},
    dataList: [],
    isSelectedAll: true,
    giftNum: 0,
    form: {
      isComplete: 0, // 是否完成发货
      specCodeList: [],
      companyValue: '', // 物流公司名称
      companyId: '', // 物流公司Id
      expressCode: '', // 物流单号
      orderCode: '', // 订单编号
      receiverName: '' // 收货人
    }
  }
  if (options) { // 根据options重置默认值
    // obj.tabIndex = options.type || obj.tabIndex // 如果有tab切换
    obj.options = { ...options, ...business.sceneParse(options.scene) }
    if (self) self.options = obj.options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options, this))
    this.getList()
    this.getList2()
    this.getDetail()
  },

  getDetail () {
    ApiOrder.info({
      data: {
        orderCode: this.data.options.id
      },
      success: ({ data }) => {
        this.setData({ resData: data })
      }
    })
  },
  getList () {
    ApiAddress.express({
      success: ({ data }) => {
        let logisticsList = Object.keys(data).map(v => {
          return {
            label: data[v],
            value: Number(v)
          }
        })
        this.setData({
          logisticsList
        })
      }
    })
  },
  formatPrice (list) {
    return list.map(item => {
      // 价格格式化
      const { int, dec } = priceCtrl.currency(item.price)
      item.sellPriceInteger = int
      item.sellPriceDecimal = dec
      item.checked = true
      item.productNum = item.operationalNumber
      return item
    })
  },
  getList2 () {
    ApiOrder.deliverPageInfo({
      data: {
        orderCode: this.data.options.id
      },
      success: ({ data }) => {
        this.setData({ dataList: this.formatPrice(data.productList) })
        this.getNum()
      }
    })
  },

  // 选中
  doCheck ({ currentTarget }) {
    const dataset = currentTarget.dataset
    const dataList = this.data.dataList
    dataList[dataset.index].checked = dataList[dataset.index].checked ? 0 : 1
    this.getNum()
    this.setData({ dataList })
  },
  getNum () {
    const arr = this.data.dataList.filter(v => v.checked && v.operationalNumber)
    let num = 0
    if (arr.length) {
      num = arr.reduce((v1, v2) => ({ productNum: v1.productNum + v2.productNum })).productNum
    }
    this.setData({ giftNum: num })
  },
  selectedAll () {
    let { dataList, isSelectedAll } = this.data
    isSelectedAll = !isSelectedAll
    dataList.forEach(v => {
      v.checked = isSelectedAll
    })
    this.getNum()
    this.setData({ dataList, isSelectedAll })
  },
  getSaveData () { // 保存之前对数据进行处理，处理成后端要的格式。
    let isPass = true
    const filter = this.data.dataList.filter(v => v.checked && v.operationalNumber)
    if (!filter.length) isPass = false
    const productList = filter.map(v => {
      return {
        ...v,
        count: v.productNum,
        productNum: v.productNum,
        specId: v.specId
      }
    })
    return {
      isPass,
      productList
    }
  },
  sure () {
    const { productList, isPass } = this.getSaveData()
    if (!isPass) {
      wx.showToast({ title: `请选择商品`, icon: 'none', duration: 3000 })
      return
    }
    const { options, resData } = this.data

    const specCodeList = productList
    const form = this.data.form
    if (!form.expressCode) {
      wx.showToast({ title: `请扫描或输入快递单号`, icon: 'none', duration: 3000 })
      return
    }
    if (!form.companyId) {
      wx.showToast({ title: `请选择物流公司`, icon: 'none', duration: 3000 })
      return
    }
    form.orderCode = options.id
    form.receiverName = resData.receiverName
    form.specCodeList = specCodeList
    let num = 0
    productList.forEach(v => {
      num += v.operationalNumber
    })
    form.isComplete = num === 0 ? 1 : 0
    ApiOrder.deliverApp({
      data: { ...form },
      success: (res) => {
        wx.showToast({ title: res.message, icon: 'none', duration: 3000 })
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 1000)
      }
    })
  },
  bindInput (e) {
    this.setData({
      'form.expressCode': e.detail.value
    })
  },
  onQuantityChange (e) {
    console.log(e)
    const dataset = e.currentTarget.dataset
    const dataList = this.data.dataList
    dataList[dataset.index].productNum = e.detail
    this.setData({ dataList })
    this.getNum()
  },
  scanCode () {
    wx.scanCode({ // 允许从相机和相册扫码
      success: (res) => {
        if (res.errMsg === 'scanCode:ok') {
          this.setData({ 'form.expressCode': res.result })
          ApiOrder.getExpressInfo({
            data: {
              expNo: res.result
            },
            success: (res) => {
              this.setData({
                'form.companyValue': res.data.name,
                'form.companyId': res.data.id
              })
            }
          })
        }
      }
    })
  },
  // 物流公司
  showLogistics () {
    this.setData({
      showLogisticsPicker: true
    })
  },
  onLogisticsSubmit (e) {
    console.log(e)
    this.setData({
      'form.companyValue': e.detail.value.label,
      'form.companyId': e.detail.value.value
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  }
})
