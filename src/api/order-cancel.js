import { apiFunc } from './_base'

module.exports = {
  // 新增售后订单
  create: (options) => apiFunc('/orderreturn/add', options),

  // 取消售后订单
  cancel: (options) => apiFunc('/orderreturn/cancel', options, 'get'),

  // 协商记录list列表
  consultList: (options) => apiFunc('/orderreturn/consultlist', options, 'get'),

  // 前端售后订单详情
  returnDetail: (options) => apiFunc('/orderreturn/returndetail', options, 'get'),

  // 用户提交物流信息
  userCheck: (options) => apiFunc('/orderreturn/usercheck', options),

  // 前端售后订单列表
  userList: (options) => apiFunc('/orderreturn/userlist', options, 'get')
}
