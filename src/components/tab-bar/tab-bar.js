Component({
  options: {},

  properties: {
    useCoverView: {
      type: Boolean,
      value: false
    },
    tabBarIndex: {
      type: Number,
      value: 3
    }
  },

  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    list: [
      {
        'pagePath': '/pages/index/index',
        'text': '首页',
        'iconPath': '/images/icon/home.png',
        'selectedIconPath': '/images/icon/home-selected.png'
      },
      {
        'pagePath': '/pages/category/category',
        'text': '分类',
        'iconPath': '/images/icon/category.png',
        'selectedIconPath': '/images/icon/category-selected.png'
      },
      {
        'pagePath': '/pages/explore/explore',
        'text': '发现',
        'iconPath': '/images/icon/explore.png',
        'selectedIconPath': '/images/icon/explore-selected.png'
      },
      {
        'pagePath': '/pages/cart/cart',
        'text': '购物车',
        'iconPath': '/images/icon/cart.png',
        'selectedIconPath': '/images/icon/cart-selected.png'
      },
      {
        'pagePath': '/pages/my/my',
        'text': '我的',
        'iconPath': '/images/icon/profile.png',
        'selectedIconPath': '/images/icon/profile-selected.png'
      }
    ]
  },
  methods: {
    goLink (e) {
      wx.reLaunch({ url: e.currentTarget.dataset.url })
    }
  }
})
