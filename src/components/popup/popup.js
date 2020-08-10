import { BaseComponent } from '../common/component'
import { transition } from '../mixins/transition'

BaseComponent({
  mixins: [transition(false)],

  props: {
    transition: String,
    customStyle: String,
    overlayStyle: String,
    zIndex: {
      type: Number,
      value: 99999
    },
    overlay: {
      type: Boolean,
      value: true
    },
    closeOnClickOverlay: {
      type: Boolean,
      value: true
    },
    position: {
      type: String,
      value: 'center'
    }
  },

  methods: {
    onClickOverlay () {
      this.$emit('click-overlay')

      if (this.data.closeOnClickOverlay) {
        this.$emit('close')
      }
    }
  }
})
