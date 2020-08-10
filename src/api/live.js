import { apiFunc } from './_base'

module.exports = {
  // 直播室查询
  broadcast: (options) => apiFunc('/broadcast/app_broadcast', options, 'get'),

  // 直播间查询商品
  listProduct: (options) => apiFunc('/broadcast/app_list_product', options, 'get'),

  // 视频详情
  open: (options) => apiFunc('/broadcast/app_open', options, 'get'),

  // app打开直播间前获取人员类型
  preOpen: (options) => apiFunc('/broadcast/app_pre_open', options, 'get'),

  // app打开直播间后增加直播记录
  appRecord: (options) => apiFunc('/broadcast/app_record'),

  // app主播退出直播间后更新直播记录
  recordUpdate: (options) => apiFunc('/broadcast/app_record_update'),

  // 直播间查询置顶商品
  topProduct: (options) => apiFunc('/broadcast/app_top_product', options, 'get'),

  // 直播间设置置顶商品
  topSet: (options) => apiFunc('/broadcast/app_top_set', options),

  // app观众进入直播间后增加观看记录
  watch: (options) => apiFunc('/broadcast/app_watch', options),

  // app观众退出直播间更新观看记录
  watchUpdate: (options) => apiFunc('/broadcast/app_watch_update', options),

  // 观众点击链接进入直播间
  joinBroadcast: (options) => apiFunc('/broadcast/join_broadcast', options, 'get'),

  // 获取验签
  sign: (options) => apiFunc('/broadcast/app_sign', options, 'get'),

  // 下单消息发送
  order: (options) => apiFunc('/broadcast/app_order', options),

  // 直播商品详情
  goodsInfo: (options) => apiFunc('/broadcast/info', options, 'get'),

  // ============ v2 ============

  // 直播列表
  // getLiveList: (options) => apiFunc('/broadcast/get_live_list', options)
  getLiveList: (options) => apiFunc('/live_room/list', options, 'get'),

  // 直播详情
  getLiveInfo: (options) => apiFunc('/live_room/info', options, 'get')
}
