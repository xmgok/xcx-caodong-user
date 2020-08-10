// const ApiProduct = require('../../api/product')
// const ApiUser = require('../../api/user')

Component({
  options: {},

  properties: {
    list: {
      type: Array,
      value: [],
      observer (newVal) {
        newVal.forEach((item) => {
          item.materialList = item.materialList || []
          item._isShowOpen = item.materialList.length > 2
          item._unfold = true
        })

        this.setData({ listData: newVal })
      }
    },
    showDivider: {
      type: Boolean,
      value: true
    }
  },

  data: {
    show: false,
    productId: '',
    transmitUrl: '',
    imgList: [],
    checkIdList: '',
    showShare: false,
    listData: []
  },

  ready () {
  },

  methods: {
    open ({ currentTarget: { dataset: { index, item } } }) {
      item._isShowOpen = false
      const listData = this.data.listData
      listData[index] = item
      this.setData({ listData })
    },
    goGallery (e) {
      const { index, imgIndex } = e.currentTarget.dataset
      wx.setStorage({
        key: 'galleryGoods',
        data: this.data.listData[index],
        success: () => wx.navigateTo({ url: `/pages/gallery/gallery?index=${imgIndex}` })
      })
    },
    onShare (e) {
      const { index } = e.currentTarget.dataset
      const { id, materialList } = this.data.listData[index]
      this.setData({
        productId: id,
        imgList: materialList.map(i => i.imgUrl),
        checkIdList: materialList.map(i => i.id),
        showShare: true
      })

      this.triggerEvent('product-select', {
        product: this.data.listData[index],
        imgList: this.data.imgList,
        checkIdList: this.data.checkIdList
      })
    },
    close () {
      this.setData({ showShare: false })
    }
  }
})
