import { BaseComponent } from '../common/component'

BaseComponent({
  props: {
    show: Boolean,
    title: String,
    list: {
      type: Array,
      observer (newList) {
        this.setData({ newList })
      }
    },
    current: {
      type: Number,
      value: -1
    }
  },

  data: {
    newList: []
  },
  created () {
    // console.log(this.data.list, this.data.current)
  },

  computed: {
    isDisabled () {
      return this.data.current === -1
    }
  },

  methods: {
    closePicker () {
      this.setData({ show: false })
      this.$emit('close')
    },
    onChange ({ detail }) {
      this.setData({ current: +detail })
      this.$emit('change', detail)
    },
    submit () {
      const { current } = this.data
      if (current === -1) return
      this.closePicker()
      this.$emit('submit', {
        index: current,
        value: this.data.newList.find(i => i.value === current)
      })
    }
  }
})
