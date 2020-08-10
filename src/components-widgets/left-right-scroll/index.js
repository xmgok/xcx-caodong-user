import { goLink } from '../../utils/business'

Component({
  properties: {
    result: {
      type: Object,
      value: {}
    }
  },
  attached () {
  },
  methods: {
    goLink,
    load (e) {
      const { width, height } = e.detail
      const { index } = e.currentTarget.dataset
      const result = this.data.result
      const h = result.height
      const scale = width * h
      result.list[index]._width = scale / height
      // console.log(e, result)
      this.setData({ result })
    }
  }
})
