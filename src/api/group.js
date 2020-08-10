import { dateParse } from '../utils/index'
const priceCtrl = require('../utils/price')
const { DEFAULT_AVATAR_URL, DEFAULT_NICK_NAME } = require('../utils/consts')
const app = getApp()

module.exports = {
  // 拼团活动列表页。所有的拼团活动列表
  activeList (options) {
    app.ajax({
      url: '/group/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.map((v, i, a) => {
          // 价格格式化
          const { int, dec } = priceCtrl.currency(v.activePrice)
          a[i].priceInteger = int
          a[i].priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 商详页，某个商品的被开团列表
  recordList (options) {
    app.ajax({
      url: '/group/record/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach((v, i, a) => {
          a[i].headImg = a[i].headImg || DEFAULT_AVATAR_URL
          a[i].nickname = a[i].nickname || DEFAULT_NICK_NAME
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 商详页，拼团详情
  groupDetails (options) {
    app.ajax({
      url: '/group/details',
      type: 'get',
      ...options,
      success (res) {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(res.data.activePrice)
        res.data.activePriceInteger = int
        res.data.activePriceDecimal = dec
        res.data.list.forEach((v, i, a) => {
          a[i].headImg = a[i].headImg || DEFAULT_AVATAR_URL
          a[i].nickname = a[i].nickname || DEFAULT_NICK_NAME
        })
        res.data._startTimeFormat = dateParse(res.data.startTime)
        if (options.success) options.success(res)
      }
    })
  },
  // 拼团详情页和拼团邀请页的，拼团详情
  recordInfo (options) {
    app.ajax({
      url: '/group/record/info',
      type: 'get',
      ...options,
      success (res) {
        // 价格格式化
        const { int, dec } = priceCtrl.currency(res.data.activePrice)
        res.data.activePriceInteger = int
        res.data.activePriceDecimal = dec
        res.data.list.forEach((v, i, a) => {
          a[i].headImg = a[i].headImg || DEFAULT_AVATAR_URL
          a[i].nickname = a[i].nickname || DEFAULT_NICK_NAME
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 订单详情页，拼团详情
  recordByOrder (options) {
    app.ajax({
      url: '/group/record/byorder',
      type: 'get',
      ...options,
      success (res) {
        res.data.list.forEach((v, i, a) => {
          a[i].headImg = a[i].headImg || DEFAULT_AVATAR_URL
          a[i].nickname = a[i].nickname || DEFAULT_NICK_NAME
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 我的拼团列表
  myGroupList (options) {
    app.ajax({
      url: '/group/mylist',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach((v, i, a) => {
          const { int, dec } = priceCtrl.currency(a[i].activePrice)
          a[i].activePriceInteger = int
          a[i].activePriceDecimal = dec
          if (a[i].status === 1) {
            a[i]._statusName = a[i].statusName + `，还差${a[i].shortNum}人`
          }
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 活动规则
  info (options) {
    app.ajax({
      url: '/group/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 拼团活动参与转发导购列表
  empList (options) {
    app.ajax({
      url: '/group/forward/emp_list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach((v, i, a) => {
          a[i].headImg = a[i].headImg || DEFAULT_AVATAR_URL
          a[i].nickname = a[i].nickname || DEFAULT_NICK_NAME
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 导购端拼团活动详情
  empDetails (options) {
    app.ajax({
      url: '/group/emp_details',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 转发统计
  forward (options) {
    app.ajax({
      url: '/group/forward/add',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
