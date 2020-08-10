Component({
  options: {},
  properties: {
    isVip: {
      type: String,
      value: '0' // '0'不展示 '1'会员价 '2'一口价
    },
    type: {
      type: String,
      value: '' // 'group'拼团 'jl'接龙 'seckill'秒杀
    },
    text: {
      type: String,
      value: '' // 自定义
    }
  },
  data: {},
  methods: {}
})
