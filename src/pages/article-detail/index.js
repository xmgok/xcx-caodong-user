import ApiUser from '../../api/user'
import business from '../../utils/business'
const ApiArticle = require('../../api/article')
const WxParse = require('../../wxParse/wxParse')
const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    const scene = business.sceneParse(options.scene)
    options = {
      ...options,
      ...scene
    }
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    ApiArticle.articleInfo({
      data: {
        articleId: this.data.options.id
      },
      success: (res) => {
        this.setData({ resData: res.data })
        business.tjPreview({ ApiUser, options, id: res.data.id, kind: 2 })
        wx.request({
          method: 'get',
          url: res.data.content,
          success: (res2) => {
            let str = res2.data.content.replace(/<script[^>]*>[\d\D]*?<\/script>/g, '')
            str = str.replace(/<style[^>]*>[\d\D]*?<\/style>/g, '')
            str = str.replace(/<meta[^>]*>[\d\D]*?/g, '')
            str = str.replace(/<link[^>]*>[\d\D]*?/g, '')
            str = str.replace(/<title[^>]*>[\d\D]*?<\/title>/g, '')
            str = str.replace(/<!--[\w\W\r\n]*?-->/g, '')
            str = str.replace(/id="activity-name"/g, 'id="activity-name" style="padding:0 10px;"')
            str = str.replace(/id="meta_content"/g, 'id="meta_content" style="padding:0 10px 10px;"')
            str = str.trim()
            WxParse.wxParse('article', 'html', str, this, 5)
          }
        })
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage () {
    this.shareForward()
    const shareData = this.data.resData
    return {
      title: shareData.shareDesc,
      imageUrl: shareData.shareImg,
      path: `/pages/article-detail/index?id=${shareData.id}&empid=${wx.getStorageSync('empidCommission')}&storeId=${wx.getStorageSync('storeId')}`
    }
  },
  onShareCoupons (e) {
    const item = this.data.resData
    let scene = business.sceneStringify({
      pageId: 10,
      storeId: wx.getStorageSync('storeId'),
      empid: wx.getStorageSync('empidCommission'),
      userid: wx.getStorageSync('userid'),
      id: item.id
    })
    this.setData({
      shareData: item,
      imgList: [item.shareImg],
      showShareCoupons: true,
      shareText: item.shareDesc,
      shareUrl: business.scene2Qr(scene, app)
    })
  },
  saved () {
    this.shareForward()
  },
  shareForward () {
    business.tjForward({ ApiUser, id: this.data.resData.id, kind: 2 })
  },
  close () {
    this.setData({ showShareCoupons: false })
  }
})
