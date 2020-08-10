import { BaseComponent } from '../common/component'

BaseComponent({
  props: {
    show: Boolean,
    mask: Boolean,
    customStyle: String,
    zIndex: {
      type: Number,
      value: 1
    }
  },

  methods: {
    onClick () {
      this.$emit('click')
    },

    // for prevent touchmove
    noop () {}
  }
})
