Component({
  properties: {
    // type 为data时可用
    text: {
      type: 'String',
      value: ''
    },
    // type 【不】为data时可用
    size: {
      type: String,
      value: '30px'
    },
    // data/circular/spinner
    type: {
      type: String,
      value: 'data'
    },
    // type 【不】为data时可用
    color: {
      type: String,
      value: '#cccccc'
    }
  }
})
