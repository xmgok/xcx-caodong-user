import { BaseComponent } from '../common/component'

BaseComponent({
  field: true,

  classes: [],

  props: {
    placeholder: String
  },

  methods: {
    onInput ({ detail = '' }) {
      this.$emit('input', detail)
      this.setData({ value: detail })
    },
    onConfirm () {
      this.$emit('confirm', this.data.value)
    }
  }
})
