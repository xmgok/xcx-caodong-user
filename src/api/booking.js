const priceCtrl = require('../utils/price')
const { WEEK } = require('../utils/consts')
const app = getApp()

module.exports = {
  // 时间段。
  getTecAppoTime (options) {
    app.ajax({
      url: '/booking/service_time_quantum',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 城市列表
  city (options) {
    app.ajax({
      url: '/city/list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 查询门店信息
  getStoreInfo (options) {
    app.ajax({
      url: '/store/get_store_info',
      type: 'get',
      ...options,
      success (res) {
        res.data._beginWeek = WEEK[res.data.beginWeek]
        res.data._endWeek = WEEK[res.data.endWeek]
        if (options.success) options.success(res)
      }
    })
  },
  // 查询当前用户定位城市 - 经纬度换省市区
  getCurrentCity (options) {
    app.ajax({
      url: '/store/get_current_city',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 查询用户当前进入的门店
  myStore (options) {
    app.ajax({
      url: '/store/get_current_store',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 服务门店列表
  bookingStoreList (options) {
    app.ajax({
      url: '/store/get_city_store',
      type: 'post',
      ...options,
      success (res) {
        (res.data.dataList || []).map((v, i, a) => {
          v.managerMobile = v.managerMobile || ''
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 切换门店列表
  switchStoreList (options) {
    app.ajax({
      url: '/store/get_city_all_store',
      type: 'post',
      ...options,
      success (res) {
        (res.data.dataList || []).map((v, i, a) => {
          v.managerMobile = v.managerMobile || ''
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 服务项目列表
  bookingProjectList (options) {
    app.ajax({
      url: '/service_info/list_app',
      type: 'post',
      ...options,
      success (res) {
        (res.data.dataList || []).map((v, i, a) => {
          // 价格格式化
          const { int, dec } = priceCtrl.currency(v.price)
          a[i].priceInteger = int
          a[i].priceDecimal = dec
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 预约单号验证
  verifyCode (options) {
    app.ajax({
      url: '/booking/verify_code',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 预约单号确认核销
  confirmVerify (options) {
    app.ajax({
      url: '/booking/confirm_verify',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 小程序预约关闭
  close (options) {
    app.ajax({
      url: '/booking/close',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 小程序取消原因列表
  cancelReason (options) {
    app.ajax({
      url: '/booking/cancel_reason',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 小程序预约取消
  cancel (options) {
    app.ajax({
      url: '/booking/cancel',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 分配导购
  allot (options) {
    app.ajax({
      url: '/booking/allot',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 创建预约单
  create (options) {
    app.ajax({
      url: '/booking/create',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 预约单列表
  list (options) {
    app.ajax({
      url: '/booking/list_app',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(item => {
          Object.keys(item).forEach(key => {
            item[key] = item[key] || ''
          })
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 预约单详情
  info (options) {
    app.ajax({
      url: '/booking/info_app',
      type: 'get',
      ...options,
      success (res) {
        Object.keys(res.data).forEach(key => {
          res.data[key] = res.data[key] || ''
        })
        res.data.remarks = res.data.remarks || '无'
        res.data._serviceName = res.data.serviceList.map(v => v.serviceName).join('; ')
        if (options.success) options.success(res)
      }
    })
  },
  // 获取预约设置详情。
  settingDetail (options) {
    app.ajax({
      url: '/booking/setup/info',
      type: 'get',
      ...options,
      success (res) {
        res.data = res.data || {}
        if (options.success) options.success(res)
      }
    })
  },
  // 分配导购列表
  getStoreList (options) {
    app.ajax({
      url: '/user/get_store_emp',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(item => {
          Object.keys(item).forEach(key => {
            item[key] = item[key] || ''
          })
        })
        if (options.success) options.success(res)
      }
    })
  }
}
