/**
 * 价格格式化及计算
 */
module.exports = {
  spec: {
    decimals: 2,
    sign: '\uffe5'
  },

  // 格式化价格
  currency (value, options = {}) {
    let result;
    (value || 0).toString().replace(/^(\D?)(\d+)(\.\d+)?/g, (a, b, c, d) => {
      const sign = b || options.sign || this.spec.sign
      const intPart = c // .replace(/(?=(?!^)(\d{4})+$)/g, ' ');
      const decPart = Number(d || 0)
        .toFixed(options.decimals || this.spec.decimals)
        .replace(/^0/, '')

      if (options.format === 'string') {
        result = sign + intPart + decPart
      } else if (options.format === 'number') {
        result = intPart + decPart
      } else {
        result = {
          sign,
          int: intPart,
          dec: decPart
        }
      }
    })

    return result
  },

  // 转为数字
  number (value, options = {}) {
    if (!value) return null
    return +value.toString()
      .replace(new RegExp(`^${options.sign || this.spec.sign}`), '')
  },

  // 价格计算，避免精度问题
  calc (calc, n1, n2, options = { format: 'number' }) {
    if (!(n1 || n1 === 0)) return null
    if (!n2) {
      n1 = this.number(n1)
    } else {
      calc = !calc || calc === 'add' ? 1 : -1
      let t1 = 1

      let t2 = 1
      if (n1 instanceof Array && n1.length) {
        t1 = n1[1]
        n1 = n1[0]
      }
      if (n2 instanceof Array && n2.length) {
        t2 = n2[1]
        n2 = n2[0]
      }
      let decimals = options.decimals || this.spec.decimals
      decimals = Math.pow(10, decimals * decimals)
      n1 = Math.abs(t1 * decimals * this.number(n1) + calc * t2 * decimals *
        this.number(n2)) / decimals
    }
    return options.format ? this.currency(n1, options) : n1
  },

  add (n1, n2, options) {
    return this.calc('add', n1, n2, options)
  },

  diff (n1, n2, options) {
    return this.calc('diff', n1, n2, options)
  },

  keep2Decimal (val) {
    return (Math.floor(parseFloat(val) * 1000 / 10) / 100).toFixed(2)
  }
}
