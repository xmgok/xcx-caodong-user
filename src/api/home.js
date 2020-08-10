const app = getApp()

module.exports = {
  getInfo (options) {
    app.ajax({
      url: '/index/template/info',
      type: 'get',
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  getHome (options) {
    app.ajax({
      url: '/home/get_wxtemplate',
      type: 'get',
      ...options,
      success (res) {
        const list = JSON.parse(res.data.content)
        // 未配置模板时null
        if (!list) return

        list.forEach(v => {
          // 轮播组件-数据兼容
          if (v.type === 3 && v.data instanceof Array) {
            const data = v.data
            v.data = {
              height: 400,
              list: data
            }
          }
        })
        res.data.content = JSON.stringify(list)
        if (options.success) options.success(res)
      }
    })
  },

  getProducts (options) {
    app.ajax({
      url: '/index/template/products',
      type: 'get',
      params: options.params,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 导购端吸粉、任务 变化标记
  markInfo (options) {
    app.ajax({
      url: '/mark/info',
      type: 'get',
      params: options.params,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }

}
