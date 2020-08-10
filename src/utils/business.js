import { SCENE_PARAM_MAP } from './consts'

/**
 * 获取小程序配置（托管和独立发版方式）
 * @param options 配置选项
 * - appid
 * - {string} domainPath 接口地址。当 mode 为 template 时用 {domainPathEnv} 字符串用于占位替换
 * - {string} domainPathEnv 接口地址开发、预发、线上等环境
 * - {boolean} extEnable 是否开启第三方托管方式。默认不开启
 * - {string} mode 模板模式，让接口地址支持替换模板变量。支持值：template
 * @returns {object} 返回 { appid, domainPath, uploadImgPath }
 */
export function getAppConfig (options) {
  const config = {
    uploadImgPath: 'https://up.qbox.me'
  }

  // 第三方托管
  if (options.extEnable) {
    Object.assign(config, wx.getExtConfigSync ? wx.getExtConfigSync() : {})
    const tip = (msg) => wx.showModal({ title: '提示', content: `无法获取第三方平台自定义${msg}` })
    if (!config.appid) {
      tip('appid')
      return
    }
    if (!config.domainPath) {
      tip('domainPath')
      return
    }
    return config
  }

  // 独立发版
  const { appid, domainPathEnv, mode } = options
  let domainPath = options.domainPath
  if (!domainPathEnv && !domainPath) {
    throw new Error('独立发版模式下，无 domainPathEnv 需传入 domainPathEnv')
  }

  // 模板模式
  if (mode === 'template' && domainPath) {
    domainPath = domainPath.replace(/{(\w+)}/, domainPathEnv)
  }

  return {
    ...config,
    appid,
    domainPath: domainPath || `https://${domainPathEnv}.icaodong.com/miniapp`
  }
}

/**
 * 获取系统信息
 * @param brand 设备品牌
 * @param model 设备型号
 * @param statusBarHeight 状态栏的高度
 * @returns {object} 返回系统辅助信息
 */
export function systemInfo ({ brand, model, statusBarHeight }) {
  // 默认安卓
  let headerHeight = 70
  // 是否是浏海屏（iphoneX及以上）
  let isIPhoneNotch = false
  // 是否是 iPhone X
  let isIphoneX = model.indexOf('iPhone X') > -1
  // 是否是 iPhone 11
  let isIphone11 = false
  const isIPad = model.indexOf('iPad') > -1

  if (isIphoneX) isIPhoneNotch = true

  if (~brand.indexOf('iPhone') || ~model.indexOf('iPhone')) {
    // iphone 8 及以下
    headerHeight = 64

    // FIXED iphone 11 model返回unknown<iPhone12,1>
    if (model === 'unknown<iPhone12,1>' ||
      ~model.indexOf('<iPhone12,1>') ||
      ~model.indexOf('iPhone12')) {
      isIphone11 = true
      isIPhoneNotch = true
    }

    if (isIPhoneNotch) headerHeight = 88
  }

  return {
    isIphoneX,
    isIphone11,
    isIPhoneNotch,
    isIPad,
    headerHeight,
    statusBarHeight,
    titleBarHeight: headerHeight - statusBarHeight
  }
}

/**
 * 解析url查询参数
 * @param {string} query 不带问号的查询参数字符串
 * @returns {object} 返回对象形式
 */
export function queryParse (query) {
  const result = {}
  if (query) {
    decodeURIComponent(query)
      .split('&')
      .map(v => v.split('='))
      .forEach(([key, value]) => {
        result[key] = value
      })
  }
  return result
}

/**
 * 将键值对形式参数格式化为查询参数字符串
 * @param {object} query 键值对形式参数
 * @param {boolean} isFilterEmpty 是否过滤空值
 * @returns {string} 返回带问号的url查询参数字符串
 */
export function queryStringify (query, isFilterEmpty = true) {
  const queryArr = []
  Object.keys(query).forEach(key => {
    const value = query[key]
    if (isFilterEmpty) {
      value && queryArr.push(`${key}=${value}`)
    } else {
      queryArr.push(`${key}=${value}`)
    }
  })
  let queryStr = ''
  if (queryArr.length) {
    queryStr += `?${queryArr.join('&')}`
  }
  return queryStr
}

/**
 * 是否是tabbar页面
 * @param url 绝对页面路径
 * @returns {boolean}
 */
export function isTabBarUrl (url) {
  const tabUrls = [
    '/pages/index/index',
    '/pages/category/category',
    '/pages/explore/explore',
    '/pages/my/my',
    '/pages/cart/cart'
  ]
  return tabUrls.filter(item => url.indexOf(item) > -1).length > 0
}

/**
 * 获取当前页面及相关参数
 * @returns {object}
 */
export function getCurrentPage () {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (!currentPage) {
    return { pages }
  }

  const path = '/' + currentPage.route
  let options = currentPage.options
  const queryStr = Object.keys(options)
    .map((item) => `${item}=${options[item]}`)
    .join('&')

  let fullPath = path
  if (queryStr) {
    fullPath += `?${queryStr}`
  }

  return {
    pages,
    options,
    path,
    fullPath
  }
}

/**
 * 小程序版本更新
 */
export function checkForUpdate () {
  const updateManager = wx.getUpdateManager()
  updateManager && updateManager.onCheckForUpdate(({ hasUpdate }) => {
    hasUpdate && updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '系统升级，请重启获取最新版本',
        showCancel: false,
        success ({ confirm }) {
          if (!confirm) return
          wx.clearStorageSync()
          updateManager.applyUpdate()
        }
      })
    })
  })
}

/**
 * scene 键值对格式化为url查询串
 * @param opts
 * @returns {string}
 */
export function sceneStringify (opts) {
  let result = ''
  Object.keys(SCENE_PARAM_MAP).forEach((key) => {
    if (opts[key]) {
      result += `&${SCENE_PARAM_MAP[key]}=${opts[key]}`
    }
  })

  // 活动类型的数据单独处理
  let activeType = opts.activeType
  let activeTypeValue = ''
  if (activeType === 'group') {
    activeTypeValue = '1'
  }
  if (activeType === 'seckill') {
    activeTypeValue = '2'
  }
  activeType = activeTypeValue ? `&b=${activeTypeValue}` : ''
  result += activeType

  return encodeURIComponent(result.substring(1))
}

/**
 * scene 字符串格式化为键值对形式
 * @param scene 查询字符串
 * @returns {object} 查询参数对象
 */
export function sceneParse (scene) {
  const obj = queryParse(scene)
  const result = { ...obj }
  Object.keys(SCENE_PARAM_MAP).forEach((key) => {
    const val = SCENE_PARAM_MAP[key]
    if (obj[val]) {
      result[key] = obj[val]
    }
  })

  // 活动类型【activeType】简写为【b】。当值为1时，表示活动类型是拼团(group)
  if (obj.b) {
    if (+obj.b === 1) {
      result.activeType = 'group'
    }
    if (+obj.b === 2) {
      result.activeType = 'seckill'
    }
  }

  return result
}

/**
 * 根据 scene 字符串中的 pageId 参数，解析出当前页面的路径
 * @param scene
 * @returns {string} 带 scene 参数的解析路径
 */
export function scene2page (scene) {
  const { pageId } = sceneParse(scene)
  const pageMap = {
    '14': '/pages-subpackages/live/pages/live-board/index', // 直播室跳板页
    '13': '/pages/tb-active-detail/index', // 特步活动详情页
    '12': '/pages-subpackages/live/pages/live-room/index', // 直播房间页
    '11': '/pages/activity-confirm/activity-confirm', // 吸粉活动详情页
    '10': '/pages/article-detail/index', // 文章详情页
    '9': '/pages/group-invite/group-invite', // 拼团邀请页
    '8': '/pages/index/index', // 首页
    '7': '/pages/coupon-detail/coupon-detail', // 优惠券详情页
    '6': '/pages-subpackages/promotion/pages/coupon-bag-detail/index', // 组合券包
    '5': '/pages/explore-video/explore-video', // 视频购物页
    '4': '/pages/activity-confirm/activity-confirm', // 活动详情页
    '3': '/pages-subpackages/promotion/pages/bargain-detail/index', // 砍价详情页
    '2': '/pages-subpackages/promotion/pages/coupon-split/index', // 瓜分券详情页
    '1': '/pages/product/product' // 普通商品详情页 和 拼团活动详情页
  }
  return `${pageMap[pageId]}?scene=${encodeURIComponent(decodeURIComponent(scene))}`
}

/**
 * 生成二维码
 * @param scene
 * @param app
 * @returns {string}
 */
export function scene2Qr (scene, app) {
  return `${app.config.domainPath}/mp/miniapp/qrcode?page=pages/scene/index&token=${wx.getStorageSync('token')}&scene=${scene}&width=500`
}

/**
 * 页面链接跳转
 * @param currentTarget.dataset
 * - url 要跳转的页面
 */
export function goLink ({ currentTarget: { dataset } }) {
  let { url } = dataset
  if (!url) return

  // 兼容老数据
  if (url === '/pages/profile/profile') {
    url = '/pages/my/my'
  }

  wx[isTabBarUrl(url) ? 'switchTab' : 'navigateTo']({ url })
}

// 授权手机号 TODO 改为mixin
export function bindGetPhoneNumber ({ detail }, app, self, sendPhoneNumberName = 'sendPhoneNumber') {
  if (!detail.iv) return

  // 防止打接口过程中重复点击授权手机号按钮
  if (self.data.isBindGetPhoneNumber) return
  self.setData({ isBindGetPhoneNumber: true })

  let datas = {
    iv: detail.iv,
    encryptedData: detail.encryptedData,
    authAppId: app.config.appid
  }
  const sessionKey = wx.getStorageSync('sessionKey')

  function fail () {
    wx.login({
      fail: ({ errMsg }) => {
        wx.showToast({ title: `${errMsg}`, icon: 'none', duration: 3000 })
      },
      success: ({ code }) => {
        datas.code = code
        self[sendPhoneNumberName](datas)
      }
    })
  }

  if (sessionKey) {
    wx.checkSession({
      success: () => {
        // sessionKey 未过期，并且在本生命周期一直有效
        datas.sessionKey = wx.getStorageSync('sessionKey')
        self[sendPhoneNumberName](datas)
      },
      fail
    })
  } else {
    fail()
  }
}

export function sendPhoneNumber (datas = {}, ApiUser, self, success) {
  wx.showLoading({ title: '授权中' })
  ApiUser.authCustmobile({
    data: datas,
    fail: () => {
      wx.removeStorageSync('sessionKey')
    },
    success: ({ data, message }) => {
      wx.hideLoading()
      wx.setStorageSync('mobile', data)
      wx.showToast({ title: message, icon: 'none', duration: 2000 })
      success && success({ data, message })
    },
    complete: () => {
      self.setData({ isBindGetPhoneNumber: false })
    }
  })
}

/**
 * 存储登录返回值中指定字段，并进行相关逻辑处理
 * @param data 登录响应值
 * @param self
 */
export function loginSetStorage (data, self) {
  // 要存储的字段名
  const storeKeys = [
    'token', 'storeName', 'nickName', 'headUrl', 'mobile', 'sessionKey',
    'tenantId', 'storeId', 'storeCode', 'jobType', 'name', 'changeStore']
  // 以别名存储字段（原字段名:别名）
  const storeAliasKeys = ['id:loginId', 'type:loginType', 'subType:loginSubType']
  const setStorage = (key, storeKey) =>
    data[key] !== '' &&
    data[key] !== null &&
    data[key] !== undefined &&
    wx.setStorageSync(storeKey || key, data[key])

  storeKeys.forEach(key => setStorage(key))
  storeAliasKeys.forEach(map => {
    const [key, AliasKey] = map.split(':')
    setStorage(key, AliasKey)
  })

  // 根据type切换客户端和员工端（0：消费者; 1：员工端)
  // subType 消费者0代表消费者 消费者1代表分销商 导购0代表导购 导购1代表虚拟导购
  if (+data.type === 1) {
    // 员工不能进入分销商首页
    wx.setStorageSync('parentIsSeller', false)
    wx.setStorageSync('empid', data.id)
    // 用来判断是否切换身份为消费者以及切换门店
    wx.setStorageSync('empidOldValue', data.id)
    // 此值用来计算返佣
    wx.setStorageSync('empidCommission', data.id)
    wx.setStorageSync('userType', 'staff')
    wx.removeStorageSync('userid')
  } else {
    wx.setStorageSync('userid', data.id)
    wx.setStorageSync('useridOldValue', data.id)
    wx.setStorageSync('userType', 'customer')
    wx.removeStorageSync('empid')
  }

  // 检测当前用户是否是分销商
  const loginId = wx.getStorageSync('loginId')
  const isSeller = data.type === 0 && data.subType === 1
  if (isSeller) {
    wx.setStorageSync('isSeller', isSeller)
    wx.setStorageSync('empid', loginId)
    wx.setStorageSync('empidCommission', loginId)
  }

  self && self.ajax && self.ajax({
    url: '/brand/brief',
    type: 'get',
    success (res) {
      wx.setStorageSync('brandName', res.data.name)
    }
  })
}

/**
 * 页面重载
 */
export function refreshPage () {
  const pages = getCurrentPages()
  const { route, options } = pages[pages.length - 1]
  const query = Object.keys(options)
    .map((item) => `${item}=${options[item]}`)
    .join('&')
  wx.redirectTo({ url: `/${route}?${query}` })
}

/**
 * TODO: 和 tjPreview 函数重合度较高
 * 统计-转发。转发场景：
   1. 转发者身份为导购
   forwarderId:员工id / empId:所属导购id[或为空]
   2. 转发者身份为消费者
   forwarderId:消费者id / empId:所属导购id[或为空]
 * @param opts
 */
export function tjForward (opts = {}) {
  const empid = wx.getStorageSync('empidCommission')
  const userid = wx.getStorageSync('userid')
  opts.ApiUser.forward({
    data: {
      forwarderId: userid || empid,
      empId: empid,
      id: opts.id,
      kind: opts.kind, // 1优惠券 2文章 3-直播 4-组合券包 5-砍价 6-秒杀 7-吸粉活动
      type: 1 // 1转发 2进入
    }
  })
}

/**
 * 统计-预览。浏览场景：
   1. 转发者身份为导购
   forwarderId:员工id[或为空] / empId:员工id[或为空]
   2. 转发者身份为消费者
   forwarderId:消费者id[或为空] / empId:员工id[或为空]
 * @param opts
 */
export function tjPreview (opts = {}) {
  const { options, pageThis } = opts
  const empid = options.empid
  const userid = options.userid
  // 防止下拉刷新也统计
  if (pageThis && pageThis.data.isTriggerTjPreview) return
  pageThis && (pageThis.data.isTriggerTjPreview = true)
  // 统计
  opts.ApiUser.forward({
    data: {
      forwarderId: userid || empid,
      empId: empid,
      id: opts.id,
      kind: opts.kind, // 1优惠券 2文章 3-直播 4-组合券包 5-砍价 6-秒杀 7-吸粉活动
      type: 2 // 1转发 2进入
    },
    success: (res) => {
      opts.success && opts.success(res)
    }
  })
}

export default {
  getAppConfig,
  systemInfo,
  checkForUpdate,
  loginSetStorage,
  queryParse,
  queryStringify,
  sceneStringify,
  sceneParse,
  scene2page,
  scene2Qr,
  isTabBarUrl,
  goLink,
  bindGetPhoneNumber,
  sendPhoneNumber,
  tjForward,
  tjPreview,
  getCurrentPage,
  refreshPage
}
