import ApiOrderCancel from '../../api/order-cancel'
import { REFUND_TYPE_LIST, REFUND_REASON_LIST, RETURN_REASON_LIST } from '../../utils/consts'

const ApiOrder = require('../../api/order')
const ApiCommon = require('../../api/common')
const app = getApp()

Page({
  data: {
    isShowTextarea: true,
    resData: {},
    // 显示原因选择框
    showReasonPicker: false,
    // 售后类型
    showTypePicker: false,
    // 退款原因
    refundReasonList: REFUND_REASON_LIST,
    // 退货退款原因
    returnReasonList: RETURN_REASON_LIST,
    // 售后原因
    reasonList: [],
    // 售后类型
    typeList: REFUND_TYPE_LIST,
    // 图片列表
    imgList: [],
    // 最多上传图片限制
    uploadLimit: 3,
    // 订单编号
    orderCode: '',
    // 规格id
    specId: '',
    // 售后类型
    type: 1,
    // 申请售后数量
    applyNumber: 1,
    number: 1,
    // 退款原因
    reasonSelect: '',
    // 退款金额
    amount: '',
    amountValue: '',
    // 退款说明
    explain: '',
    formId: '',
    // 防重复提交
    clicking: false
  },

  /**
   * @param orderCode 订单编号
   * @param expressStatus 发货状态（0: 未发货；1: 已发货），用于新增售后申请时判断 type
   * @param amount 退款金额
   * @param type 退款类型（1 仅退款，2 退货退款）
   */
  onLoad ({ orderCode, specId, number, expressStatus, type = 1, id = '' }) {
    type = ({ 0: 1, 1: 2 })[expressStatus] || +type
    this.setData({
      id,
      orderCode,
      type,
      number: Number(number),
      applyNumber: Number(number),
      specId,
      reasonList: type === 1 ? this.data.refundReasonList : this.data.returnReasonList
    })
    this.getPrice(Number(number))
    this.getDetails()
  },

  getDetails () {
    if (!this.data.id) return
    ApiOrderCancel.returnDetail({
      params: { id: this.data.id },
      success: ({ data }) => {
        this.setData({
          reasonSelect: {
            label: this.data.type === 1 ? this.data.refundReasonList.find(v => v.value === data.reason).label : this.data.returnReasonList.find(v => v.value === data.reason).label,
            value: data.reason
          },
          number: data.number,
          explain: data.explain,
          imgList: data.evidencePic ? data.evidencePic.split(',') : []
        })
      }
    })
  },
  openReasonPicker () {
    this.setData({ showReasonPicker: true, isShowTextarea: false })
  },
  openTypePicker () {
    this.setData({ showTypePicker: true, isShowTextarea: false })
  },
  close () {
    this.setData({ isShowTextarea: true })
  },
  onReasonSubmit ({ detail: { value } }) {
    this.setData({ reasonSelect: value })
  },
  onTypeSubmit ({ detail: { value } }) {
    if (value.value === this.data.type) return
    this.setData({
      type: value.value,
      reasonSelect: {},
      reasonList: value.value === 1 ? this.data.refundReasonList : this.data.returnReasonList
    })
  },
  // 上传图片
  uploadImage () {
    const limitMsg = () => wx.showToast({ title: '最多只能上传3张描述图片', icon: 'none' })

    if (this.data.imgList.length >= this.data.uploadLimit) {
      limitMsg()
      return
    }

    wx.chooseImage({
      count: this.data.uploadLimit - this.data.imgList.length,
      success: ({ tempFilePaths }) => {
        if (tempFilePaths.length + this.data.imgList.length > this.data.uploadLimit) {
          limitMsg()
          return
        }
        wx.showLoading({ title: '上传中' })
        tempFilePaths.forEach((path, index) => {
          app.upload(path, (res) => {
            this.setData({ imgList: [...this.data.imgList, res.imageURL] })
            if (index === tempFilePaths.length - 1) wx.hideLoading()
          })
        })
      }
    })
  },
  // 移除图片
  removeImage ({ currentTarget: { dataset: { index } } }) {
    const list = this.data.imgList
    list.splice(index, 1)
    this.setData({ imgList: list })
  },
  // 输入框更新
  bindInput ({ detail: { value }, currentTarget: { dataset: { name } } }) {
    this.setData({ [name]: value })
  },
  numberChange ({ detail }) {
    this.getPrice(detail)
  },
  getPrice (detail) {
    ApiOrder.customPrice({
      data: {
        applyNumber: detail,
        orderCode: this.data.orderCode,
        specId: this.data.specId
      },
      success: res => {
        this.setData({
          applyNumber: detail,
          resData: res.data,
          amount: res.data.returnAmount
        })
      }
    })
  },
  changeMoney ({ detail: { value } }) {
    const mark = '￥ '
    if (value.length <= 2) {
      value = mark
    }
    let amountValue = value
    let amount = value.split(mark)[1]
    console.log(amountValue, amount)
    this.setData({ amountValue, amount })
  },
  submit ({ detail }) {
    if (this.data.clicking) return

    const { orderCode, type, explain, imgList, reasonSelect, specId, applyNumber } = this.data
    if (!reasonSelect) {
      wx.showToast({ title: '请选择退款原因', icon: 'none' })
      return
    }

    wx.showLoading()
    this.setData({ clicking: true })
    const fnCreate = () => {
      ApiOrderCancel.create({
        data: {
          type,
          explain,
          orderCode,
          specId,
          applyNumber,
          evidencePic: imgList.join(','),
          reason: reasonSelect.value
        },
        success: (res) => {
          wx.hideLoading()
          this.setData({ clicking: true })
          wx.showToast({ title: '操作成功', icon: 'success', duration: 2000 })
          setTimeout(() => wx.redirectTo({ url: '/pages/order-list/order-list?status=5' }), 2000)
        },
        fail: (res) => {
          this.setData({ clicking: false })
        }
      })
    }
    ApiCommon.subscribeMsg({
      data: { sceneId: 5 },
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
      fail: (res) => {
        this.setData({ clicking: false })
      }
    })
  }
})
