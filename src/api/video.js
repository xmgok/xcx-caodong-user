import { apiFunc } from './_base'

module.exports = {
  // 订单预览
  list: (options) => apiFunc('/video/app_list', options, 'get'),

  // 视频详情
  info: (options) => apiFunc('/video/app_info', options, 'get'),

  // 视频购物转发参与记录
  forward: (options) => apiFunc('/videoforward/forward', options),

  // 新增视频播放记录
  watch: (options) => apiFunc('/video/watch', options),

  // 更新视频播放时长
  watchTimeUpdate: (options) => apiFunc('/video/watch_time/update', options),

  // 评论回复
  saveComment: (options) => apiFunc('/video/comment', options),

  // 评论列表
  commentList: (options) => apiFunc('/video/comment_list', options, 'get'),

  // 点赞
  like: (options) => apiFunc('/video/like', options),

  // 回复列表
  replyList: (options) => apiFunc('/video/reply_list', options, 'get'),

  // ===== 购物车 =====
  // 添加视频商品购物车
  cartAdd: (options) => apiFunc('/cart/video/add', options),

  // 视频购物车全选
  cartCheckedAll: (options) => apiFunc('/cart/video/checkedall', options, 'get'),

  // 删除视频购物车商品
  cartDelete: (options) => apiFunc('/cart/video/delete', options, 'delete'),

  // 修改视频购物车信息
  cartEdit: (options) => apiFunc('/cart/video/edit', options),

  // 删除视频购物车赠品
  cartGiftDel: (options) => apiFunc('/cart/video/gift/delete', options, 'delete'),

  // 视频购物车选择赠品
  cartGiftSave: (options) => apiFunc('/cart/video/gift/save', options),

  // 获取视频购物车列表
  cartList: (options) => apiFunc('/cart/video/list', options, 'get')
}
