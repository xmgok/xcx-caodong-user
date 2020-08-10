import ApiCart from '../../api/cart'

const category = require('../../api/category')
const productApi = require('../../api/product')

function getDefaultData (options) {
  const obj = { // 默认值
    result: {
      totalPage: 10,
      totalCount: 300,
      pageNum: 1,
      pageSize: 30
    },
    search: {
      keyword: '',
      categoryList: []
    },
    idName: '',
    index1: 0,
    index2: 0,
    index3: 0,
    dataList: [],
    resData: {},
    options: {}
  }
  if (options) { // 根据options重置默认值
    obj.options = options
  }
  return obj
}

Page({
  data: getDefaultData(),

  onLoad (options) {
    this.setData(getDefaultData(options))
    this.getCategoryList()
    this.getCartCount()
  },

  getList () {
    const result = this.data.result
    const search = this.data.search
    productApi.searchNew({
      data: {
        keyword: search.keyword,
        categoryId: search.categoryList[search.categoryList.length - 1],
        pageNum: result.pageNum,
        pageSize: result.pageSize
      },
      success: ({ data }) => {
        this.setData({ dataList: this.data.dataList.concat(data.dataList) }, () => {
          setTimeout(() => {
            this.setH()
          }, 60)
        })
        this.setPagination(data)
      }
    })
  },

  getCategoryList () {
    const search = this.data.search
    category.list({
      success: (res) => {
        const obj = {}
        res.data.forEach((v, i) => {
          if (i === 0) {
            v.checked = true
            search.categoryList.push(v.id)
          }
          if (v.childList.length) {
            v.childList.forEach((v2, i2) => {
              if (i === 0 && i2 === 0) {
                v2.checked = true
                search.categoryList.push(v2.id)
                if (v2.childList.length) {
                  v2.childList[0].checked = true
                  search.categoryList.push(v2.childList[0].id)
                }
              }
              if (v2.childList.length) {
                obj[v.id + '-' + v2.id] = v2.childList
              }
            })
          }
        })
        this.data.obj = obj
        const threeData = obj[search.categoryList.slice(0, 2).join('-')] || []
        let idName = this.data.idName
        if (search.categoryList[2]) {
          idName = search.categoryList[2]
        }
        this.setData({ resData: res.data, threeData, idName })
        this.getList()
      }
    })
  },

  handleSearchConfirm ({ detail }) {
    this.setData({ 'search.keyword': detail })
    this.resetCategory()
    this.resetPaginationAndList()
    this.getList()
  },

  changeCategory (e) {
    const dataset = e.currentTarget.dataset
    const { index, item, type } = dataset
    const indexNow = 'index' + type
    const resData = this.data.resData
    const search = this.data.search
    // 重新理逻辑
    if (+type === 3) { // 防止重新渲染
      search.categoryList.splice(2, 1, item.id)
      resData[this.data.index1].childList[this.data.index2].childList[this.data.index3].checked = false
      this.data[indexNow] = index
      resData[this.data.index1].childList[this.data.index2].childList[this.data.index3].checked = true
      let idName = this.data.idName
      if (search.categoryList[2]) {
        idName = search.categoryList[2]
      }
      const threeData = this.data.obj[search.categoryList.slice(0, 2).join('-')] || []
      this.setData({ resData, threeData, idName })
      this.resetPaginationAndList()
      this.getList()
      return
    }
    this.resetCategory()
    this.data[indexNow] = index
    if (+type === 1) {
      this.data.index2 = 0
      this.data.index3 = 0
    } else if (+type === 2) {
      this.data.index3 = 0
    }
    const index1 = this.data.index1
    const index2 = this.data.index2
    const index3 = this.data.index3
    const obj1 = resData[index1]
    obj1.checked = true
    search.categoryList.push(obj1.id)
    if (obj1.childList.length) {
      const obj2 = obj1.childList[index2]
      obj2.checked = true
      search.categoryList.push(obj2.id)
      if (obj2.childList.length) {
        const obj3 = obj2.childList[index3]
        obj3.checked = true
        search.categoryList.push(obj3.id)
      }
    }
    // 重新理逻辑
    const threeData = this.data.obj[search.categoryList.slice(0, 2).join('-')] || []
    let idName = this.data.idName
    if (search.categoryList[2]) {
      idName = search.categoryList[2]
    }
    this.setData({ resData, threeData, idName })
    this.resetPaginationAndList()
    this.getList()
  },

  resetCategory () {
    this.data.search.categoryList = []
    this.clearCheckedCategory(this.data.resData)
    this.setData({ resData: this.data.resData, threeData: [] })
  },

  clearCheckedCategory (data) {
    data.forEach(v => {
      if (v.childList.length) {
        this.clearCheckedCategory(v.childList)
      }
      v.checked = false
    })
  },

  setToggle () {
    this.setData({ isShow: !this.data.isShow })
    setTimeout(() => {
      this.setH()
    }, 60)
  },

  setH () {
    wx.createSelectorQuery().select('.three-wrap').boundingClientRect((rect) => {
      if (!rect) {
        return
      }
      let h = rect.height * 2
      if (this.data.isShow === true) {
        h += 30
      }
      this.setData({ height: h })
    }).exec()
  },

  setPagination (data = {}) {
    this.setData({
      result: {
        totalPage: data.totalPage,
        totalCount: data.totalCount,
        pageNum: data.pageNum,
        pageSize: this.data.result.pageSize
      }
    })
  },

  setCurPageIncrement () {
    let { result } = this.data
    result.pageNum++
    this.setData({ result })
  },

  resetPaginationAndList () {
    let { result } = this.data
    this.setData({
      dataList: [],
      result: {
        totalPage: 10,
        totalCount: 300,
        pageNum: 1,
        pageSize: result.pageSize
      }
    })
  },

  bindscrolltolower () {
    let { result } = this.data
    this.setCurPageIncrement()
    if (result.pageNum > result.totalPage) return
    this.getList()
  },

  onPullDownRefresh () {
    this.onLoad(this.data.options)
    wx.stopPullDownRefresh()
  },

  submit ({ currentTarget: { dataset: { id } } }) {
    this.setData({
      showPurchase: true,
      productId: id
    })
  },
  goodsPurchaseSelected ({ detail }) {
    this.setData({ showPurchase: false })
    if (detail.buyType === 'cart') { // 加入购物车
      if (this.data.joinCart) return
      this.data.joinCart = true
      ApiCart.add({
        data: {
          number: detail.quantity,
          specId: detail.spec.id
        },
        success: (res) => {
          wx.showToast({ title: res.message, icon: 'none' })
          this.getCartCount()
        },
        complete: () => {
          delete this.data.joinCart
        }
      })
    }
  },
  goodsPurchaseClose () {
    this.setData({ showPurchase: false })
  },
  getCartCount () {
    ApiCart.info({
      success: ({ data }) => {
        this.setData({ footerData: data })
      }
    })
  }
})
