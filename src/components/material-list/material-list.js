import { beautifyTime } from '../../utils/index'
const app = getApp()
const VIDEO_IMG_SUFFIX = app.VIDEO_IMG_SUFFIX

Component({
  properties: {
    listData: {
      type: Array,
      value: [],
      observer (newVal) {
        this.handleListData(newVal)
      }
    },
    getEnd: {
      type: Boolean,
      value: false
    },
    pageNum: {
      type: Number,
      value: 1
    }
  },
  data: {
    listData2: []
  },
  ready () {

  },
  methods: {
    handleListData (newVal) {
      if (this.data.pageNum === 1) {
        this.data.listData2 = []
      }
      newVal.forEach((item) => {
        item.imgUrl = item.imgUrl.split(',')
        item._navigatorUrl = `/pages/explore-detail/explore-detail?id=${item.id}&productId=${item.productId}`
        if (item.type > 1) {
          item._navigatorUrl = `/pages/explore-video/explore-video?id=${item.id}&productId=${item.productId}`
          item.imgUrl[0] = `${item.imgUrl[0]}${VIDEO_IMG_SUFFIX}`
        }
        item._width = '344'
        item._height = '344'
        item['_createTime'] = beautifyTime(item.createTime)
      })
      const listData2 = this.data.listData2.concat(newVal)
      this.setData({ listData2 })
    },
    bindLoadImg ({ detail, currentTarget }) {
      const id = currentTarget.dataset.id
      let listData2 = this.data.listData2
      detail.height = 344 * detail.height / detail.width
      detail.width = 344
      listData2.forEach((item) => {
        if (Number(item.id) === Number(id)) {
          item._width = detail.width
          item._height = detail.height
        }
      })

      this.setData({ listData2 })
    }
  }
})
