import { BaseComponent } from '../common/component'
import { transition } from '../mixins/transition'

BaseComponent({
  mixins: [transition(true)],

  props: {
    name: {
      type: String,
      value: 'fade'
    }
  }
})
