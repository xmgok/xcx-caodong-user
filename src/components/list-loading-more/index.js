import business from '../../utils/business'

Component({
  externalClasses: ['custom-class'],
  properties: {
    iconStyle: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    },
    noDataDesc: {
      type: String,
      value: '暂无数据'
    },
    noDataBtnText: {
      type: String,
      value: ''
    },
    noDataBtnUrl: {
      type: String,
      value: ''
    },
    noMoreDataDesc: {
      type: String,
      value: '已经到底了'
    },
    result: {
      type: Object,
      value: {}
    }
  },
  methods: {
    goLink: business.goLink
  }
})
