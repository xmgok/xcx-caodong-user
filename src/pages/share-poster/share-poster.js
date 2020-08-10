import draw from '../../utils/draw'
import variables from '../../utils/variables'
import business from '../../utils/business'
const ApiProduct = require('../../api/product')
const ApiUser = require('../../api/user')

const app = getApp()
const VIDEO_IMG_SUFFIX = app.VIDEO_IMG_SUFFIX

Page({
  data: {
    imgList: [],
    checkId: [],
    current: 0,
    posterHeight: '',
    productId: '',
    productInfo: {},
    typeList: ['商品图片', '商品海报'],
    typeIndex: 1,
    shareUrl: '',
    isVideo: false
  },

  onLoad ({ params = '', chooseimg, productId = '', checkId = '' }) {
    params = business.queryParse(params)
    if (Object.keys(params).length) {
      chooseimg = params.chooseimg || chooseimg
      productId = params.productId || productId
      checkId = params.checkId || checkId
    }

    const imgList = chooseimg.replace(/,$/, '').split(',')
    let isVideo = false
    if (imgList[0].indexOf(VIDEO_IMG_SUFFIX) > -1) {
      isVideo = true
    }
    const empid = wx.getStorageSync('empidCommission')
    const activeId = this.data.activeId
    const activeType = this.data.activeType
    const scene = business.sceneStringify({
      storeId: wx.getStorageSync('storeId'),
      id: this.data.productId,
      empid: empid,
      activeId: activeId,
      activeType: activeType
    })
    const shareUrl = `${app.config.domainPath}/procuct/qrcode?token=${wx.getStorageSync('token')}&scene=${scene}`
    this.setData({ isVideo, imgList: imgList, productId, shareUrl, checkId: checkId.split(',') })
    console.log(shareUrl)
    this.getDetails()
    this.ctx = wx.createCanvasContext('posterCanvas')
  },
  changeSwiper ({ detail }) {
    this.setData({ current: detail.current })
  },
  bindTypeIndexChange ({ detail }) {
    this.setData({ typeIndex: detail.value })
    if (+detail.value === 1) wx.showLoading()
  },
  getDetails () {
    ApiProduct.getInfo({
      params: { id: this.data.productId },
      success: ({ data }) => {
        this.setData({ productInfo: data })
      }
    })
  },
  ...draw,
  // 分享，获取所有要绘制的图片
  getDrawPic () {
    return this.reqPics([
      this.data.imgList[this.data.current],
      this.data.shareUrl
    ])
  },
  saveImage () {
    wx.showLoading({ title: '保存中' })
    wx.saveImageToPhotosAlbum({
      filePath: this.posterImage,
      success: (res) => {
        if (res.errMsg.match(/fail/)) return

        this.setData({ current: this.data.current + 1 })
        if (this.data.current < this.data.imgList.length) {
          this.download()
        } else {
          ApiProduct.transmit({
            data: {
              id: this.data.productId,
              mids: this.data.checkId
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
          this.setData({ current: 0 })
          wx.hideLoading()

          wx.showToast({
            icon: 'none',
            title: '已保存至手机相册，快去分享到朋友圈吧',
            duration: 3000
          })
        }
      },
      fail: () => wx.hideLoading()
    })
  },
  // 绘制海报
  drawPoster (drawPics) {
    const ctx = this.ctx
    ctx.setFillStyle('#ffffff')

    if (!drawPics) return
    const [goodsImg, qrImg] = drawPics

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
    // 设置海报尺寸
    ctx.fillRect(0, 0, goodsImgWidth, posterHeight)
    this.setData({ posterHeight: posterHeight })

    // 设置海报边框
    ctx.setStrokeStyle('#f2f2f2')
    ctx.strokeRect(0, 0, goodsImgWidth, posterHeight)

    // 画商品图
    this.drawRoundRect(0, 0, goodsImgWidth, goodsImgHeight, 0, 0, goodsImg.path)

    // 绘制标题
    ctx.setFontSize(15)
    const title = (this.data.productInfo.name || '')
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

    // 绘制价格
    ctx.setFontSize(17)
    ctx.setFillStyle(variables.$primary)
    ctx.fillText('¥', 17, contentTop + 88)
    ctx.setFontSize(22)
    ctx.fillText((this.data.productInfo.price || ''), 30, contentTop + 88)

    // 画二维码图
    ctx.drawImage(qrImg.path, 185 + 50, contentTop, 92, 92)
    console.log('qr', qrImg)
    // 绘制维码图下提示文字
    ctx.setFontSize(11)
    ctx.setFillStyle('#96989c')
    ctx.fillText('长按查看商品详情', 185 + 50 + 2, contentTop + 92 + 14)

    // 绘制到画布上
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        quality: 1,
        canvasId: 'posterCanvas',
        success: ({ tempFilePath }) => {
          this.posterImage = tempFilePath
          this.saveImage()
        },
        fail (res) {
          console.log('canvasToTempFilePath fail: ', res)
        }
      })
    })
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
  saveImg () {
    if (this.data.typeIndex > 0) {
      this.getDrawPic().then((drawPics) => {
        this.drawPoster(drawPics)
      })
    } else {
      this.saveImg2()
    }
  },
  saveImg2 () {
    wx.showLoading({ title: '保存中' })
    this.doSave(0)
  },
  doSave (num) {
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
              ApiProduct.transmit({
                data: {
                  id: this.data.productId,
                  mids: this.data.checkId
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
              wx.showToast({ title: '保存成功', icon: 'success', duration: 2000 })
              wx.hideLoading()
            } else {
              this.doSave(++num)
            }
          }
        })
      }
    })
  },
  bindImageLoad (e) {
    wx.hideLoading()
  }
})
