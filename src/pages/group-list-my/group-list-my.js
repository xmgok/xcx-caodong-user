import { timeCountDown } from '../../utils/index'
const ApiGroup = require('../../api/group')
const mixinsPagination = require('../../utils/mixins-pagination')

Page({
  data: {
    showTab: true,
    tabList: ['全部', '拼团中', '拼团成功', '拼团失败'],
    tabIndex: 0,
    userType: '',
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    dataList: [],
    options: {}
  },
  onLoad (options) {
    wx.hideShareMenu()
    this.setData({
      userType: wx.getStorageSync('userType'),
      tabIndex: Number(options.type),
      options
    })
    this.getList()
  },
  onShow () {
  },
  onPullDownRefresh () {
    this.resetPaginationAndList()
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },
  getList () {
    let { result, dataList, tabIndex } = this.data
    const ajaxData = {
      pageNum: result.pageNum,
      pageSize: result.pageSize
    }
    if (tabIndex) {
      ajaxData.type = tabIndex
    }
    ApiGroup.myGroupList({
      data: ajaxData,
      success: res => {
        dataList = dataList.concat(res.data.dataList)
        dataList.forEach((item, index, arr) => {
          if (item.status === 1) {
            timeCountDown({
              seconds: item.countDown,
              callback: {
                run: (json) => {
                  item.remainingSecondsFormat = json
                  this.setData({ dataList })
                },
                over: () => {
                }
              }
            })
            item._timer = timeCountDown.timer
          }
        })
        this.setData({ dataList })
        this.setPagination(res.data)
      }
    })
  },
  clearInterval () {
    this.data.dataList.forEach(v => {
      clearInterval(v._timer)
    })
  },
  onUnload () {
    this.clearInterval()
  },
  ...mixinsPagination,
  resetPaginationAndList () {
    this.clearInterval()
    mixinsPagination.resetPaginationAndList()
  },
  onShareAppMessage (e) {
    if (e.from !== 'button') {
      return
    }
    const dataset = e.target.dataset
    const index = dataset.index
    const obj = this.data.dataList[index]
    const recordId = obj.recordId
    const groupId = obj.groupId
    const userid = wx.getStorageSync('userid')
    // ApiProduct.transmit({
    //   data: {
    //     id: product.id,
    //     mids: this.data.checkIdList
    //   }
    // })
    // ApiUser.transferAdd({
    //   data: {
    //     productId: groupInfo.productId,
    //     productCode: groupInfo.productCode || '',
    //     price: groupInfo.productPrice || 0,
    //     addPrice: 0
    //   }
    // })
    const empid = wx.getStorageSync('empidCommission')
    ApiGroup.forward({
      data: {
        empId: empid,
        groupId: groupId,
        type: 1 // 类型 1转发 2浏览
      }
    })
    let path = `/pages/group-invite/group-invite?${userid ? `&userid=${userid}` : ''}${recordId ? `&recordId=${recordId}` : ''}${empid ? `&empid=${empid}` : ''}`
    if (path.indexOf('?') === -1) {
      path += `?storeId=${wx.getStorageSync('storeId')}`
    } else {
      path += `&storeId=${wx.getStorageSync('storeId')}`
    }
    console.log('分享路径', path)
    return {
      path,
      title: `我在${wx.getStorageSync('brandName')}发现一个非常赞的商品，快来一起拼购吧。`,
      imageUrl: obj.productImg
    }
  }
})
