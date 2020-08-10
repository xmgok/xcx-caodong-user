import { dateParse } from '../utils/index'

const app = getApp()

exports.indexPrompt = (options = {}) => {
  app.ajax({
    url: '/activity/index_prompt',
    type: 'get',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.activityInfo = (options = {}) => {
  app.ajax({
    url: '/activity/app_info',
    type: 'get',
    params: options.params,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.fillData = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/activity/fill_data',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.forwardAdd = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/activityforward/add',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.pay = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/activity/pay',
    type: 'get',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.getFansList = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/activity/list_app',
    type: 'get',
    data,
    success (res) {
      res.data.dataList.forEach((v) => {
        v._beginTimeFormat = dateParse(v.beginTime, true)
        v._endTimeFormat = dateParse(v.endTime, true)
      })
      if (options.success) options.success(res)
    }
  })
}

exports.statisticalTime = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/activity/statistical_time',
    type: 'post',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 无条件参与活动
exports.joinActivity = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/activity/join_activity',
    type: 'post',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 通过门店ids获取门店
exports.getStoreList = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/store/get_store_list',
    type: 'post',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
