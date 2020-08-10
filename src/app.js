import { VIDEO_IMG_SUFFIX } from './utils/consts'
import business from './utils/business'
import qiniuUploader from './utils/qiniuUploader'

// 小程序配置
const config = business.getAppConfig({
  // 启用第三方托管，否则使用下方的配置独立发版
  extEnable: true,

  domainPathEnv: 'apidev',
  appid: 'wxfa0d734f7133e5b2'
})

App({
  globalData: {
    hasSwitchStore: false, // 是否手动切换门店了 - 切换了之后文案会变化
    isAuthLocation: false, // 是否授权地理位置了
    longitude: '121.513610',
    latitude: '31.205610',
    iPhoneXh: 68 // iPhone X 距底差值是68rpx
  },

  data: {
    isLogin: false
  },

  onLaunch (opts) {
    console.log('onLaunch', opts)
    this.init(opts)
    this.deviceCompatibility()
    business.checkForUpdate()

    wx.onAppRoute((route) => {
      this.eventTrackingEnter(route)
      this.authorization(route)
    })
  },

  onShow (opts) {
    console.log('app onShow', opts)
    const { referrerInfo, query = {} } = opts

    // 用于在易宝支付时显示订单信息
    if (referrerInfo && referrerInfo.extraData) {
      this.data.extraData = referrerInfo.extraData
    }

    this.reLogin(query)
    this.distributorCheck()
  },

  onHide () {
    this.eventTrackingLeave()
  },

  init (opts) {
    this.globalData = {
      ...this.globalData,
      query: {
        ...opts.query,
        ...business.sceneParse(opts.query.scene)
      },
      // 解决重定向后，scene丢失的问题
      onLaunchScene: opts.scene
    }

    // 打开小程序就获取会员信息，以防止修改会员等级
    this.ajax({ url: '/user/getuser', type: 'get' })
  },

  // 处理需重新登录的情形
  reLogin (query) {
    const scene = business.sceneParse(query.scene)
    const [empid, userid, storeCode, storeId] =
      ['empid', 'userid', 'storeCode', 'storeId']
        .map(v => scene[v] || query[v])

    // 通过storeCode进入时，不能带empid，因后端优先使用empid，否则无法切换到对应门店。
    // 后端比对storeCode如果和自身不同则切换身份为消费者
    if (storeCode || storeId) {
      wx.removeStorageSync('empidResetRoleAndStore')
      // 通过storeCode进入不再统计业绩
      wx.removeStorageSync('empidCommission')
      wx.removeStorageSync('empidOldValue')
      // 导购转发（用来计算返佣）
      empid && wx.setStorageSync('empidCommission', empid)

      this.login({ storeCode, storeId, empid, userid })
      return
    }

    // 导购转发 - 存在没storeId但是有empid的场景
    if (empid) {
      // 防止点了员工转发的再点消费者转发的不切门店
      wx.removeStorageSync('useridOldValue')
      const oldEmpid = wx.getStorageSync('empidOldValue')
      if (+empid === +oldEmpid) {
        this.distributorCheck(empid)
        return
      }
      // 用来切换身份和门店
      wx.setStorageSync('empidResetRoleAndStore', empid)
      // 判断是否切换身份为消费者以及切换门店
      wx.setStorageSync('empidOldValue', empid)
      // 用来计算返佣
      wx.setStorageSync('empidCommission', empid)

      this.login()
      return
    }

    // 消费者转发 - 消费者转发拼团和活动时参数上会带userid，用来切换门店（普通商品不能被消费者转发）
    if (userid) {
      // 如果是消费者转发，则清理掉，不计返佣，因为如果是不同门店，没法计算
      wx.removeStorageSync('empidCommission')
      // 因empidCommission清理了，如果这个不清理，二次点击员工转发的无法记录empidCommission
      wx.removeStorageSync('empidOldValue')

      const oldUserid = wx.getStorageSync('useridOldValue')
      if (+userid === +oldUserid) return

      // 把userid当做empid，用以更换门店
      wx.setStorageSync('empidResetRoleAndStore', userid)
      // 修复二次进入还会登录的问题
      wx.setStorageSync('useridOldValue', userid)

      this.login()
      return
    }

    // FIXED 老用户没打登录直接点进，首页空白的问题
    // 无法确认用户身份，则打接口确认用户身份
    // 老数据中没有userType字段，如果之前登陆过了，则进入首页时会空白
    if (!this.data.isLogin && !wx.getStorageSync('userType')) {
      this.login()
    }
  },

  // 是否是分销商（传empid检测转发人，否则检测当前用户）
  distributorCheck (empid) {
    const isDistributor = (duserId, cb) => {
      this.ajax({
        url: '/distributionPay/isDistributor',
        type: 'post',
        data: { duserId },
        success: ({ data }) => cb(data)
      })
    }

    // 检测转发人是否是分销商（分销商转发带的也是empid）
    if (empid) {
      isDistributor(empid, (data) => {
        let parentIsSeller = data.distributor
        if (wx.getStorageSync('userType') === 'staff') parentIsSeller = false
        wx.setStorageSync('parentIsSeller', parentIsSeller)
        if (!parentIsSeller) return

        this.ajax({
          url: '/distributionPay/shopInfo',
          type: 'post',
          data: { duserId: empid },
          success: ({ data }) => {
            wx.setStorageSync('storeName', data.shopName)
          }
        })
      })
      return
    }

    // 检测当前用户是否是分销商
    const storeId = wx.getStorageSync('storeId')
    const loginId = wx.getStorageSync('loginId')
    if (loginId && storeId) {
      isDistributor(loginId, (data) => {
        let isSeller = data.distributor
        // 如果分销商门店和当前所处门店不同，则不算分销商
        if (storeId !== data.storeId) isSeller = false

        if (isSeller) {
          wx.setStorageSync('empid', loginId)
          wx.setStorageSync('empidCommission', loginId)
        }
        wx.setStorageSync('isSeller', isSeller)
      })
    }
  },

  // 数据埋点 - 进入页面（用户行为统计）
  eventTrackingEnter (route) {
    console.log('eventTrackingEnter', route)
    this.globalData.currentPageRouteData = route

    const { openType, query, scene } = route
    const data = {
      openType,
      path: route.path,
      query: {
        ...query,
        ...business.sceneParse(query.scene)
      }
    }

    const { onLaunchScene, actionAddCode: code } = this.globalData
    if (scene || onLaunchScene) data.scene = scene || onLaunchScene
    if (code !== undefined) data.code = code

    this.actionAdd({
      data,
      success: ({ data }) => {
        delete this.globalData.onLaunchScene
        this.globalData.actionAddCode = data
      }
    })
  },

  // 数据埋点 - 离开页面（用户行为统计）
  eventTrackingLeave () {
    const route = this.globalData.currentPageRouteData
    console.log('eventTrackingLeave', route)
    if (!route) return

    const { openType, path, query } = route
    const data = {
      actionType: 3,
      openType,
      path,
      query: {
        ...query,
        ...business.sceneParse(query.scene)
      }
    }
    this.actionAdd({ data })
    delete this.globalData.actionAddCode
  },

  // 数据埋点
  actionAdd (options) {
    this.ajax({
      url: '/action/add',
      type: 'post',
      ...options,
      success (res) {
        if (options.success) options.success(res)
      }
    })
  },

  // 授权
  authorization (route) {
    const AUTHORIZATION_PAGE = '/pages/authorization/authorization'
    const token = wx.getStorageSync('token')

    // 无需授权头像页面白名单
    const headUrlWhitelist = [
      'pages/camera-photo/camera-photo',
      'pages/setting-edit/setting-edit',
      'pages/setting/setting',
      'pages/authorization/authorization',
      'pages/order-detail/order-detail',
      'pages/order-list/order-list',
      'pages/order-confirm/order-confirm',
      'pages/search-panel/search-panel',
      'pages/search/search',
      'pages/product/product',
      'pages/index/index',
      'pages/category/category',
      'pages/explore/explore',
      'pages/cart/cart',
      'pages/my/my'
    ]
    // 需授权手机号页面
    const mobileAuthorizePages = [
      'pages/order-confirm/order-confirm',
      'pages/camera-photo/camera-photo',
      'pages-subpackages/seller/pages/seller-request/index'
    ]

    const { fullPath, path } = business.getCurrentPage()
    // 导购转发的，消费者进来也需要授权头像
    if (!~headUrlWhitelist.indexOf(route.path) || route.query.empid) {
      if ((!wx.getStorageSync('nickName') || !wx.getStorageSync('headUrl')) &&
        path !== AUTHORIZATION_PAGE &&
        token) {
        wx.redirectTo({ url: `${AUTHORIZATION_PAGE}?refererUrl=${encodeURIComponent(fullPath)}` })
        return
      }
    }

    // 授权手机号
    if (~mobileAuthorizePages.indexOf(route.path)) {
      if (!wx.getStorageSync('mobile') &&
        path !== AUTHORIZATION_PAGE &&
        token) {
        wx.redirectTo({ url: `${AUTHORIZATION_PAGE}?refererUrl=${encodeURIComponent(fullPath)}&type=phoneAuth` })
      }
    }
  },

  // 机型兼容
  deviceCompatibility () {
    wx.getSystemInfo({
      success: (res) => {
        const {
          isIPhoneNotch, isIPad,
          statusBarHeight, titleBarHeight, headerHeight
        } = business.systemInfo(res)
        wx.setStorageSync('iPhoneX', isIPhoneNotch)
        wx.setStorageSync('iPad', isIPad)

        // 自定义导航栏高适应性动态计算
        this.globalData.statusBarHeight = statusBarHeight
        this.globalData.titleBarHeight = titleBarHeight
        this.globalData.headerHeight = headerHeight
      },
      fail: () => {
        this.globalData.statusBarHeight = 0
        this.globalData.titleBarHeight = 0
        this.globalData.headerHeight = 0
      }
    })
  },

  // 获取临时登录凭证code
  login (query) {
    if (this.data.isLogin) return
    this.data.isLogin = true
    wx.showLoading({ title: '登录中' })

    wx.login({
      success: ({ code }) => {
        let loginData = { code, authAppId: this.config.appid }
        if (query) {
          ['storeCode', 'storeId', 'empid', 'userid', 'redirectUrl', 'navigatorOpenType'].forEach((item) => {
            if (query[item]) loginData[item] = query[item]
          })
        }

        const empidResetRoleAndStore = wx.getStorageSync('empidResetRoleAndStore')
        if (empidResetRoleAndStore) {
          // 带了empid就会变成消费者并切换门店为对应empid的门店
          loginData.empid = empidResetRoleAndStore
        }

        wx.getLocation({
          success: res => {
            loginData.latitude = String(res.latitude)
            loginData.longitude = String(res.longitude)
            this.globalData.isAuthLocation = true
            this.loginBack(loginData)
          },
          fail: () => {
            this.globalData.isAuthLocation = false
            loginData.latitude = this.globalData.latitude
            loginData.longitude = this.globalData.longitude
            this.loginBack(loginData)
          }
        })
      },
      fail: ({ errMsg }) => {
        wx.showToast({ title: `${errMsg}`, icon: 'none', duration: 3000 })
      }
    })
  },

  // 登录
  loginBack (loginData) {
    const redirectUrl = loginData.redirectUrl
    delete loginData.redirectUrl

    this.ajax({
      hasToken: false,
      url: '/user/login',
      data: loginData,
      success: ({ data }) => {
        this.data.isLogin = false
        wx.hideLoading()

        // 消费者打登录一直带着empid(如果点过别人的转发)用以切换门店。
        // 员工清除掉是为了防止员工点进自己转发的商品身份变为消费者
        if (wx.getStorageSync('userType') === 'staff') {
          wx.removeStorageSync('empidResetRoleAndStore')
        }

        business.loginSetStorage(data, this)

        const { fullPath, pages } = business.getCurrentPage()
        // 切换为消费者，切换完毕进行页面重定向
        if (redirectUrl) {
          wx.reLaunch({ url: redirectUrl })
          return
        }
        // 跳首页
        if (pages.length <= 0) {
          wx.reLaunch({ url: '/pages/index/index' })
          return
        }
        wx.reLaunch({ url: fullPath })
      },
      fail: () => {
        this.data.isLogin = false
        wx.hideLoading()
      }
    })
  },

  ajax (options) {
    // 登录中不允许请求其它接口
    if (this.data.isLogin && options.url !== '/user/login') return

    const token = wx.getStorageSync('token')
    if (!token && options.url !== '/user/login') { // token不存在不能说明没有登陆过，入参上有empid还是要带过去的。
      const { storeCode, storeId, empid, userid } = this.globalData.query
      this.login({ storeCode, storeId, empid, userid }) // 修复初次登陆(无token时)带不上empid和storeId的问题。
      return
    }

    options.url = `${config.domainPath}${options.url}`
    options.method = options.type || 'POST'
    options.header = {
      'content-type': 'application/json'
    }
    if (options.hasToken !== false) {
      options.header.token = token
    }

    const v = '2.6.0' // 版本号

    // post params
    options.data = options.data || {}
    options.data.v = v // 微信自带的请求，只需要传data即可。二次封装里为毛要处理params？
    // get params
    if (options.params) {
      let params = ''
      Object.keys(options.params).forEach((item) => {
        // IMPORTANT 在小米、魅族的某些低端机型中，传带空格的参数未编码会导致400错误
        params += `${item}=${encodeURIComponent(options.params[item])}&`
      })
      params = params.substr(0, params.length - 1)
      options.url = `${options.url}?${params}`
    }

    // 成功回调
    if (options.success) {
      const success = options.success
      options.success = ({ data }) => {
        try {
          // 不可见字符(小红点)导致本应被处理为json对象的data被处理为了json字符串。
          if (data.replace) {
            /* eslint-disable no-control-regex */
            const re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g
            data = JSON.parse(data.replace(re, ''))
            console.log('数据因不可见字符(小红点)被兼容处理了，处理后的数据为：', data)
          }
        } catch (e) {}

        // token无效，员工端和消费者端都自动登录
        if (data.code === 'UNAUTHORIZED') {
          this.login()
        } else if (data.status !== 200) {
          wx.showToast({ title: `${data.message || data.status}`, icon: 'none', duration: 3000 })
          // 失败回调
          if (options.fail) options.fail(data)
        } else {
          success(data)
        }
      }
    }

    wx.request(options)
  },

  getQiniuToken (callback) {
    this.ajax({
      url: `/qiniu/uptoken`,
      type: 'get',
      success: (res) => {
        callback(res)
      }
    })
  },

  upload (filePath, cb) {
    this.getQiniuToken((qiniuInfo) => {
      qiniuInfo = qiniuInfo.data || {}
      const suffix = filePath.split('.')
      qiniuUploader.upload(filePath, (res) => cb(res), (error) => console.log('error: ' + error), {
        key: `${config.tenantId}_${new Date().getTime()}_${String(Math.random()).substr(10)}.${suffix[suffix.length - 1]}`,
        region: 'ECN',
        uploadURL: config.uploadImgPath,
        domain: qiniuInfo.domain,
        uptoken: qiniuInfo.uptoken,
        shouldUseQiniuFileName: false // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
      })
    })
  },

  config,

  VIDEO_IMG_SUFFIX
})
