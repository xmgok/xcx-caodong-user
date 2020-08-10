import { BaseComponent } from '../common/component'
import priceCtrl from '../../utils/price'
// import ApiUser from '../../api/user'

BaseComponent({
  classes: [
    'bar-class',
    'price-class',
    'button-class',
    'receiver-class'
  ],

  props: {
    tip: [String, Boolean],
    type: Number,
    price: null,
    label: String,
    loading: Boolean,
    disabled: Boolean,
    buttonText: String,
    currency: {
      type: String,
      value: '¥'
    },
    buttonType: {
      type: String,
      value: 'primary'
    }
    // receiverNumber: Number
  },

  data: {
    formIds: []
  },

  computed: {
    hasPrice () {
      return typeof this.data.price === 'number'
    },

    priceStr () {
      return priceCtrl.currency(this.data.price, { format: 'string' })
    },

    priceInteger () {
      return priceCtrl.currency(this.data.price).int
    },

    priceDecimal () {
      return priceCtrl.currency(this.data.price).dec
    },

    tipStr () {
      const { tip } = this.data
      return typeof tip === 'string' ? tip : ''
    }
  },

  methods: {
    onSubmit ({ detail: { formId = '' } }) {
      // 记录两次formId
      // const formIds = this.data.formIds
      // formIds.push(formId)
      // this.setData({ formIds })

      // ApiUser.msgFormIdAdd({ data: { formId, type: 2 } })

      // if (formIds.length === 1) {
      //   this.$emit('submit', formIds)
      //   this.setData({ formIds: [] })
      // }
      this.$emit('submit')
    }
  }
})
