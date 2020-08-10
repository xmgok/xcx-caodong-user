// const app = getApp()

module.exports = {
  ratio: null,

  // 根据屏幕宽度计算px比率
  getPxRatio () {
    let ratio = this.ratio
    if (!ratio) {
      const res = wx.getSystemInfoSync()
      ratio = res.screenWidth / 750
      this.ratio = ratio
    }

    return ratio
  },

  rpx2px (value) {
    return value * this.getPxRatio()
  },

  px2rpx (value) {
    return value / this.getPxRatio()
  },

  /**
   * x: [矩形x坐标]
   * y: [矩形y坐标]
   * w: [矩形宽度]
   * h: [矩形高度]
   * r: [矩形圆角半径]
   * sk: [矩形线框样式]
   * src: [填充图片的地址]
   * ox: [矩形阴影x偏移]
   * oy: [矩形阴影y偏移]
   * blur: [矩形阴影模糊度]
   */
  drawRoundRect (x, y, w, h, r, sk, src, ox, oy, blur) {
    const ctx = this.ctx
    const drawing = true

    // 先保存状态
    ctx.save()

    if (drawing) {
      // 开始绘制
      ctx.beginPath()
      ctx.setFillStyle('#ffffff')
      if (sk) {
        ctx.setLineWidth(this.rpx2px(1))
        ctx.setStrokeStyle(sk)
      }
      // 设置图形
      ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
      ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
      ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
      ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
      ctx.closePath()

      // 设置阴影
      if (blur) ctx.setShadow(ox, oy, blur, 'rgba(210, 210, 210, 1)')
      if (sk) ctx.stroke()
      else ctx.fill()

      ctx.clip()
    }
    // 绘制图片
    if (src) {
      ctx.drawImage(src, x, y, w, h)
    }
    ctx.restore()
    ctx.setShadow(0, 0, 0, '#ffffff')
    // ctx.draw(true);

    return this
  },

  /**
   * 绘制多行文本
   *
   * txt: [要绘制的大段文本]
   * w:   [一行宽度]
   * x:   [起始x坐标]
   * y:   [起始y坐标]
   * lh:  [行高]
   * ln:  [行数]
   * fs:  [字体大小]
   * c:   [字体颜色]
   */
  drawParagraph (txt, w, x, y, lh, ln, fs, c) {
    const ctx = this.ctx
    // 测量文本宽度
    ctx.setFontSize(fs)
    const tw = ctx.measureText(txt).width
    const lineArr = []
    if (tw > w) {
      let i = 0
      let lw = 0
      txt.split('').forEach(t => {
        if (!lineArr[i]) lineArr[i] = ''
        lineArr[i] += t
        lw = ctx.measureText(lineArr[i]).width
        if (lw >= w) i++
      })
    } else {
      lineArr.push(txt)
    }

    if (fs) ctx.setFontSize(fs)
    if (c) ctx.setFillStyle(c)
    lineArr.forEach((line, i) => {
      // 最后一行加...
      if (lineArr.length > ln && i === ln - 1) {
        const arr = line.split('')
        arr.pop()
        arr.push('...')
        line = arr.join('')
      }

      if (i < ln) ctx.fillText(line, x, y + lh * (i + 1))
    })
  },

  // 从网络地址获取图片信息
  reqPics (pics) {
    const getImageInfo = (src) => {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src,
          success (res) {
            resolve(res)
          },
          fail (res) {
            console.log(res)
          }
        })
      })
    }

    const requests = []
    pics.forEach((item) => {
      // item = item.replace(/^http:/, 'https:')
      requests.push(getImageInfo(item))
    })
    return Promise.all(requests).then(res => {
      // res.forEach((item, i) => {
      //   if (pics[i].match(/^https?:/)) {
      //     pics[i] = item.path
      //   }
      // })
      return res
    }).catch(err => err)
  },

  /**
   * 截取字符串
   * @param {string} text 原始字符串
   * @param {number} num 截取位数
   * @returns {string} 返回截取后的字符串
   */
  substringText (text = '', num = 12 * 3) {
    const re = /^[\u4e00-\u9fa5]+$/
    let now = 0
    let arr = []
    text = text.replace(/[\r\n]/ig, '')
    text.split('').forEach(v => {
      if (re.test(v)) {
        now += 1
      } else {
        now += 0.5
      }
      if (now <= num) {
        arr.push(v)
      }
    })
    return arr.join('')
  }
}
