import draw from '../../utils/draw'
import ApiActivity from '../../api/activity'
import variables from '../../utils/variables'
import business from '../../utils/business'

const ApiProduct = require('../../api/product')
const ApiGroup = require('../../api/group')
const ApiUser = require('../../api/user')
const app = getApp()
const VIDEO_IMG_SUFFIX = app.VIDEO_IMG_SUFFIX

Component({
  properties: {
    isShowShareButton: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: false,
      observer (newVal) {
        const { path } = business.getCurrentPage()
        if (!business.isTabBarUrl(path)) return
        if (!newVal) {
          wx.showTabBar()
          return
        }
        wx.hideTabBar()
      }
    },
    imgList: {
      type: Array,
      value: [],
      observer (newval) {
        if (newval.length) {
          this.setShareUrl() // 此处如果不加，员工首页的拼团列表中点击去分享。分享给好友拿不到商品图。
          if (~['activity', 'video', 'tb', 'other', 'coupon', 'live'].indexOf(this.data.activeType)) {
            if (!this.data.posterImgList.length) { // 如果海报已生成 则无需重新生成
              this.getPosterImgList(0) // 海报生成依赖商品信息 故放在请求成功后
            }
            return
          }
          this.setIsVideo()
          this.getDetails()
        }
      }
    },
    checkIdList: {
      type: Array,
      value: []
    },
    productId: {
      type: String,
      value: '',
      observer () { // 有些入参是空的id。此处如果不监听生成的二维码scene上商品id是空的。
        this.setShareUrl()
      }
    },
    activeId: {
      type: String,
      value: '',
      observer () { // 有些入参是空的id。此处如果不监听生成的二维码scene上商品id是空的。
        this.setShareUrl()
      }
    },
    activeType: { // ''普通商品 group拼团 seckill秒杀 activity活动 video视频 tb特步活动 other其他 coupon优惠券 live直播
      type: String,
      value: '',
      observer () { // 有些入参是空的id。此处如果不监听生成的二维码scene上商品id是空的。
        this.setShareUrl()
      }
    },
    activeData: {
      type: Object,
      value: {}
    },
    activePrice: {
      type: String,
      value: ''
    },
    type: { // 活动商品，type传1，表示从商品库查找商品。2门店，3商品编码
      type: String,
      value: '',
      observer () {
        this.setShareUrl()
      }
    },
    shareText: {
      type: String,
      value: ''
    },
    shareUrll: {
      type: String,
      value: ''
    },
    empId: {
      type: String,
      value: ''
    },
    priceSwitch: {
      type: Boolean,
      value: false
    },
    otherText: {
      type: String,
      value: ''
    }
  },

  data: {
    iPad: wx.getStorageSync('iPad'),
    showPoster: false,
    typeList: ['海报', '图片'],
    longTapText: {
      '': '商品',
      group: '拼团',
      seckill: '秒杀',
      activity: '活动',
      video: '视频',
      live: '直播',
      tb: '活动',
      other: '',
      coupon: '券的'
    },
    typeIndex: 0,
    currentImgList: [],
    posterImgList: [],
    posterHeight: '',
    item: {},
    productInfo: {},
    shareUrl: '',
    isVideo: false,
    current: 0,
    showPrice: true // 是否展示价格
  },

  attached () {
    this.ctx = wx.createCanvasContext('posterCanvas', this)

    // 直播不显示tab
    if (this.data.activeType === 'live') {
      this.setData({ typeList: [] })
    }
  },
  methods: {
    setShareUrl () {
      const storeId = wx.getStorageSync('storeId')
      const empid = wx.getStorageSync('empidCommission')
      const userid = wx.getStorageSync('userid')
      const productId = this.data.productId
      const activeId = this.data.activeId
      const activeType = this.data.activeType
      // product.id一定是门店商品id，所以即使type为1进来，这里带出去的也是门店商品id，再进来时type应为默认值2。所以不用担心。type为1表示使用商品库的id到门店的商品表里查询。商品一定是属于门店的。所以转发时不用带type。
      let pageId = '' // 页面id，用以确认是哪个页面。
      if (!activeType || activeType === 'group' || activeType === 'seckill') { // 普通商品详情页 和 拼团活动详情页 和 秒杀活动详情页
        pageId = 1 // 1表示商详页
      }
      const scene = business.sceneStringify({
        pageId,
        id: productId,
        storeId,
        empid,
        userid,
        activeId,
        activeType
      })
      let shareUrl = `${app.config.domainPath}/procuct/qrcode?token=${wx.getStorageSync('token')}&scene=${scene}`
      if (!activeType || activeType === 'group' || activeType === 'seckill') { // 普通商品详情页 和 拼团活动详情页 和 秒杀活动详情页
        shareUrl = business.scene2Qr(scene, app)
      }
      const item = { // 分享给好友的时候，在页面上通过dataset可以使用到这里的数据。
        productId,
        id: activeId,
        activeType: activeType,
        productImg: this.data.imgList[0]
      }
      this.setData({ shareUrl, item })
    },
    setIsVideo () {
      const imgList = this.data.imgList
      const isVideo = imgList.length > 0 && imgList[0].indexOf(VIDEO_IMG_SUFFIX) > -1
      this.setData({ isVideo })
    },
    onClose () {
      wx.hideLoading()
      this.setData({ show: false, showPoster: false })
      this.triggerEvent('close')
    },
    changeTab ({ currentTarget: { dataset: { index } } }) {
      let currentImgList = index === 0 ? this.data.posterImgList : this.data.imgList
      this.setData({ typeIndex: index, currentImgList })
    },
    taps () {
      return false
    },
    // 显示海报
    goUrl () {
      setTimeout(() => {
        this.setData({ show: false, showPoster: true })
        if (!this.data.posterImgList.length) {
          wx.showLoading({ title: '加载中' })
        }
      }, 500)
    },
    download () {
      wx.getSetting({
        success: ({ authSetting }) => {
          if (authSetting['scope.writePhotosAlbum'] === false) {
            wx.openSetting({
              success: () => this.saveImg()
            })
          } else {
            this.saveImg()
          }
        }
      })
    },
    getDetails () {
      if (!this.data.productId) return
      ApiProduct.getInfo({
        params: { id: this.data.productId, type: this.data.type || 2 },
        success: ({ data }) => {
          this.setData({ productInfo: data })
          if (!this.data.posterImgList.length) { // 如果海报已生成 则无需重新生成
            this.getPosterImgList(0) // 海报生成依赖商品信息 故放在请求成功后
          }
        }
      })
    },
    ...draw,
    getPosterImgList (index) {
      this.setData({ current: index }) // 用来判断海报是否生成完成的变量
      this.getDrawPic(index).then((drawPics) => {
        this.drawPoster(drawPics)
      })
    },
    getDrawPic (index) {
      const { imgList, qrImg, shareUrll, shareUrl, activeType, activeData } = this.data
      let arr = [imgList[index]]
      // 让qrImg只请求一次
      if (!qrImg) arr.push(shareUrll || shareUrl)
      console.log(arr)

      // 直播播主头像 arr[2]
      if (activeType === 'live' && activeData.headImg) {
        arr.push(activeData.headImg)
      }

      return this.reqPics(arr)
    },
    // 绘制海报
    drawPoster (drawPics) {
      let ctx = this.ctx
      ctx.setFillStyle('#ffffff')
      console.log(drawPics)

      if (!drawPics) return
      // 让qrImg只请求一次
      let qrImg = {}
      if (!this.data.qrImg) {
        this.data.qrImg = drawPics[1]
      }
      qrImg = this.data.qrImg
      let goodsImg = drawPics[0]

      // 商品图片宽度
      const goodsImgWidth = 345
      // 商品图片高度（定宽缩放）
      const goodsImgHeight = goodsImg.height * goodsImgWidth / goodsImg.width

      // 内容区高度
      const contentHeight = 145
      // 内容区顶部
      const contentTop = goodsImgHeight + 19

      // 海报高度
      const posterHeight = goodsImgHeight + contentHeight
      this.setData({ posterHeight: posterHeight })
      setTimeout(() => { // 修复posterHeight高度设置太慢，导致第一张海报渲染异常的问题。
        // 设置海报尺寸
        ctx.fillRect(0, 0, goodsImgWidth, posterHeight)

        // 设置海报边框
        ctx.setStrokeStyle('#f2f2f2')
        ctx.strokeRect(0, 0, goodsImgWidth, posterHeight)

        // 画商品图
        this.drawRoundRect(0, 0, goodsImgWidth, goodsImgHeight, 0, 0, goodsImg.path)

        // 绘制标题
        ctx.setFontSize(15)
        let title = this.data.shareText || this.data.productInfo.name || ''
        title = this.substringText(title, 3 * 12)
        this.drawParagraph(
          title,
          185, // width
          18, // 起始x坐标
          contentTop - 8 /* 字间距 */, // 起始y坐标
          22, // 行高
          3, // 行数
          16, // 字体大小
          '#272636'
        )

        const { activeData, activeType, activePrice, showPrice, productInfo } = this.data
        // 绘制价格
        if (showPrice) {
          let productPrice = productInfo.price
          if (+productInfo.isVip === 1) {
            productPrice = productInfo.sellPrice
          }
          const price = activeData.price || activePrice || productPrice
          if (price) {
            ctx.setFontSize(17)
            ctx.setFillStyle(variables.$primary)
            let text1 = '¥'
            let text2 = price
            let x1 = 17
            let x2 = 35

            if (activeType === 'coupon') {
              if (activeData.type === 3) { // 折扣券
                text1 = ''
                text2 += '折券'
                x2 = x1
              }
              if (activeData.type === 4) { // 包邮券
                text1 = ''
                text2 = '包邮券'
                x2 = x1
              }
            }

            ctx.fillText(text1, x1, contentTop + 88)
            ctx.setFontSize(22)
            ctx.fillText(text2, x2, contentTop + 88)
          }
        }

        // 画二维码图
        ctx.drawImage(qrImg.path, 185 + 50, contentTop, 92, 92)
        // 绘制维码图下提示文字
        ctx.setFontSize(11)
        ctx.setFillStyle('#96989c')
        this.data.longTapText.other = this.data.otherText
        const txt = this.data.longTapText[this.data.activeType]
        let txtX = 185 + 50 + 2
        if (!txt) {
          txtX += 11
        }
        ctx.fillText(`长按查看${txt}详情`, txtX, contentTop + 92 + 14)
        // 画直播播主头像/昵称
        if (drawPics[2]) {
          const width = 60
          const height = 60
          const x = 10
          const y = contentTop + 30

          // 播主用户昵称
          let nickname = this.data.activeData.nickname
          if (nickname) {
            nickname = this.substringText(nickname, 3 * 12)
            ctx.setFontSize(17)
            ctx.setFillStyle('#96989c')
            ctx.fillText(nickname, width + x + 10, y + height)
          }

          ctx.arc(width / 2 + x, height / 2 + y, width / 2, 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(drawPics[2].path, x, y, width, height)
        }

        // 绘制到画布上
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            quality: 1,
            canvasId: 'posterCanvas',
            success: ({ tempFilePath }) => {
              let posterImgList = this.data.posterImgList
              posterImgList.push(tempFilePath)
              this.setData({ posterImgList, currentImgList: posterImgList }) // 生成一张就放进去一张，虽然性能不好 但是用户没有长时间的空白等待感 体验更好
              let current = this.data.current
              if (++current !== this.data.imgList.length) {
                this.getPosterImgList(current)
              } else {
                // 海报生成完成
                wx.hideLoading()
              }
            },
            fail: res => {
              console.log('canvasToTempFilePath fail: ', res)
            }
          }, this)
        })
      }, 100)
    },
    saveImg () {
      if (this.data.typeIndex > 0) {
        wx.showLoading({ title: '保存中' })
        this.saveMaterial(0)
      } else {
        if (this.data.posterImgList.length < this.data.imgList.length) {
          wx.showToast({ title: '海报生成中，请稍后保存', icon: 'none' })
          return
        }
        this.savePoster()
      }
    },
    savePoster () {
      wx.showLoading({ title: '保存中' })
      let posterImgList = this.data.posterImgList
      let posterImgListLength = posterImgList.length
      for (let i = 0; i < posterImgListLength; i++) {
        wx.saveImageToPhotosAlbum({
          filePath: posterImgList[i],
          success: (res) => {
            if (res.errMsg.match(/fail/)) return

            if (++i === posterImgListLength) {
              this.shareNotice()
              wx.hideLoading()
              wx.showToast({
                icon: 'none',
                title: '已保存至手机相册，快去分享到朋友圈吧',
                duration: 3000
              })
              this.triggerEvent('saved')
            }
          },
          fail: () => wx.hideLoading()
        })
      }
    },
    saveMaterial (num) {
      const isVideo = this.data.isVideo
      const currentImg = this.data.imgList[num]
      const imgUrl = currentImg.indexOf(VIDEO_IMG_SUFFIX) > -1 ? currentImg.replace(VIDEO_IMG_SUFFIX, '') : currentImg
      wx[isVideo ? 'downloadFile' : 'getImageInfo']({
        [isVideo ? 'url' : 'src']: imgUrl,
        success: (sres) => {
          wx[isVideo ? 'saveVideoToPhotosAlbum' : 'saveImageToPhotosAlbum']({
            filePath: (isVideo ? sres.tempFilePath : sres.path),
            complete: ({ errMsg }) => {
              if (num >= (this.data.imgList.length - 1) && errMsg === (isVideo ? 'saveVideoToPhotosAlbum:ok' : 'saveImageToPhotosAlbum:ok')) {
                this.shareNotice()
                wx.showToast({ title: '已保存至手机相册', icon: 'success', duration: 2000 })
                wx.hideLoading()
                this.triggerEvent('saved')
              } else {
                this.saveMaterial(++num)
              }
            }
          })
        }
      })
    },
    shareNotice () {
      // 活动转发
      if (this.data.activeType === 'activity') {
        ApiActivity.forwardAdd({
          data: { activityId: this.data.activeId, type: 1, empId: this.data.empid }
        })
        return
      }
      // 拼团转发
      const empid = wx.getStorageSync('empidCommission')
      if (this.data.activeType === 'group') {
        ApiGroup.forward({
          data: {
            empId: empid,
            groupId: this.data.activeId,
            type: 1 // 类型 1转发 2浏览
          }
        })
        return
      }
      // 以下是普通商品的转发
      if (!this.data.activeType) {
        ApiProduct.transmit({
          data: {
            id: this.data.productId,
            mids: this.data.checkIdList
          }
        })
        ApiUser.transferAdd({
          data: {
            productId: this.data.productId,
            productCode: this.data.productInfo.productCode || '',
            price: this.data.productInfo.price || 0,
            addPrice: 0
          }
        })
      }
    },
    switchChange ({ detail: { value } }) {
      this.setData({ showPrice: value, posterImgList: [] })
      this.getPosterImgList(0)
    }
  }
})
