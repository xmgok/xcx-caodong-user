const app = getApp()

export default {
  // 促销-去凑单
  groupInfo: (options) => {
    app.ajax({
      url: '/cart/group/info',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 代客下单
  info: (options) => {
    app.ajax({
      url: '/cart/info',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  list: (options) => {
    app.ajax({
      url: '/cart/list',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  count: (options) => {
    app.ajax({
      url: '/cart/count',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  add: (options) => {
    let data = options.data || {}
    app.ajax({
      url: '/cart/add',
      data,
      success (res) {
        if (options.success) options.success(res)
      },
      complete (res) {
        if (options.complete) options.complete(res)
      }
    })
  },

  del: (options) => {
    app.ajax({
      url: '/cart/delete',
      type: 'delete',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  delGift: (options) => {
    app.ajax({
      url: '/cart/gift/delete',
      type: 'delete',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  edit: (options) => {
    let data = options.data || {}
    app.ajax({
      url: '/cart/edit',
      data,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  checkAll: (options) => {
    app.ajax({
      url: '/cart/checkedall',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  checkGift: (options) => {
    app.ajax({
      url: '/cart/gift/info',
      type: 'get',
      params: options.params || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  addGift: (options) => {
    app.ajax({
      url: '/cart/gift/add',
      data: options.data || {},
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  saveGift: (options) => {
    app.ajax({
      url: '/cart/gift/save',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }

}
