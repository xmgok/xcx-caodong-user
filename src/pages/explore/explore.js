const ApiMaterial = require('../../api/material')
const ApiVideo = require('../../api/video')
const app = getApp()

Page({
  data: {
    typeList: ['图片素材', '视频购物'],
    typeIndex: 0,
    showTab: true,
    sortList: {
      '0': [
        {
          label: '最新',
          name: 'zuixin',
          value: 1,
          hasIcon: false
        },
        {
          label: '下载量',
          name: 'xiazailiang',
          value: 3,
          values: [
            { label: '下载量由高到低', name: 3 },
            { label: '下载量由低到高', name: 2 }
          ]
        }
      ],
      '1': [
        {
          label: '最新',
          name: 'zuixin',
          value: 1,
          hasIcon: false
        },
        {
          label: '点赞数',
          name: 'dianzhanshu',
          value: 3,
          values: [
            { label: '点赞数由高到低', name: 3 },
            { label: '点赞数由低到高', name: 2 }
          ]
        },
        {
          label: '转发数',
          name: 'zhuanfashu',
          value: 5,
          values: [
            { label: '转发数由高到低', name: 5 },
            { label: '转发数由低到高', name: 4 }
          ]
        }
      ]
    },
    sortIndex: -1,
    sort: '', // 传递给后端的值
    keyword: '',
    listData: [],
    pageNum: 1,
    pageSize: 10,
    ajax: false,
    getEnd: false,
    statusBarHeight: 0,
    titleBarHeight: 0
  },
  onLoad () {
    this.setData({
      empid: wx.getStorageSync('empidCommission'),
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    })
    ApiVideo.list({
      params: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        videoName: this.data.keyword
      },
      success: ({ data = {} }) => {
        this.setData({ showTab: Boolean(data.dataList.length) })
        this.getWrapHeight()
      }
    })
    this.getList()
    this.getWrapHeight()
  },
  handleSearchConfirm (e) {
    this.setData({
      keyword: e.detail || '',
      typeIndex: this.data.typeIndex,
      listData: [],
      pageNum: 1,
      ajax: false,
      getEnd: false
    })
    this.getList()
  },
  tabChanged ({ currentTarget: { dataset: { index } } }) {
    this.data.sort = ''
    this.setData({ listData: [], pageNum: 1, ajax: false, getEnd: false })
    this.setData({ typeIndex: +index, sortIndex: -1 })
    this.getList()
  },
  getWrapHeight () {
    wx.createSelectorQuery().select('.wrap-height').boundingClientRect((rect) => {
      // rect 小几率可能为null
      this.setData({ wrapHeight: (rect && rect.height) || 87 })
    }).exec()
  },
  sortChange ({ currentTarget: { dataset: { item, index } } }) {
    console.log(item, index)
    if (item.hasIcon === false) {
      this.setData({ sortIndex: index })
      this.data.sort = item.value
      this.setData({ listData: [], pageNum: 1, ajax: false, getEnd: false })
      this.getList()
      console.log(this.data.sort)
    }
    this.data.sortIndexBak = index
  },
  sortChange2 (e) {
    this.setData({ sortIndex: this.data.sortIndexBak })
    const { typeIndex, sortList, sortIndex } = this.data
    const sortItem = sortList[typeIndex][sortIndex]
    sortItem.value = sortItem.values[e.detail.value].name
    this.setData({ sortList, listData: [], pageNum: 1, ajax: false, getEnd: false })
    this.data.sort = sortItem.value
    console.log(this.data.sort)
    this.getList()
  },
  getList () {
    if (this.data.getEnd) return
    if (this.data.ajax) return
    this.setData({ ajax: true })
    if (this.data.typeIndex === 0) {
      ApiMaterial.list({
        params: {
          sort: this.data.sort,
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize,
          keyword: this.data.keyword,
          type: 1 //  1图片 2视频
        },
        success: ({ data = {} }) => {
          const dataList = data.dataList || []
          this.setData({
            listData: dataList,
            ajax: false,
            getEnd: (dataList.length < this.data.pageSize),
            pageNum: ++this.data.pageNum
          })
          wx.stopPullDownRefresh()
        }
      })
    } else {
      ApiVideo.list({
        params: {
          sort: this.data.sort,
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize,
          videoName: this.data.keyword
        },
        success: ({ data = {} }) => {
          console.log(data)
          const dataList = data.dataList || []
          this.setData({
            listData: dataList,
            ajax: false,
            getEnd: (dataList.length < this.data.pageSize),
            pageNum: ++this.data.pageNum
          })
          wx.stopPullDownRefresh()
        }
      })
    }
  },
  onReachBottom () {
    this.getList()
  },
  onPullDownRefresh () {
    this.setData({ listData: [], pageNum: 1, ajax: false, getEnd: false })
    this.getList()
  }
})
