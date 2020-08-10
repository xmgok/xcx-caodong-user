const qiniuUploader = require('../../utils/qiniuUploader')
const app = getApp()

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  data: {},
  attached () { // 组件生命周期函数，在组件实例进入页面节点树时执行
  },
  ready () { // 组件生命周期函数，在组件布局完成后执行，此时可以获取节点信息
  },
  detached () { // 组件生命周期函数，在组件实例被从页面节点树移除时执行
  },
  methods: {
    del (e) {
      // this.triggerEvent('del', e.currentTarget.dataset)
      const dataset = e.currentTarget.dataset
      const index = dataset.index
      const result = this.data.result
      result.list.splice(index, 1)
      this.setData({ result })
      this.triggerEvent('change', result)
    },
    upload () {
      const result = this.data.result
      const {
        maxLength,
        list
      } = result
      // maxLength传-1，就不限制图片上传数量。但是每次最多只能上传count张
      if (maxLength > 0 && list.length >= maxLength) {
        return
      }
      // 一次最多上count张
      let count = 9
      if (maxLength > 0 && maxLength - list.length <= count) {
        count = maxLength - list.length
      }
      wx.chooseImage({
        count,
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          wx.showLoading({ title: '图片上传中' })
          this.getQiniuToken((qiniuInfo) => {
            qiniuInfo = qiniuInfo.data || {}
            let i = 0
            tempFilePaths.forEach((item, index) => {
              const suffix = item.split('.')
              qiniuUploader.upload(item, (res) => {
                i++
                result.list.push({ imgUrl: res.imageURL, name: res.hash })
                if (i === tempFilePaths.length) {
                  this.setData({ result })
                  wx.hideLoading()
                  this.triggerEvent('change', result)
                }
              }, (error) => {
                console.log('error: ' + error)
              }, {
                key: `${app.config.tenantId}_${new Date().getTime()}_${String(Math.random()).substr(10)}_${index}.${suffix[suffix.length - 1]}`,
                region: 'ECN',
                uploadURL: app.config.uploadImgPath,
                domain: qiniuInfo.domain,
                uptoken: qiniuInfo.uptoken,
                shouldUseQiniuFileName: false // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
              })
            })
          })
        }
      })
    },
    getQiniuToken (callback) {
      app.ajax({
        url: `/qiniu/uptoken`,
        type: 'get',
        success: (res) => {
          callback(res)
        }
      })
    }
  }
})
