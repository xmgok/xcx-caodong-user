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
  methods: {
    handleListData (newVal) {
      if (this.data.pageNum === 1) {
        this.data.listData2 = []
      }
      newVal.forEach((item) => {
        item._navigatorUrl = `/pages/explore-video/explore-video?id=${item.id}`
        item._videoUrl = `${item.videoUrl}${VIDEO_IMG_SUFFIX}`
        item._width = '344'
        item._height = '344'
        item['_createTime'] = beautifyTime(item.createTime) // TODO 接口返回格式化的时间
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
