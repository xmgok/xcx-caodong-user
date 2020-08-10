const app = getApp()

module.exports = {
  // ABC分类标签页 - 列表
  type_list (options) {
    app.ajax({
      url: '/user/label/type_list',
      type: 'get',
      ...options,
      success (res) {
        let arr = []
        Object.keys(res.data).forEach(key => {
          res.data[key].forEach(item => {
            item.itemStr = JSON.stringify(item)
          })
          if (key === '#') {
            arr = res.data[key]
            delete res.data[key]
          }
        })
        if (arr.length) {
          res.data['#'] = arr
        }
        if (options.success) options.success(res)
      }
    })
  },
  // ABC分类标签页 - 新增
  add (options) {
    app.ajax({
      url: '/user/label/add',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 标签搜索结果 - 列表
  list (options) {
    app.ajax({
      url: '/user/label/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.forEach(item => {
          item.itemStr = JSON.stringify(item)
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 标签详情页 - 更新标签
  update (options) {
    app.ajax({
      url: '/user/label/update',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 标签详情页 - 删除标签
  delete (options) {
    app.ajax({
      url: '/user/label/delete',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 客户标签基本信息
  customerInfo (options) {
    app.ajax({
      url: '/user/label/customer_info',
      type: 'get',
      ...options,
      success (res) {
        res.data.country = res.data.country || ''
        res.data.province = res.data.province || ''
        res.data.city = res.data.city || ''
        res.data.area = res.data.area || ''
        if (options.success) options.success(res)
      }
    })
  },
  // 客户标签基本信息 - 编辑
  update_customer (options) {
    app.ajax({
      url: '/user/label/update_customer',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 标签详情页 - 相关用户
  customerList (options) {
    app.ajax({
      url: '/user/customer/list',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取用户浏览商品记录
  actionProductList (options) {
    app.ajax({
      url: '/action/product_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取用户浏览轨迹
  actionList (options) {
    app.ajax({
      url: '/action/list',
      type: 'get',
      ...options,
      success (res) {
        res.data.dataList.forEach(v => {
          if (v.productName) {
            v.label += ' - ' + v.productName
          }
        })
        if (options.success) options.success(res)
      }
    })
  },
  // 获取用户浏览商品行为汇总
  productSummary (options) {
    app.ajax({
      url: '/action/product_summary',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 获取用户浏览小程序总时长
  browseTime (options) {
    app.ajax({
      url: '/action/browse_time',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 小程序我的标签
  myLabelList (options) {
    app.ajax({
      url: '/user/label/my_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 新增客户标签
  addLabel (options) {
    app.ajax({
      url: '/user/label/add_label',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 新增客户标签 - 批量
  addListLabel (options) {
    app.ajax({
      url: '/user/label/add_list_label',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 小程序客户个性标签 - 获取
  app_customer_label_list (options) {
    app.ajax({
      url: '/user/label/app_customer_label_list',
      type: 'get',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },
  // 小程序客户个性标签 - 删除
  delete_relation (options) {
    app.ajax({
      url: '/user/label/delete_relation',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  }
}
