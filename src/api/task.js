// const priceCtrl = require('../utils/price')
import { dateParse } from '../utils/index'
const priceCtrl = require('../utils/price')
const app = getApp()

module.exports = {
  // 任务列表
  getList (options) {
    app.ajax({
      url: '/task/listApp',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v._scale = Math.ceil(v.step / v.stepNumber * 100)
          if (v._scale > 100) {
            v._scale = 100
          }
          // v._beginTimeFormat = dateParse(v.beginTime)
          // v._endTimeFormat = dateParse(v.endTime)
          if (+v.type === 1) {
            v._logoUrl = 'https://qiniu.icaodong.com/xcx/index/fans.png?v=1.0.0'
          }
          if (+v.type === 2) {
            v._logoUrl = 'https://qiniu.icaodong.com/xcx/index/forward.png?v=1.0.0'
          }
          if (+v.type === 3) {
            v._logoUrl = 'https://qiniu.icaodong.com/xcx/index/kpi.png?v=1.0.0'
          }
          if (v.status === 1) {
            v._statusDesc = '未开始'
          }
          if (v.status === 2) {
            v._statusDesc = '查看任务'
          }
          if (v.status === 3) {
            v._statusDesc = '已结束'
          }
        })
        if (options.success) options.success(res)
      }
    })
  },
  infoApp (options) {
    app.ajax({
      url: '/task/info_app',
      type: 'get',
      ...options,
      success (res) {
        const v = res.data
        v._scale = Math.ceil(v.step / v.stepNumber * 100)
        if (v._scale > 100) {
          v._scale = 100
        }
        v._beginTimeFormat = dateParse(v.beginTime, true)
        v._endTimeFormat = dateParse(v.endTime, true)
        if (options.success) options.success(res)
      }
    })
  },
  byTask (options) {
    app.ajax({
      url: '/group/bytask',
      type: 'get',
      ...options,
      success (res) {
        res.data.groupbuys.forEach(v => {
          v.type = 'group'
        })
        res.data.products.forEach(v => {
          v.type = 'normal'
        })
        res.data.dataList = res.data.groupbuys.concat(res.data.products)
        res.data.dataList.forEach(v => {
          v.name = v.name || v.productName
          v.imgUrl = v.imgUrl || v.productImg
          v.price = v.price || v.activePrice
          v.productId = v.productId || v.id

          v.activeId = ''
          v.activePrice = ''
          v.activeType = ''
          v._detailUrl = `/pages/product/product?id=${v.productId}`
          if (v.type === 'group') {
            v.activeId = v.id
            v.activePrice = v.price
            v.activeType = 'group'
            v._detailUrl = `/pages/product/product?id=${v.productId}&activeId=${v.id}&activeType=group`
          }

          // 价格格式化
          const { int, dec } = priceCtrl.currency(v.price)
          v.priceInteger = int
          v.priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 任务步骤
  getStep (options) {
    app.ajax({
      url: '/task/infolist',
      type: 'get',
      ...options,
      success (res) {
        const data = res.data
        data._scale = Math.ceil(data.step / data.stepNumber * 100)
        if (data._scale > 100) {
          data._scale = 100
        }
        // data._beginTimeFormat = dateParse(data.beginTime)
        // data._endTimeFormat = dateParse(data.endTime)
        data.listBffRecord = data.listBffRecord || []
        data.listBffRecord.forEach(v => {
          v.endTimeStr = Math.floor(v.endTimeStr / 1000)
          // v._beginTimeFormat = dateParse(v.beginTime)
          // v._endTimeFormat = dateParse(v.endTime)
          if (v.type === 1) { // 转发 - 软文
            v._title = '转发以下文案+软文，至朋友圈或好友'
          }
          if (v.type === 2) { // 转发 - 图片下载
            v._title = '保存以下文案+海报，至朋友圈或好友'
          }
          if (v.type === 3) { // 转发 - 视频
            v._title = '保存以下文案+视频，至朋友圈或好友'
          }
          if (v.type === 4) { // 转发 - 商品
            v._title = '转发以下文案+商品，至朋友圈或好友'
          }
          if (v.type === 5) { // 转发 - 优惠券
            v._title = '转发以下文案+优惠券，至朋友圈或好友'
            v.couponList && v.couponList.forEach(v2 => {
              v2.id = v2.couponId
              if (v2.price) {
                v2._price_big = v2.price.split('.')[0]
              }
              v2.shareDesc = v.shareDesc
              v2.shareImg = v.shareImg
            })
          }
          if (v.type === 6) { // 转发 - 视频购物
            v._title = '转发以下文案+视频购物，至朋友圈或好友'
          }
          if (v.type === 7) { // 转发 - 砍价
            v._title = '转发以下文案+砍价商品，至朋友圈或好友'
          }
          if (v.type === 8) { // 转发 - 瓜分券
            v._title = '转发以下文案+瓜分券，至朋友圈或好友'
            v.distCouponList && v.distCouponList.forEach(v2 => {
              if (v2.distType === 1) { // x人每人price元
                v2._price = v2.price * v2.distNum
              }
              if (v2.distType === 2) { // x人瓜分price元
                v2._price = v2.price
              }
              v2._price = Number(v2._price).toFixed(2)
              if (v2._price && v2._price.split) {
                v2._price_big = v2._price.split('.')[0]
              }
              v2.shareDesc = v.shareDesc
              v2.shareImg = v.shareImg
            })
          }
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 转发文章打这个接口
  forward (options) {
    app.ajax({
      url: '/task/infosave',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  sendmsg (options) {
    app.ajax({
      url: '/task/sendmsg',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  applist (options) {
    app.ajax({
      url: '/task/article/applist',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  taskforwardSave (options) {
    app.ajax({
      url: '/taskforward/save',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  taskTaskInform (options) {
    app.ajax({
      url: '/task/task/task_inform',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
