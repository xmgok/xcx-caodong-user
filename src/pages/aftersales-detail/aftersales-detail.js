import ApiOrderCancel from '../../api/order-cancel'
import ApiAddress from '../../api/address'
import { AFTERSALES_REASON_LIST, AFTERSALES_CHECK_STATUS } from '../../utils/consts'

Page({
  data: {
    showLogisticsPicker: false,
    logisticsList: [],
    logisticsSelected: '',
    expressCode: '',
    id: ''
  },

  onLoad ({ id }) {
    this.setData({ id })
    this.getDetail()

    ApiAddress.express({
      success: ({ data }) => {
        let logisticsList = Object.keys(data).map(v => {
          return { label: data[v], value: Number(v) }
        })
        this.setData({ logisticsList })
      }
    })
  },

  // 获取售后详情
  getDetail () {
    // console.log(this.data.id)
    wx.showLoading()
    ApiOrderCancel.returnDetail({
      params: { id: this.data.id },
      success: ({ data }) => {
        data._returnAddress = data.returnAddress ? data.returnAddress.split(',') : []
        this.setData({
          ...data,
          // _returnStatus: returnStatusMap[data.returnStatus],
          _checkStatus: AFTERSALES_CHECK_STATUS[data.checkStatus],
          _reason: AFTERSALES_REASON_LIST.find(v => v.value === data.reason).label,
          _evidencePic: data.evidencePic ? data.evidencePic.split(',') : []
        })
        wx.hideLoading()
      }
    })
  },
  // 撤销申请
  cancel () {
    wx.showModal({
      content: '确定要撤销申请吗？',
      success: ({ confirm }) => {
        if (!confirm) return
        ApiOrderCancel.cancel({
          params: { id: this.data.id },
          success: ({ data }) => {
            wx.showToast({ title: '操作成功', icon: 'success', duration: 2000 })
            this.getDetail()
          }
        })
      }
    })
  },
  // 输入框更新
  bindInput ({ detail: { value }, currentTarget: { dataset: { name, hanzi } } }) {
    if (hanzi === 'false') {
      value = value.replace(/[\u4e00-\u9fa5]+/g, '')
      this.setData({ [name]: value })
      return
    }
    this.setData({ [name]: value })
  },
  // 填写了寄回物流信息
  userCheck () {
    const data = { returnId: this.data.id, expressCode: this.data.expressCode }
    if (this.data.logisticsSelected) {
      // data.expressId = this.data.logisticsList.find(i => this.data.logisticsSelected).value
      data.expressId = this.data.logisticsSelected.value
    }
    if (data.expressId < 0) {
      wx.showToast({ title: '请选择物流公司', icon: 'none' })
      return
    }
    if (!data.expressCode) {
      wx.showToast({ title: '请填写物流单号', icon: 'none' })
      return
    }
    wx.showLoading()
    ApiOrderCancel.userCheck({
      data,
      success: (res) => {
        wx.hideLoading()
        wx.showToast({
          title: '操作成功',
          icon: 'success',
          success: () => setTimeout(() => this.getDetail(), 2000)
        })
      }
    })
  },
  openLogisticsPicker () {
    this.setData({ showLogisticsPicker: true })
  },
  onLogisticsSubmit ({ detail: { value } }) {
    this.setData({ logisticsSelected: value })
  }
})
