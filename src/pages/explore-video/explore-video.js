import ApiVideo from '../../api/video'
import ApiProduct from '../../api/product'
import mixins from '../../utils/mixins'
import ApiCoupon from '../../api/coupon'
import priceCtrl from '../../utils/price'
// const { VIDEO_IMG_SUFFIX } = getApp()

import business from '../../utils/business'

const app = getApp()

let watchTimer = null

Page({
  data: {
    id: '',
    watchId: '',
    currentProduct: '', // 查看详情时选中的商品

    comment: '', // 评论
    commentTo: {}, // 回复评论
    commentList: [],
    commentCount: 0,
    commentStar: 0,
    commentPage: {
      pageNum: 1,
      pageSize: 10,
      loading: false,
      getEnd: false,
      totalPage: 0
    },
    commentReplyPage: {}, // 评论回复分页
    isVideoStar: false, // 是否已点赞视屏
    videoCount: 0, // 用户已发布视频数量
    visitorCount: 0, // 访客数量

    userType: '',
    infoData: {},
    showPurchase: false,
    productInfo: {},
    empId: '',
    videoUrl: '',

    showGoodsSelector: false,
    showGoodsDetailSelector: false,
    showCommentSelector: false,
    showMoreActionSelector: false,
    showCouponSelector: false,
    showShareSelector: false,

    iPhoneX: wx.getStorageSync('iPhoneX'),
    // keyboardHeight: 0,
    couponIds: '',
    couponList: [],

    // share
    imgList: [],
    shareText: '',
    shareUrl: ''
  },

  onLoad ({ id = '', empid = '', userid = '', scene = '' }) {
    wx.hideShareMenu()
    wx.showLoading({ title: '加载中' })
    scene = business.sceneParse(scene)

    this.setData({
      id: scene.id || id,
      forwarderId: (scene.userid || userid) || (scene.empid || empid), // 来自导购转发的empId
      userType: wx.getStorageSync('userType'),
      empId: wx.getStorageSync('empidCommission') || '',
      userId: wx.getStorageSync('userid') || ''
    })

    this.getInfo()

    this.getCommentList()

    this.data.forwarderId && this.videoForward(2)
  },

  onShow () {
    this.startWatch()
  },

  onHide () {
    this._clearWatchTimer()
  },

  onUnload () {
    this._clearWatchTimer()
  },

  onShareAppMessage () {
    this.videoForward()

    const { id, empId, userId, infoData } = this.data
    const { shareTitle, shareImg } = infoData
    return {
      title: shareTitle || '',
      path: `/pages/explore-video/explore-video?id=${id}${empId ? `&empid=${empId}` : ''}${userId ? `&userid=${userId}` : ''}&storeId=${wx.getStorageSync('storeId')}`,
      imageUrl: shareImg
    }
  },

  ...mixins,

  // 视屏详情
  getInfo () {
    wx.showLoading()

    const { id } = this.data
    ApiVideo.info({
      data: {
        id
      },
      success: ({ data }) => {
        if (data.status === 0) {
          wx.showToast({ title: '该视频已下线', icon: 'none', duration: 2000 })
          setTimeout(() => wx.switchTab({ url: '/pages/explore/explore' }), 2000)
          return
        }

        const couponIds = data.couponList.join(',')
        this.setData({
          couponIds,
          infoData: {
            ...data,
            productList: data.productList.map((item) => {
              const { int, dec } = priceCtrl.currency(item.price)
              return {
                ...item,
                _priceInt: int,
                _priceDec: dec,
                _quantity: 1
              }
            })
          }
        })

        couponIds && this.getCouponList(couponIds)
        wx.hideLoading()
      }
    })
  },
  // 转发/进入
  videoForward (type = 1) {
    const { id, empId, forwarderId } = this.data
    ApiVideo.forward({
      data: {
        type, // 转发类型 1转发 2进入
        empId,
        forwarderId,
        videoId: id
      }
    })
  },
  getCouponList (ids) {
    ApiCoupon.couponInfo({
      params: {
        ids
      },
      success: ({ data }) => {
        this.setData({
          couponList: data.map(item => ({
            ...item,
            _price: item.price.split('.')[0],
            _stateText: { 0: '领取', 1: '已领取', 2: '已领完' }[item.isGet]
          }))
        })
      }
    })
  },
  // 评论列表
  getCommentList () {
    const { pageNum, pageSize, getEnd, loading } = this.data.commentPage
    if (getEnd || loading) return
    this.setData({ 'commentPage.loading': true })

    ApiVideo.commentList({
      data: {
        pageNum,
        pageSize,
        videoId: this.data.id
      },
      success: ({ data: { dataList, totalCount, totalPage } }) => {
        this.setData({
          commentCount: totalCount,
          commentList: this.data.commentList.concat(dataList.map(item => {
            const [year, month] = item.createTime.split('-')
            if (item.comment && item.comment.length) {
              if (item.replyNum) {
                // 初始化评论回复分页参数
                this.setData({
                  [`commentReplyPage.${item.id}`]: {
                    pageNum: 1,
                    pageSize: 10,
                    loading: false,
                    getEnd: false
                  }
                })
              }

              item.comment = item.comment.map(this._commentFormat)
            }
            return {
              ...item,
              _time: `${year}-${month}`
            }
          })),
          'commentPage.loading': false,
          'commentPage.getEnd': (dataList.length < pageSize),
          'commentPage.pageNum': pageNum + 1,
          'commentPage.totalPage': totalPage
        })
      }
    })
  },
  // 开始观看
  startWatch () {
    wx.showLoading()
    ApiVideo.watch({
      data: {
        videoId: this.data.id,
        empId: this.data.empId || ''
      },
      success: ({ data }) => {
        this.setData({ watchId: data })
        wx.hideLoading()

        watchTimer = setInterval(() => {
          ApiVideo.watchTimeUpdate({
            data: {
              id: this.data.watchId
            },
            success: ({ data }) => {
              if (!data) clearInterval(watchTimer)
            },
            fail: (res) => {
              console.log(res)
            }
          })
        }, 5000)
      }
    })
  },
  // 点击事件处理
  handleTap ({ currentTarget: { dataset } }) {
    const { type, id, productId, isGet } = dataset

    // 显示弹窗
    const popupPrefix = 'show-popup:'
    if (type.startsWith(popupPrefix)) {
      this.setData({
        [type.split(popupPrefix)[1]]: true
      })
      return
    }

    switch (type) {
      case 'goods':
        this.setData({ showGoodsSelector: true })
        break
      case 'goods-detail':
        ApiProduct.getDetails({
          params: {
            id: productId,
            type: 2
          },
          success: ({ data }) => {
            this.setData({ showGoodsDetailSelector: true })
            data.detailImages = (data.showImages || '').split(',')
            this.setData({ currentProduct: data })
          }
        })
        break
      case 'order':
        this._clearWatchTimer()
        wx.navigateTo({ url: '/pages/order-list/order-list' })
        break
      case 'navigate-back':
        this._clearWatchTimer()
        wx.switchTab({ url: '/pages/explore/explore' })
        break
      case 'draw-coupon':
        if (isGet > 0) return

        ApiCoupon.couponGet({
          data: {
            id,
            activityId: this.data.watchId,
            source: 3
          },
          success: ({ message }) => {
            wx.showToast({ title: message, icon: 'none' })
            this.getCouponList(this.data.couponIds)
          }
        })
        break
      case 'share':
        const { empId, userId, infoData } = this.data
        let scene = business.sceneStringify({
          pageId: 5,
          storeId: wx.getStorageSync('storeId'),
          empid: empId,
          userid: userId,
          id: this.data.id
        })
        this.setData({
          showShareSelector: true,
          imgList: [infoData.shareImg],
          shareText: infoData.shareTitle,
          shareUrl: business.scene2Qr(scene, app)
        })
        break
    }
  },
  // 获取评论回复
  getCommentReply ({ currentTarget: { dataset } }) {
    const { id } = dataset
    const { pageNum, pageSize, getEnd, loading } = this.data.commentReplyPage[id]
    if (getEnd || loading) return
    this.setData({ loading: true })

    ApiVideo.replyList({
      data: {
        commentId: id,
        pageNum,
        pageSize
      },
      success: ({ data: { dataList } }) => {
        const { commentList } = this.data
        const commentTopIndex = commentList.findIndex(item => item.id === id)
        if (!~commentTopIndex) return

        const replyCommentList = pageNum === 1 ? dataList : commentList[commentTopIndex].comment.concat(dataList.map(this._commentFormat))
        this.setData({
          [`commentList[${commentTopIndex}].comment`]: replyCommentList,
          [`commentReplyPage.${id}.loading`]: false,
          [`commentReplyPage.${id}.getEnd`]: (dataList.length < pageSize),
          [`commentReplyPage.${id}.pageNum`]: pageNum + 1
        })
      }
    })
  },
  // 发表评论
  saveComment () {
    if (!this.data.comment) return

    ApiVideo.saveComment({
      data: {
        videoId: this.data.id,
        content: this.data.comment,
        commentId: this.data.commentTo.commentId || '',
        parentId: this.data.commentTo.parentId || '',
        parentName: this.data.commentTo.name || ''
      },
      success: ({ status }) => {
        if (status !== 200) return

        wx.showToast({ title: '评论成功', icon: 'none', duration: 2000 })
        this.setData({
          commentList: [],
          'commentPage.pageNum': 1,
          'commentPage.loading': false,
          'commentPage.getEnd': false
        })
        this.getCommentList()
        this.setData({
          comment: '',
          commentTo: {}
        })
      }
    })
  },
  // 点击评论
  commentReply ({ currentTarget: { dataset } }) {
    const { id, parentId, name } = dataset
    this.setData({
      commentTo: {
        commentId: id,
        parentId,
        name
      }
    })
  },
  // 点赞视频/评论
  like ({ currentTarget: { dataset } }) {
    const { commentId, type, state, parentIndex, subIndex } = dataset

    // 评论点赞
    if (commentId !== undefined) {
      // 回复点赞
      if (subIndex !== undefined) {
        const likeNum = this.data.commentList[parentIndex].comment[subIndex].likeNum
        this.setData({
          [`commentList[${parentIndex}].comment[${subIndex}].likeNum`]: state === 1 ? likeNum + 1 : likeNum - 1,
          [`commentList[${parentIndex}].comment[${subIndex}].isLike`]: state
        })
        //  评论点赞
      } else {
        const likeNum = this.data.commentList[parentIndex].likeNum
        this.setData({
          [`commentList[${parentIndex}].likeNum`]: state === 1 ? likeNum + 1 : likeNum - 1,
          [`commentList[${parentIndex}].isLike`]: state
        })
      }
    } else {
      const likeNum = this.data.infoData.likeNum
      this.setData({
        'infoData.likeNum': state === 1 ? likeNum + 1 : likeNum - 1,
        'infoData.isLike': state
      })
    }

    ApiVideo.like({
      data: {
        state,
        commentId: commentId || '',
        videoId: this.data.id,
        type: { video: 1, comment: 2, reply: 3 }[type]
      },
      success: (res) => {
        console.log(res)
      }
    })
  },
  // 关闭弹窗
  selectorClose ({ currentTarget: { dataset } }) {
    this.setData({ [dataset.name]: false })

    if (dataset.name === 'showCommentSelector') this.setData({ commentTo: {} })
  },
  // 一键购买
  submit () {
    const products = this.data.infoData.productList.filter(item => item._quantity > 0)
    if (!products.length) {
      wx.showToast({ title: '请调整购买的商品数量', icon: 'none', duration: 3000 })
      return
    }
    ApiVideo.cartAdd({
      data: {
        list: products.map(item => ({
          productId: item.id,
          number: item._quantity
        })),
        watchId: this.data.watchId
      },
      success: ({ status }) => {
        if (status !== 200) return
        this._clearWatchTimer()
        this.setData({ showGoodsSelector: false })
        wx.navigateTo({ url: `/pages/cart-video/cart-video?watchId=${this.data.watchId}` })
      }
    })
  },
  // 商品购买数量变更
  onQuantityChange ({ detail: quantity, currentTarget: { dataset } }) {
    const index = dataset.index
    this.setData({ [`infoData.productList[${index}]._quantity`]: quantity })
  },
  // 评论列表加载更多
  bindScrollToBottom () {
    const { pageNum, totalPage } = this.data.commentPage
    this.setData({ 'commentPage.pageNum': pageNum + 1 })
    if (pageNum > totalPage) return

    this.getCommentList()
  },
  shareClosed () {
    this.setData({ showShareSelector: false })
  },
  // 解决评论输入键盘弹起时，不自动上推页面
  // bindKeyboardHeightChange ({ detail: { height, duration } }) {
  //   wx.showToast({ title: height + 52 + ';' + duration, icon: 'none', duration: 2000 })
  //   this.setData({ keyboardHeight: height })
  // },

  _clearWatchTimer () {
    watchTimer && clearInterval(watchTimer)
  },
  _showNoData () {
    wx.showToast({ title: '暂无数据', icon: 'none', duration: 2000 })
  },
  _commentFormat (item) {
    const [_year, _month] = item.createTime.split('-')
    return {
      ...item,
      _time: `${_year}-${_month}`
    }
  }
})
