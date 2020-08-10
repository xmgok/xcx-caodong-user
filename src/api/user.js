const app = getApp()
const { DEFAULT_AVATAR_URL, DEFAULT_NICK_NAME } = require('../utils/consts')

// 通用转发
exports.forward = (options) => {
  /*
  forwarderId (integer, optional): 转发者ID
  id (integer, optional): 转发对象id
  kind (integer, optional): 种类 1优惠券 2文章 3-直播 4-组合券包 5-砍价 6-秒杀 7-吸粉活动
  type (integer, optional): 类型 1转发 2进入
  */
  app.ajax({
    url: '/forward',
    type: 'post',
    ...options,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 用户信息修改
exports.edit = (options) => {
  let data = options.data || {}

  //   birthday (string, optional): 出生日期 ,
  //   headUrl (string, optional): 头像 ,
  //   id (integer, optional): id ,
  //   mobile (string, optional): 手机号 ,
  //   name (string, optional): 姓名 ,
  //   nickName (string, optional): 昵称 ,
  //   remark (string, optional): 备注 ,
  //   wxOpenid (string, optional): 微信openid

  app.ajax({
    url: '/user/update',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 获取用户信息
exports.getuser = (options) => {
  app.ajax({
    url: '/user/getuser',
    type: 'get',
    success (res) {
      wx.setStorageSync('storeName', res.data.storeName || '') // 此处的storeName可以存储，因为这里是当前登陆者的所属门店。
      // 这里不能加默认头像和默认昵称，因为业务里根据这个做了判断
      if (options.success) options.success(res)
    }
  })
}

// 检测当前用户是否是导购
exports.getEmpInfo = (options) => {
  app.ajax({
    url: '/user/get_emp_info',
    type: 'get',
    ...options,
    success (res) {
      res.data = res.data || {}
      if (options.success) options.success(res)
    }
  })
}

// 获取用户消费总金额以及订单总数
exports.getSumAmount = (options) => {
  app.ajax({
    url: '/user/get_sum_amount',
    type: 'get',
    ...options,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 根据用户id获取用户信息
exports.userInfo = (options) => {
  app.ajax({
    url: '/user/user_info',
    type: 'get',
    ...options,
    success (res) {
      res.data.headUrl = res.data.headUrl || DEFAULT_AVATAR_URL
      res.data.nickName = res.data.nickName || DEFAULT_NICK_NAME
      // 此处的storeName不能存储。因为这里是对应id用户的所属门店。
      if (options.success) options.success(res)
    }
  })
}

// 客户列表
exports.list = (options) => {
  app.ajax({
    url: '/user/list',
    type: 'get',
    params: options.params || {},
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 新增客户
exports.addCustomer = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/add',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 员工登录
exports.emplogin = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/emplogin',
    data,
    success (res) {
      wx.setStorageSync('storeName', res.data.storeName || '')
      if (options.success) options.success(res)
    }
  })
}

// 员工一键授权手机号登录
exports.empAuthLogin = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/user/emp_auth_login',
    data,
    success (res) {
      wx.setStorageSync('storeName', res.data.storeName || '')
      if (options.success) options.success(res)
    },
    complete (res) {
      if (options.complete) options.complete(res)
    }
  })
}

// 获取短信验证码
exports.getSmscode = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/smscode',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 用户转发记录
exports.transferAdd = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/transfer/add',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 品牌信息
exports.brandBrief = (options) => {
  app.ajax({
    url: '/brand/brief',
    type: 'get',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 后台账号注册
exports.sysuserRegister = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/sysuser/register',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 查询企业信息状态
exports.companyInfoStatus = (options) => {
  app.ajax({
    url: '/sysuser/company_info_status',
    type: 'get',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.getOpenId = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/get_openid',
    type: 'post',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

exports.achievement = (options) => { // 员工端今日概况
  app.ajax({
    url: '/user/achievement/info',
    type: 'get',
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

//  获取手机号
exports.authCustmobile = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/auth_cust_mobile',
    type: 'post',
    data,
    fail (res) {
      if (options.fail) options.fail(res)
    },
    success (res) {
      if (options.success) options.success(res)
    },
    complete (res) {
      if (options.complete) options.complete(res)
    }
  })
}

//  提交formId
exports.msgFormIdAdd = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/mp/minapp/msg_formid/add',
    type: 'post',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 获取潜在客户信息
exports.potentialCustomers = (options) => {
  let data = options.data || {}
  app.ajax({
    url: '/user/potential_customers',
    type: 'post',
    data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}

// 解析scene
exports.getScene = (options) => {
  app.ajax({
    url: '/mp/miniapp/qrcode/scene',
    type: 'get',
    data: options.data,
    success (res) {
      if (options.success) options.success(res)
    }
  })
}
