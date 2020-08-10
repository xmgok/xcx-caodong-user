import { BaseComponent } from '../common/component'

BaseComponent({
  field: true,

  relation: {
    name: 'radio-group',
    type: 'ancestor'
  },

  classes: ['icon-class', 'label-class'],

  props: {
    name: null,
    value: null,
    disabled: Boolean,
    labelDisabled: Boolean,
    labelPosition: String
  },

  computed: {
    iconClass () {
      const { disabled, name, value } = this.data
      return this.classNames('jz-radio__icon', {
        'jz-radio__icon--disabled': disabled,
        'jz-radio__icon--checked': !disabled && name === value,
        'jz-radio__icon--check': !disabled && name !== value
      })
    }
  },

  methods: {
    emitChange (value) {
      const instance = this.getRelationNodes('../radio-group/radio-group')[0] || this
      instance.$emit('input', value)
      instance.$emit('change', value)
    },

    onChange (event) {
      this.emitChange(event.detail.value)
    },

    onClickLabel () {
      if (!this.data.disabled && !this.data.labelDisabled) {
        this.emitChange(this.data.name)
      }
    }
  }
})
