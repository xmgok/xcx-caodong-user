import { BaseComponent } from '../common/component'
import { button } from '../mixins/button'
import { openType } from '../mixins/open-type'

BaseComponent({
  classes: ['loading-class'],

  mixins: [button, openType],

  props: {
    plain: Boolean,
    block: Boolean,
    round: Boolean,
    square: Boolean,
    loading: Boolean,
    disabled: Boolean,
    type: {
      type: String,
      value: 'default'
    },
    size: {
      type: String,
      value: 'normal'
    }
  },

  computed: {
    classes () {
      const { type, size, block, plain, round, square, loading, disabled } = this.data
      return this.classNames(`jz-button--${type}`, `jz-button--${size}`, {
        'jz-button--block': block,
        'jz-button--round': round,
        'jz-button--plain': plain,
        'jz-button--square': square,
        'jz-button--loading': loading,
        'jz-button--disabled': disabled,
        'jz-button--unclickable': disabled || loading
      })
    }
  },

  methods: {
    onClick () {
      if (!this.data.disabled && !this.data.loading) {
        this.$emit('click')
      }
    }
  }
})
