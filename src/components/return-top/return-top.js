// const ApiProduct = require('../../api/product')
// const ApiUser = require('../../api/user')

Component({
  properties: {
    show: {
      type: Boolean,
      value: true
    },
    bottom: {
      type: Number,
      value: 66
    }
  },

  methods: {
    returnTop () {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 500
      })
    }
  }
})
