import business from '../../../../utils/business'
const ApiSeller = require('../../../../api/seller')
const ApiUser = require('../../../../api/user')
const { NUMBER_TO_ZHCN } = require('../../../../utils/consts')

// const app = getApp()

function getDefaultData (options) {
  const obj = { // 默认值
    userid: wx.getStorageSync('userid'),
    empid: wx.getStorageSync('empidCommission'),
    loginId: wx.getStorageSync('loginId'),
    NUMBER_TO_ZHCN,
    userType: wx.getStorageSync('userType'),
    sellerData: {},
    isReachCondition: true,
    options: {}
  }
  if (options) { // 根据options重置默认值
    const scene = business.sceneParse(options.scene)
    if (+scene.type === 1) {
      scene.type = 'seller'
    }
    if (+scene.type === 2) {
      scene.type = 'employee'
    }
    options.type = scene.type || options.type || 'employee' // 默认邀请成为虚拟导购
    options.parentId = scene.parentId || options.parentId
    options.empid = scene.empid || options.empid
    obj.options = options
  }
  return obj
}

/*
options.type：seller(邀请成为分销商) employee(邀请成为虚拟导购)
*/

Page({
  // data: getDefaultData(),

  onLoad (options) {
    // 后端说是分销商，我再跳。避免不必要的纷争。
    // if (wx.getStorageSync('isSeller')) {
    //   wx.redirectTo({ url: '/pages-subpackages/seller/pages/seller-my/index' })
    //   return
    // }
    this.setData(getDefaultData(options))
    this.getDetail()
    console.log('分销申请页面onLoad this.data.options', this.data.options)
  },

  getIsEmployee () {
    if (this.data.options.type === 'employee') {
      // 检测当前用户是否是导购
      const mobile = wx.getStorageSync('mobile')
      if (mobile) {
        ApiUser.getEmpInfo({
          data: { mobile },
          success: (res) => {
            this.setData({ isEmployee: +res.data.type === 1 })
          }
        })
      }
    }
  },

  getDetail () {
    wx.setNavigationBarTitle({ title: this.data.options.type === 'seller' ? '邀请成为分销商' : '邀请成为虚拟导购' })
    const isSeller = false
    if (isSeller) {
      wx.redirectTo({ url: '/pages-subpackages/seller/pages/seller-my/index' })
      return
    }
    this.getIsEmployee()
    // 检测当前用户是否是分销商
    const loginId = wx.getStorageSync('loginId')
    ApiSeller.isDistributorHandleStoreId({
      data: { duserId: loginId },
      success: (res) => {
        const isSeller = res.data.distributor
        wx.setStorageSync('isSeller', isSeller)
        if (isSeller) {
          wx.setStorageSync('empid', loginId)
          wx.setStorageSync('empidCommission', loginId)
          wx.redirectTo({ url: '/pages-subpackages/seller/pages/seller-my/index' })
        }
      }
    })
    // 获取分销状态
    ApiSeller.distributorState({
      data: { duserId: this.data.loginId },
      success: (res) => {
        // id 分销ID  大于0 代表已申请，小于等于0代表未申请
        // state  分销商状态：0、待审核，1、已启用，2、已禁用，3、已驳回
        this.setData({ sellerState: { ...res.data } })
      }
    })
    // 获取分销配置
    ApiSeller.getdistInfo({
      success: (res) => {
        const data = res.data
        const sellerData = this.data.sellerData
        sellerData.visible = data.visible
        sellerData.dtype = data.dtype
        sellerData.verify = data.verify
        this.setData({ sellerData })
      }
    })
    // 获取分销商申请的条件设置
    ApiSeller.getDistriCondition({
      success: (res) => {
        const data = res.data
        const sellerData = this.data.sellerData
        sellerData.minAmount = data.minAmount
        sellerData.minOrderNumber = data.minOrderNumber
        sellerData.isNeedCondition = data.isNeedCondition
        this.setData({ sellerData })
        if (sellerData.isNeedCondition) {
          // 查询是否满足条件。
          ApiUser.getSumAmount({
            success: (res2) => {
              const data2 = res2.data
              let isReachCondition = this.data.isReachCondition
              if (data.minAmount && +data2.amount < +data.minAmount) {
                isReachCondition = false
              }
              if (data.minOrderNumber && +data2.sum < +data.minOrderNumber) {
                isReachCondition = false
              }
              this.setData({ isReachCondition, myBuyData: data2 })
            }
          })
        }
      }
    })
    // 获取用户信息
    this.userInfo()
  },

  userInfo () {
    if (this.data.options.parentId) {
      ApiUser.userInfo({
        data: { id: this.data.options.parentId },
        success: (res) => {
          this.setData({ userInfo: res.data })
        }
      })
    }
  },

  // 申请分销 || 开启分销
  goRequest (e) {
    if (!this.data.isReachCondition) {
      const sellerData = this.data.sellerData
      let str = '需'
      if (sellerData.minAmount) {
        str += '购物满' + sellerData.minAmount + '元'
      }
      if (sellerData.minAmount && sellerData.minOrderNumber) {
        str += '且'
      }
      if (sellerData.minOrderNumber) {
        str += '下单满' + sellerData.minOrderNumber + '次'
      }
      const myBuyData = this.data.myBuyData
      str += `\n您已购满${myBuyData.amount}元，下单${myBuyData.sum}次`
      wx.showToast({ title: str, icon: 'none', duration: 5000 })
      return
    }
    const dataset = e.currentTarget.dataset
    if (this.data.isSubmitting) return
    this.data.isSubmitting = true
    console.log('分销申请页面onLoad this.data.options.parentId', this.data.options.parentId)
    ApiSeller.saveDistributor({
      data: {
        parentId: this.data.options.parentId || ''
      },
      success: () => {
        if (dataset.url) {
          if (this.data.options.type === 'seller') {
            const isSeller = true
            wx.setStorageSync('isSeller', isSeller)
            if (isSeller) {
              const userid = wx.getStorageSync('userid')
              wx.setStorageSync('empid', userid)
              wx.setStorageSync('empidCommission', userid)
              wx.removeStorageSync('userid')
            }
          }
          wx.navigateTo({ url: dataset.url })
        } else {
          business.refreshPage()
        }
      },
      complete: () => {
        delete this.data.isSubmitting
      }
    })
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  bindsuccess () {
    this.getIsEmployee() // 因需要mobile，故需要重新调用。
  }
})
