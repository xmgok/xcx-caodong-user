import { BaseComponent } from '../common/component'

BaseComponent({
  field: true,

  relation: {
    name: 'radio',
    type: 'descendant',
    linked (target) {
      const { value, disabled } = this.data
      target.setData({
        value: value,
        disabled: disabled || target.data.disabled
      })
    }
  },

  props: {
    value: null,
    disabled: Boolean
  },

  watch: {
    value (value) {
      const children = this.getRelationNodes('../radio/radio')
      children.forEach(child => {
        child.setData({ value })
      })
    },

    disabled (disabled) {
      const children = this.getRelationNodes('../radio/radio')
      children.forEach(child => {
        child.setData({ disabled: disabled || child.data.disabled })
      })
    }
  }
})
