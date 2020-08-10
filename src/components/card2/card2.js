import business from '../../utils/business'
const app = getApp()

Component({
  options: {},

  properties: {
    item: {
      type: Object,
      value: {
        img: 'http://f.hiphotos.baidu.com/zhidao/pic/item/d788d43f8794a4c240e9466f0ef41bd5ac6e39af.jpg',
        title: '迷阵2018新款雪纺衫夏民族风外搭印花沙滩开衫中长款防晒衣外套女',
        num: '3422',
        price: '99.90',
        id: '666'
      }
    }
  },

  data: {
    userType: '',
    imgList: []
  },

  attached () {
    this.setData({
      userType: wx.getStorageSync('userType')
    })
  },

  ready () {
  },

  methods: {
    showShare (e) {
      const dataset = e.currentTarget.dataset
      const resData = dataset.item
      let scene = business.sceneStringify({
        pageId: 1,
        storeId: wx.getStorageSync('storeId'),
        activeType: 'group',
        activeId: resData.id,
        id: resData.productId,
        empid: wx.getStorageSync('empidCommission'),
        userid: wx.getStorageSync('userid')
      })
      this.setData({
        showShare: true,
        imgList: [resData.productImg],
        shareText: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
        shareUrl: business.scene2Qr(scene, app)
      })
    }
  }
})
