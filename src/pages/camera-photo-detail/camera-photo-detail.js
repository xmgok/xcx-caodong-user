const ApiGroupPhoto = require('../../api/group-photo')

Page({
  data: {
    id: '',
    device: 'front',
    frame: {
      '1': 'https://qiniu.icaodong.com/photo/frame1.png?3',
      '2': 'https://qiniu.icaodong.com/photo/frame2.png?3'
    },
    product: {
      '1': 'https://qiniu.icaodong.com/photo/product1.png?3',
      '2': 'https://qiniu.icaodong.com/photo/product2.png?3'
    },
    peopleImgList: [],
    peopleImgIndex: 0,
    showMorePeople: false,
    createCanvasIng: false,
    oldPhoto: '',
    isAndroid: false,
    isHorizontal: false,
    info: {},
    imgWidth: '',
    imgHeight: '',
    imgLeft: 0,
    imgBottom: 0,
    touchX: 0,
    touchY: 0,
    startX: 0,
    startY: 0
  },
  onLoad () {
    wx.showLoading({ title: '加载中' })
    ApiGroupPhoto.info({
      success: ({ data }) => {
        this.setData({ info: data, isAndroid: wx.getSystemInfoSync().system.toLocaleLowerCase().indexOf('android') > -1 })
        this.setPeopleImgList()
        wx.hideLoading()
        ApiGroupPhoto.forward({
          data: {
            empId: wx.getStorageSync('empidCommission'),
            forwarderId: wx.getStorageSync('userid') || wx.getStorageSync('empid'),
            groupPhotoId: data.id,
            type: 2
          }
        })
      }
    })
  },
  setPeopleImgList () {
    const info = this.data.info
    let peopleImgList = this.data.isHorizontal ? info.photoList2 : info.photoList
    wx.createSelectorQuery().select('.zw').boundingClientRect((res) => {
      peopleImgList.forEach((item) => {
        item._width = res.width
        item._height = item.height / (item.width / res.width)
      })
      this.setData({ peopleImgList, imgWidth: peopleImgList[this.data.peopleImgIndex]._width, imgHeight: peopleImgList[this.data.peopleImgIndex]._height })
    }).exec()
  },
  onResize ({ size }) {
    this.setData({ isHorizontal: size.windowWidth > size.windowHeight, peopleImgIndex: 0 })
    setTimeout(() => this.setPeopleImgList(), 100)
  },
  handleTap () {
    getCurrentPages().length > 1 ? wx.navigateBack({ delta: 1 }) : wx.switchTab({ url: '/pages/index/index' })
  },
  onShowMorePeople () {
    if (this.data.peopleImgList.length <= 1) {
      wx.showToast({ icon: 'none', title: '暂无更多模板', duration: 3000 })
      return
    }
    if (this.data.isAndroid || this.data.isHorizontal) {
      let peopleImgIndex = ++this.data.peopleImgIndex
      this.setData({ peopleImgIndex: peopleImgIndex > this.data.peopleImgList.length - 1 ? 0 : peopleImgIndex })
    } else {
      this.setData({ showMorePeople: true })
    }
  },
  closeMorePeople ({ detail }) {
    this.setData({ showMorePeople: false, peopleImgIndex: detail.index || 0 })
  },
  changeDevice () {
    this.setData({ device: this.data.device === 'front' ? 'back' : 'front' })
  },
  openSetting () {
    wx.getSetting({
      success: ({ authSetting }) => {
        if (authSetting['scope.writePhotosAlbum'] !== undefined && authSetting['scope.writePhotosAlbum'] === false) {
          wx.openSetting()
        } else {
          this.takePhoto()
        }
      }
    })
  },
  takePhoto () {
    ApiGroupPhoto.record({
      data: {
        groupPhotoId: this.data.info.id,
        type: 4,
        photoUrl: this.data.peopleImgList[this.data.peopleImgIndex].url
      }
    })
    wx.createCameraContext().takePhoto({
      quality: 'high',
      success: ({ tempImagePath }) => {
        this.setData({ createCanvasIng: true })
        const ctx = wx.createCanvasContext('myCanvas', this)
        wx.getImageInfo({
          src: tempImagePath,
          success: ({ path }) => {
            wx.createSelectorQuery().select('.zw').boundingClientRect((res) => {
              ctx.drawImage(path, 0, 0, res.width, res.height)
              this.drawPeople(ctx)
            }).exec()
          }
        })
      }
    })
  },
  drawPeople (ctx) {
    wx.getImageInfo({
      src: this.data.peopleImgList[this.data.peopleImgIndex].url,
      success: ({ path }) => {
        wx.createSelectorQuery().select('.people-img').boundingClientRect(({ width, height, left, top }) => {
          ctx.drawImage(path, left, top, width, height)
          this.drawFrame(ctx)
        }).exec()
      }
    })
  },
  drawFrame (ctx) {
    wx.getImageInfo({
      src: this.data.frame[this.data.isHorizontal ? '2' : '1'],
      success: ({ path }) => {
        wx.createSelectorQuery().select('.frame').boundingClientRect(({ width, height, left, top }) => {
          ctx.drawImage(path, left, top, width, height)
          this.drawProduct(ctx)
        }).exec()
      }
    })
  },
  drawProduct (ctx) {
    wx.getImageInfo({
      src: this.data.product[this.data.isHorizontal ? '2' : '1'],
      success: ({ path }) => {
        wx.createSelectorQuery().select('.sdff').boundingClientRect(({ width, height, left, top }) => {
          ctx.drawImage(path, left, top, width, height)
          ctx.draw()
          setTimeout(() => this.saveCanvas(), 300)
        }).exec()
      }
    })
  },
  saveCanvas () {
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: ({ tempFilePath }) => {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: ({ errMsg }) => {
            this.setData({ createCanvasIng: false })
            if (errMsg.match(/fail/)) return
            this.setData({ oldPhoto: tempFilePath })
            wx.showToast({ icon: 'none', title: '已保存至手机相册，快去分享到朋友圈吧', duration: 3000 })
          },
          fail: () => {
            this.setData({ createCanvasIng: false })
            wx.showToast({ icon: 'none', title: '保存失败，请在右上角点开设置，打开相册权限', duration: 5000 })
          }
        })
      }
    })
  },
  previewImage () {
    if (!this.data.oldPhoto) return
    wx.previewImage({ urls: [this.data.oldPhoto] })
  },
  onShareAppMessage () {
    const userid = wx.getStorageSync('userid')
    const empId = userid ? wx.getStorageSync('empidCommission') : wx.getStorageSync('empid')
    ApiGroupPhoto.forward({
      data: {
        empId,
        forwarderId: userid || wx.getStorageSync('empid'),
        groupPhotoId: this.data.info.id,
        ...this.data.forwardData,
        type: 1 // 类型 1转发 2浏览
      }
    })

    const path = `/pages/camera-photo/camera-photo?${userid ? `&userid=${userid}` : ''}${empId ? `&empid=${empId}` : ''}&storeId=${wx.getStorageSync('storeId')}`
    return { path, title: '活动详情' }
  },
  uploadScaleStart ({ touches }) {
    if (touches.length === 1) {
      this.setData({ touchX: touches[0].clientX, touchY: touches[0].clientY })
    }
  },
  uploadScaleMove ({ touches }) {
    if (touches.length === 1) {
      const imgLeft = this.data.startX + touches[0].clientX - this.data.touchX
      const imgBottom = this.data.startY - touches[0].clientY + this.data.touchY
      this.setData({ imgLeft, imgBottom })
    }
  },
  uploadScaleEnd () {
    this.setData({
      startX: this.data.imgLeft || this.data.startX,
      startY: this.data.imgBottom || this.data.startY
    })
  },
  zoomBig () {
    const imgWidth = this.data.imgWidth * 1.02
    const imgHeight = this.data.imgHeight * 1.02
    this.setData({ imgWidth, imgHeight })
  },
  zoomSmall () {
    const imgWidth = this.data.imgWidth * 0.98
    const imgHeight = this.data.imgHeight * 0.98
    this.setData({ imgWidth, imgHeight })
  }
})
