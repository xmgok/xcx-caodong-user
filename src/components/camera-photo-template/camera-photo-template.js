Component({
  options: {},
  properties: {
    imgList: {
      type: Array,
      value: []
    },
    iIndex: {
      type: Number,
      value: -1
    }
  },
  ready () {

  },
  methods: {
    close ({ currentTarget }) {
      this.triggerEvent('close', { index: currentTarget.dataset.index })
    }
  }
})
