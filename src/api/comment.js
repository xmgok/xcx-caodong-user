const { DEFAULT_AVATAR_URL } = require('../utils/consts')
const app = getApp()

module.exports = {
  add (options) {
    app.ajax({
      url: '/comment/add',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  listGoods (options) {
    app.ajax({
      url: '/comment/app_list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v.headUrl = v.headUrl || DEFAULT_AVATAR_URL
          v.nickName = v.nickName || '匿名'
          v.imgUrlArr = (v.imgUrl || '').split(',')
          v.content = v.content || '没有填写评价内容'
          v.createTime = v.createTime.split(' ')[0]
        })
        if (options.success) options.success(res)
      }
    })
  },
  info (options) {
    app.ajax({
      url: '/comment/info',
      type: 'get',
      ...options,
      success (res) {
        res.data.headUrl = res.data.headUrl || DEFAULT_AVATAR_URL
        res.data.nickName = res.data.nickName || '匿名'
        res.data.imgUrlArr = (res.data.imgUrl || '').split(',')
        res.data.content = res.data.content || '没有填写评价内容'
        res.data.createTime = res.data.createTime.split(' ')[0]
        if (options.success) options.success(res)
      }
    })
  },
  listMy (options) {
    app.ajax({
      url: '/comment/my_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  listMy2 (options) {
    app.ajax({
      url: '/order/order/comment_app_list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          v.specContent = v.specContent || v.specName
          v.price = v.price || v.productPrice
        })
        if (options.success) options.success(res)
      }
    })
  }
}
