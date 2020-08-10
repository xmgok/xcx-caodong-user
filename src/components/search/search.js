import { BaseComponent } from '../common/component'

BaseComponent({
  field: true,

  classes: ['cancel-class'],

  props: {
    focus: Boolean,
    clearable: Boolean,
    inputAlign: String,
    showAction: Boolean,
    useActionSlot: Boolean,
    placeholder: String,
    placeholderStyle: String
  },

  data: {
    showClear: false
  },

  beforeCreate () {
    this.focused = false
  },

  methods: {
    onInput (event) {
      const { value = '' } = event.detail || {}
      this.$emit('input', value)
      this.$emit('change', value)
      this.setData({
        value,
        showClear: this.getShowClear(value)
      })
    },
    onChange (event) {
      this.setData({ value: event.detail })
      this.$emit('change', event.detail)
    },

    onCancel () {
      this.setData({ value: '' })
      this.$emit('cancel')
      this.$emit('change', '')
    },

    onSearch () {
      this.$emit('search', this.data.value)
    },

    onFocus () {
      this.$emit('focus')
      this.focused = true
      this.setData({
        showClear: this.getShowClear()
      })
    },

    onBlur () {
      this.focused = false
      this.$emit('blur')
      this.setData({
        showClear: this.getShowClear()
      })
    },

    getShowClear (value) {
      value = value === undefined ? this.data.value : value
      return (
        this.data.clearable && this.focused && value && !this.data.readonly
      )
    },

    onClear () {
      this.setData({
        value: '',
        showClear: this.getShowClear('')
      })
      this.$emit('input', '')
      this.$emit('change', '')
      this.$emit('clear', '')
    },

    onConfirm () {
      this.$emit('confirm', this.data.value)
    }
  }
})
