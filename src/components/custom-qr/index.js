import business from '../../utils/business'
const app = getApp()

Component({
  options: {},
  properties: {},
  data: {
    canvasId: 'my-home-qr',
    canvasWidth: 345,
    canvasHeight: 450,
    headerSrc: ``,
    qrSrc: ``,
    name: ``,
    nickName: ``,
    storeName: ``,
    brandName: ``
  },
  attached () {
    const empid = wx.getStorageSync('empidCommission')
    const scene = business.sceneStringify({ storeId: wx.getStorageSync('storeId'), empid })
    const headerSrc = wx.getStorageSync('headUrl')
    const name = wx.getStorageSync('name')
    const nickName = wx.getStorageSync('nickName')
    const storeName = wx.getStorageSync('storeName')
    const brandName = wx.getStorageSync('brandName')
    const qrSrc = `${app.config.domainPath}/mp/miniapp/qrcode?page=pages/index/index&token=${wx.getStorageSync('token')}&scene=${scene}&width=500`
    this.setData({ qrSrc, headerSrc, name, nickName, storeName, brandName })
    this.staffCreateHomeQr()
  },
  methods: {
    staffCreateHomeQr () {
      Promise.all([
        this.getImageInfo(this.data.headerSrc),
        this.getImageInfo(this.data.qrSrc)
      ]).then(arr => {
        console.log('海报下载成功：', arr)
        this.setData({ headerSrc: arr[0].path, qrSrc: arr[1].path })
        this.staffDraw()
      }).catch(err => {
        console.log('海报下载失败：', err)
      })
    },
    getImageInfo (src) {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src,
          success: (res) => {
            resolve(res)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },
    drawRoundRect (ctx, x, y, w, h, r) { // 绘制圆角矩形
      if (w < 2 * r) {
        r = w / 2
      }
      if (h < 2 * r) {
        r = h / 2
      }
      ctx.beginPath()
      ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
      ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
      ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
      ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
      ctx.closePath()
    },
    staffDraw () {
      // 基础数据
      const { headerSrc, qrSrc, canvasId, canvasWidth, canvasHeight, name, nickName, storeName, brandName } = this.data
      const ctx = wx.createCanvasContext(canvasId, this)
      const centerX = canvasWidth / 2
      // const centerY = canvasHeight / 2
      // 背景数据
      const bgColor = '#fff'
      const bgX = 0
      const bgY = 30
      const bgRadius = 20
      const gapRadius = 10
      const bgLineColor = '#999'
      const bgLineX = 30
      const bgLineY = 160
      const bgLineW = 286
      const bgLineBorderWidth = 1
      // 头像数据
      const headerW = 80
      const headerH = 80
      const headerBorderColor = '#fff'
      const headerBorderWidth = 4
      // 二维码数据
      const qrW = 200
      const qrH = 200
      const qrT = 155 + bgY
      // 文字数据
      const textFirstColor = '#272636'
      const textSecondColor = '#96989C'
      const staffNameFontSize = 20
      const staffNameT = 66 + bgY + staffNameFontSize / 2
      const storeNameFontSize = 13
      const storeNameT = 94 + bgY + storeNameFontSize / 2
      const longTapFontSize = 12
      const longTapT = 370 + bgY + longTapFontSize / 2
      const brandFontSize = 12
      const brandT = 388 + bgY + brandFontSize / 2

      // 画背景区域
      ctx.save()
      ctx.fillStyle = bgColor
      this.drawRoundRect(ctx, bgX, bgY, canvasWidth, canvasHeight - bgY, bgRadius)
      ctx.fill()
      ctx.restore()

      // 画背景缺角
      ctx.save()
      ctx.beginPath()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.arc(0, bgLineY, gapRadius, 0, Math.PI * 2)
      ctx.arc(canvasWidth, bgLineY, gapRadius, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // 画背景虚线
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = bgLineColor
      ctx.lineWidth = bgLineBorderWidth
      ctx.setLineDash([1, 6], 5)
      ctx.moveTo(bgLineX, bgLineY)
      ctx.lineTo(bgLineX + bgLineW, bgLineY)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // 画头像边框
      ctx.save()
      ctx.beginPath()
      ctx.fillStyle = headerBorderColor
      ctx.arc(centerX, headerH / 2 + headerBorderWidth, headerH / 2 + headerBorderWidth, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // 画头像
      ctx.save()
      ctx.beginPath()
      ctx.fillStyle = headerBorderColor
      ctx.arc(centerX, headerH / 2 + headerBorderWidth, headerH / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()
      ctx.clip()
      ctx.drawImage(headerSrc, centerX - headerW / 2, headerBorderWidth, headerW, headerH)
      ctx.restore()

      // 画导购名称
      ctx.save()
      ctx.fillStyle = textFirstColor
      ctx.font = `normal bold ${staffNameFontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(name || nickName, centerX, staffNameT)
      ctx.restore()

      // 画门店名称
      ctx.save()
      ctx.fillStyle = textSecondColor
      ctx.font = `normal normal ${storeNameFontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(storeName, centerX, storeNameT)
      ctx.restore()

      // 画二维码
      ctx.save()
      ctx.drawImage(qrSrc, centerX - qrW / 2, qrT, qrW, qrH)
      ctx.restore()

      // 画长按描述
      ctx.save()
      ctx.fillStyle = textSecondColor
      ctx.font = `normal normal ${longTapFontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`长按识别小程序码`, centerX, longTapT)
      ctx.restore()

      // 画品牌名称
      ctx.save()
      ctx.fillStyle = textSecondColor
      ctx.font = `normal normal ${brandFontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`进入${brandName}官方商城`, centerX, brandT)
      ctx.restore()

      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          quality: 1,
          canvasId,
          success: (res) => {
            this.triggerEvent('canvas2img', {
              path: res.tempFilePath,
              width: canvasWidth,
              height: canvasHeight
            })
          },
          fail (res) {
            console.log('canvasToTempFilePath fail: ', res)
          }
        }, this)
      })
    }
  }
})
