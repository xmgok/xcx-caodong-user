Page({
  data: {
    userImg: 'https://qmfx-s39210.s3.fy.shopex.cn/gpic/20150828/ddd59983b62c19555f634663f36f3693.jpg',
    userName: '郝美丽'
  },
  onLoad () {
    wx.setNavigationBarTitle({ title: this.data.userName })
  }
})
