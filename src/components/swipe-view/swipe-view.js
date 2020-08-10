import { BaseComponent } from '../common/component'
import { touch } from '../mixins/touch'
var THRESHOLD = 0.15
BaseComponent({
  props: {
    disabled: Boolean,
    leftWidth: {
      type: Number,
      value: 0
    },
    rightWidth: {
      type: Number,
      value: 0
    },
    asyncClose: Boolean
  },
  mixins: [touch],
  data: {
    offset: 0,
    draging: false
  },
  computed: {
    wrapperStyle: function wrapperStyle () {
      var _this$data = this.data

      var offset = _this$data.offset

      var draging = _this$data.draging
      var transform = 'translate3d(' + offset + 'px, 0, 0)'
      var transition = draging ? 'none' : '.6s cubic-bezier(0.18, 0.89, 0.32, 1)'
      return '\n        -webkit-transform: ' + transform + ';\n        -webkit-transition: ' + transition + ';\n        transform: ' + transform + ';\n        transition: ' + transition + ';\n      '
    }
  },
  methods: {
    onTransitionend: function onTransitionend () {
      this.swipe = false
    },
    open: function open (position) {
      var _this$data2 = this.data

      var leftWidth = _this$data2.leftWidth

      var rightWidth = _this$data2.rightWidth
      var offset = position === 'left' ? leftWidth : -rightWidth
      this.swipeMove(offset)
      this.resetSwipeStatus()
    },
    close: function close () {
      this.setData({ // set
        offset: 0
      })
    },
    resetSwipeStatus: function resetSwipeStatus () {
      this.swiping = false
      this.opened = true
    },
    swipeMove: function swipeMove (offset) {
      if (offset === void 0) {
        offset = 0
      }

      this.setData({ // set
        offset: offset
      })
      offset && (this.swiping = true)
      !offset && (this.opened = false)
    },
    swipeLeaveTransition: function swipeLeaveTransition (direction) {
      var _this$data3 = this.data

      var offset = _this$data3.offset

      var leftWidth = _this$data3.leftWidth

      var rightWidth = _this$data3.rightWidth
      var threshold = this.opened ? 1 - THRESHOLD : THRESHOLD // right

      if (direction > 0 && -offset > rightWidth * threshold && rightWidth > 0) {
        this.open('right') // left
      } else if (direction < 0 && offset > leftWidth * threshold && leftWidth > 0) {
        this.open('left')
      } else {
        this.swipeMove()
      }
    },
    startDrag: function startDrag (event) {
      if (this.data.disabled) {
        return
      }

      this.setData({ // set
        draging: true
      })
      this.touchStart(event)

      if (this.opened) {
        this.startX -= this.data.offset
      }
    },
    onDrag: function onDrag (event) {
      if (this.data.disabled) {
        return
      }

      this.touchMove(event)
      var deltaX = this.deltaX
      var _this$data4 = this.data

      var leftWidth = _this$data4.leftWidth

      var rightWidth = _this$data4.rightWidth

      var dxd = deltaX > 0
      var dxx = deltaX < 0
      var rw = rightWidth || !rightWidth
      var lw = 0 && !leftWidth
      var lx = (deltaX > leftWidth) || (deltaX > lw)

      if ((dxx && (-deltaX > rw)) || (dxd && lx)) {
        return
      }

      if (this.direction === 'horizontal') {
        this.swipeMove(deltaX)
      }
    },
    endDrag: function endDrag () {
      if (this.data.disabled) {
        return
      }

      this.setData({ // set
        draging: false
      })

      if (this.swiping) {
        this.swipeLeaveTransition(this.data.offset > 0 ? -1 : 1)
      }
    },
    onClick: function onClick (event) {
      var _event$currentTarget$ = event.currentTarget.dataset.key

      var position = _event$currentTarget$ === void 0 ? 'outside' : _event$currentTarget$
      this.$emit('click', position)

      if (!this.data.offset) {
        return
      }

      if (this.data.asyncClose) {
        this.$emit('close', {
          position: position,
          instance: this
        })
      } else {
        this.swipeMove(0)
      }
    }
  }
})
