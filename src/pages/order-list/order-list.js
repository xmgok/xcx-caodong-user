import { AFTERSALES_CHECK_STATUS, ORDER_RETURN_STATUS_MAP } from '../../utils/consts'

const ApiOrder = require('../../api/order')
const ApiOrderCancel = require('../../api/order-cancel')
const ApiCommon = require('../../api/common')
const pay = require('../../utils/pay')
const app = getApp()

// const orderReturnStatusMap = ['', '未申请', '售后申请中', '售后已完成']
// const orderReturnStatusMap = ['', '售后申请中', '售后已完成']
// const returnStatusMap = ['', '申请中', '已取消', '已结束', '待审核', '审核中', '', '已完成']

Page({
  data: {
    tabList: ['全部', '待付款', '待发货', '待收货', '待自提'],
    tabIndex: 0,
    showTab: true,
    listData: [],
    pageNum: 1,
    pageSize: 10,
    ajax: false,
    getEnd: false,
    orderType: 1,
    type: '' // extract:提成订单
  },

  onLoad ({ type = '', type2 = '', status = 0 }) {
    this.setData({ tabIndex: status })
    if (Number(status) === 5) {
      this.setData({ showTab: false })
      wx.setNavigationBarTitle({ title: '售后订单' })
    }
    if (type === 'extract') {
      wx.setNavigationBarTitle({ title: type2 ? '客户订单' : '提成订单' })
      this.setData({ type, orderType: 2 })
    }
  },

  onShow () {
    const goDetailPageNum = app.globalData.goDetailPageNum // 回退操作
    if (goDetailPageNum) {
      // 点入详情时是第几页，就回到第几页
      let { listData, totalPage, pageSize, lastPageSize } = this.data
      listData = listData.slice(0, goDetailPageNum * pageSize)
      let nowPageSize = pageSize
      if (+goDetailPageNum === +totalPage) { // 点的是最后一页
        nowPageSize = lastPageSize
      }
      listData.splice(listData.length - nowPageSize, nowPageSize)
      console.log('listData', listData)
      console.log('nowPageSize', nowPageSize)
      console.log('goDetailPageNum', goDetailPageNum)
      this.setData({ listData, pageNum: goDetailPageNum, ajax: false, getEnd: false })
      this.getList()
    } else {
      this.setData({ listData: [], pageNum: 1, ajax: false, getEnd: false })
      this.getList()
    }
  },

  goDetail (e) {
    const { url, index } = e.currentTarget.dataset
    app.globalData.goDetailPageNum = Math.ceil((index + 1) / this.data.pageSize) // 求出当前页码并存储当前页码
    console.log('app.globalData.goDetailPageNum', app.globalData.goDetailPageNum)
    wx.navigateTo({ url })
  },

  switchTab ({ currentTarget }) {
    if (this.data.ajax) return
    this.setData({ tabIndex: currentTarget.dataset.index, listData: [], pageNum: 1, ajax: false, getEnd: false })
    this.getList()
  },
  getList () {
    // console.log(this.data.tabIndex)
    if (this.data.getEnd) return
    if (this.data.ajax) return
    this.setData({ ajax: true })

    // 订单列表
    if (Number(this.data.tabIndex) !== 5) {
      ApiOrder.list({
        params: {
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize,
          orderStatus: this.data.tabIndex === 4 ? 7 : this.data.tabIndex,
          orderType: this.data.orderType
        },
        success: ({ data = {} }) => {
          let dataList = data.dataList || []
          // orderStatus: 1待付款 2待发货 3已发货 4已完成 5已取消 6已关闭 7待自提
          const orderStatusMap = ['', '待付款', '待发货', '待收货', '已完成', '已取消', '已关闭', '待自提']
          dataList = dataList.map((item) => {
            item._orderStatus = orderStatusMap[item.orderStatus || 0]
            // 未申请售后订单，不显示售后状态
            item._returnStatus = ORDER_RETURN_STATUS_MAP[item.returnStatus]
            item.redirectUrl = `/pages/order-detail/order-detail?orderCode=${item.orderCode}&type=${this.data.type}`
            item._isShowGoComment = +item.orderStatus === 4 && item.productList.filter(v => +v.commentStatus === 1).length
            const arr = (item.orderAmount || '').split('.')
            item._price_big = arr[0] || ''
            item._price_small = arr[1] || ''
            return item
          })
          // 存储最后一页有多少条数据
          const { pageNum, totalPage, pageSize } = data
          if (+totalPage === +pageNum) {
            this.setData({ lastPageSize: dataList.length })
          }
          console.log('pageNum', pageNum)
          console.log('pageSize', pageSize)
          console.log('totalPage', totalPage)
          console.log('lastPageSize', this.data.lastPageSize)
          this.setData({
            totalPage,
            listData: this.data.listData.concat(dataList),
            ajax: false,
            getEnd: +totalPage <= +pageNum,
            pageNum: ++this.data.pageNum
          })
        }
      })
      return
    }

    // 售后列表
    ApiOrderCancel.userList({
      success: ({ data }) => {
        data.map(item => {
          item.redirectUrl = `/pages/aftersales-detail/aftersales-detail?id=${item.id}`
          item._returnStatus = ORDER_RETURN_STATUS_MAP[item.returnStatus]
          item._checkStatus = AFTERSALES_CHECK_STATUS[item.checkStatus]

          // 售后订单
          item.isReturnOrder = true
          return item
        })

        this.setData({
          listData: this.data.listData.concat(data),
          ajax: false,
          getEnd: true
        })
      }
    })
  },
  onReachBottom () {
    this.getList()
  },
  goPayment ({ currentTarget: { dataset: { orderCode, orderType } } }) {
    if (this.data.submitting) return
    this.data.submitting = true
    pay.payment({
      orderCode,
      orderType,
      isRedirect: false,
      success: () => {
        this.getList()
        delete this.data.submitting
      },
      fail: () => {
        delete this.data.submitting
      }
    })
  },
  goLogistics ({ currentTarget: { dataset: { orderCode } } }) {
    wx.navigateTo({ url: `/pages/logistics-detail/logistics-detail?orderCode=${orderCode}` })
  },
  goCollect ({ currentTarget: { dataset: { orderCode } } }) {
    wx.showLoading({ title: '确认收货中' })
    const fnCreate = () => {
      ApiOrder.delivery({
        data: { orderCode },
        success: ({ data, code, message }) => {
          wx.hideLoading()
          wx.showToast({ title: (message || ''), icon: (code === 'SUCCESS' ? 'success' : 'none'), duration: 1000 })
          if (code === 'SUCCESS') {
            this.getList()
            setTimeout(() => wx.navigateTo({ url: `/pages/order-detail/order-detail?orderCode=${orderCode}` }), 1000)
          }
        }
      })
    }
    ApiCommon.subscribeMsg({
      data: { sceneId: 6 },
      success: (res) => {
        wx.requestSubscribeMessage({ // 订阅消息。
          tmplIds: res.data,
          success: (res) => console.log('success res', res),
          fail: (res) => console.log('fail res', res),
          complete: () => {
            fnCreate()
          }
        })
      }
    })
  },
  goAfterSalesApply ({ currentTarget: { dataset } }) {
    const { orderCode, amount, expressStatus } = dataset
    wx.navigateTo({ url: `/pages/aftersales-apply/aftersales-apply?orderCode=${orderCode}&amount=${amount}&expressStatus=${expressStatus}` })
  },
  goSend (e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url })
  }
})
