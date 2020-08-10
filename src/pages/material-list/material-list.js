import { beautifyTime } from '../../utils/index'
const ApiMaterial = require('../../api/material')
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')
const app = getApp()
const VIDEO_IMG_SUFFIX = app.VIDEO_IMG_SUFFIX

Page({
  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    userType: '',
    typeList: ['全部', '图片', '视频'],
    typeIndex: 0,
    sortList: [
      { name: '时间', sort: true },
      // { name: '评论', sort: true },
      { name: '热度', sort: true }
    ],
    sortIndex: 0,
    listData: [],
    pageNum: 1,
    pageSize: 10,
    ajax: false,
    getEnd: false,
    checkList: [],
    checkIdList: [],
    productId: '',
    productInfo: {},
    empid: '',
    showShare: false
  },
  onLoad ({ productId = '' }) {
    wx.hideShareMenu()
    this.setData({
      productId,
      empid: wx.getStorageSync('empidCommission'),
      userType: wx.getStorageSync('userType')
    })
    this.getDetails()
    this.getListData()
  },
  getDetails () {
    ApiProduct.getInfo({
      params: { id: this.data.productId },
      success: ({ data }) => {
        this.setData({ productInfo: data })
      }
    })
  },
  getListData () {
    if (this.data.getEnd) return
    if (this.data.ajax) return
    this.setData({ ajax: true })
    let orderByClauseArr = [
      ['createTime asc', 'createTime desc'],
      ['useTotal asc', 'useTotal desc']
    ]
    const isTrue = Number(this.data.sortList[this.data.sortIndex].sort)

    ApiMaterial.list({
      params: {
        productId: this.data.productId,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        type: (Number(this.data.typeIndex) === 0 ? '' : Number(this.data.typeIndex)), //  1图片 2视频
        orderByClause: orderByClauseArr[this.data.sortIndex][isTrue]
      },
      success: ({ data = {} }) => {
        let dataList = data.dataList || []
        dataList = dataList.map((item, index) => {
          item['_createTime'] = beautifyTime(item.createTime)
          item.imgUrl = item.imgUrl.split(',')
          item.imgUrl = item.imgUrl.map((img) => {
            if (item.type > 1) {
              img = `${img}${VIDEO_IMG_SUFFIX}`
            }
            img = { url: img, _width: 344, _height: 344 }
            return img
          })
          return item
        })
        this.setData({
          listData: this.data.listData.concat(dataList),
          ajax: false,
          getEnd: (dataList.length < this.data.pageSize),
          pageNum: ++this.data.pageNum
        })
      }
    })
  },
  bindTypeIndexChange ({ detail }) {
    this.setData({ typeIndex: detail.value, listData: [], pageNum: 1, ajax: false, getEnd: false })
    this.getListData()
  },
  changeSort ({ currentTarget }) {
    const sortIndex = currentTarget.dataset.index
    let sortList = this.data.sortList
    let itemData = sortList[sortIndex]
    itemData.sort = !itemData.sort
    this.setData({ sortList, sortIndex, listData: [], pageNum: 1, ajax: false, getEnd: false })
    this.getListData()
  },
  bindLoadImg ({ detail, currentTarget }) {
    const id = currentTarget.dataset.id
    let listData = this.data.listData
    detail.height = 344 * detail.height / detail.width
    detail.width = 344
    listData.forEach((item) => {
      if (Number(item.id) === Number(id)) {
        item.imgUrl[0]._width = detail.width
        item.imgUrl[0]._height = detail.height
      }
    })

    this.setData({ listData })
  },
  onReachBottom () {
    this.getListData()
  },
  checkChange ({ currentTarget }) {
    const id = currentTarget.dataset.id
    const imgLen = currentTarget.dataset.imglen
    const type = currentTarget.dataset.type
    const listData = this.data.listData
    if (!this.data.empid) {
      wx.navigateTo({ url: `/pages/explore-detail/explore-detail?id=${id}&productId=${this.data.productId}` })
      return
    }
    let checkList = []
    let checkIdList = []
    listData.forEach((item) => {
      const isMy = item.id === id
      if (((imgLen > 1 || item.imgUrl.length > 1) || (type > 1 || item.type > 1)) && !isMy) {
        item.checked = false
      }

      if (isMy) {
        item.checked = !item.checked
      }
      if (item.checked) {
        checkIdList.push(item.id)
        item.imgUrl.forEach((imgItem) => {
          checkList.push(imgItem.url)
        })
      }
    })
    this.setData({ listData, checkList, checkIdList })
  },
  goChooseImg () {
    if (this.data.checkList.length <= 0) return
    this.setData({ showShare: true })
    // wx.navigateTo({ url: `/pages/choose-img/choose-img?productId=${this.data.productId}&chooseimg=${this.data.checkList.join(',')}&checkIdList=${this.data.checkIdList.join(',')}` })
  },
  close () {
    this.setData({ showShare: false })
  },
  onShareAppMessage () {
    ApiProduct.transmit({
      data: {
        id: this.data.productId,
        mids: this.data.checkIdList
      }
    })
    ApiUser.transferAdd({
      data: {
        productId: this.data.productId,
        productCode: this.data.productInfo.productCode || '',
        price: this.data.productInfo.price || 0,
        addPrice: 0
      }
    })

    const empid = wx.getStorageSync('empidCommission')
    return {
      title: this.data.productInfo.name || '',
      path: `/pages/product/product?id=${this.data.productId}${empid ? `&empid=${empid}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      imageUrl: this.data.checkList[0]
    }
  }
})
