import { BaseComponent } from '../common/component'

BaseComponent({
  classes: ['btn-class'],

  props: {
    type: String,
    text: String,
    page: String,
    url: String,
    openType: {
      type: String,
      value: 'navigate'
    },
    disabled: Boolean,
    shown: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    tapSubmit ({ detail: { formId } }) {
      this.$emit('click', formId)
      if (this.data.url) wx[this.data.openType]({ url: `/pages/${this.data.url}` })
    }
  }
})
