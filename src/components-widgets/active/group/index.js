const ApiGroup = require('../../../api/group')

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  data: {
    assembleImg: {
      isShow: true
    },
    assembleList: [],
    totalCount: 0
  },
  attached () {
    this.getList()
  },
  methods: {
    getList () {
      ApiGroup.activeList({
        data: {
          pageNum: 1,
          pageSize: 6
        },
        success: ({ data: { dataList, totalCount } }) => {
          this.setData({ assembleList: dataList, totalCount })
        }
      })
    }
  }
})
