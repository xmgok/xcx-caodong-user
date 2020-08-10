import ApiVideo from '../../api/video'
import ApiUser from '../../api/user'

const productApi = require('../../api/product')
const priceCtrl = require('../../utils/price')
const ApiGroup = require('../../api/group')
const ApiSeckill = require('../../api/seckill')
const ApiBargain = require('../../api/bargain')
const ApiLive = require('../../api/live')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    id: {
      type: Number,
      value: 0,
      observer (newval) {
        this.setData({ id: newval })
      }
    },
    quantity: {
      type: Number,
      value: 1,
      observer (newval) {
        this.setData({ quantity: newval })
      }
    },
    specContent: {
      type: String,
      value: '',
      observer (newval) {
        this.setData({ specContent: newval || '' })
      }
    },
    goodsType: {
      type: Number,
      value: null
    },
    buyType: {
      type: String,
      value: 'buy',
      // 选择规格 selectSpec
      // 加入购物车 cart
      // 立即购买 buy
      // 拼团单独购买 groupAloneBuy
      // 开团 groupOpenBuy
      // 参团 groupJoinBuy
      observer (newval) {
        this.setData({ buyType: newval })
      }
    },
    activeId: {
      type: String,
      value: '',
      observer (newval) {
        this.setData({ activeId: newval })
      }
    },
    activeType: {
      type: String,
      value: '',
      observer (newval) {
        this.setData({ activeType: newval })
        if (newval === 'group') {
          this.getGroupInfo()
        }
        if (newval === 'seckill') {
          this.getSeckillInfo()
        }
        if (newval === 'bargain') {
          this.getBargainInfo()
        }
      }
    },
    recordId: { // 参团时需要携带的id
      type: String,
      value: '',
      observer (newval) {
        this.setData({ recordId: newval })
      }
    },
    isSellPrice: {
      type: Boolean,
      value: false
    },
    // 是否打添加到临时购物车接口（cart/video/add）
    addToCart: {
      type: Boolean,
      value: false
    },
    // 额外数据传入
    extraData: {
      type: Object,
      value: {}
    },
    zIndex: {
      type: Number,
      value: 99999
    },
    isSetStorage: { // 确认订单页。选择赠品以及兑换商品时不允许去修改本地存储的下单数据。
      type: Boolean,
      value: true
    }
  },

  data: {
    iPhoneX: wx.getStorageSync('iPhoneX'),
    data: {
      inventory: 999999 // 修复input-number的max被识别为0的场景。
    },
    groupDetail: {},
    seckillDetail: {}
  },

  attached () {
    if (!this.id) return
    if (!this.data.activeType || this.data.activeType === 'live') {
      this.getInfo()
    }
  },

  methods: {
    getInfo () {
      wx.showLoading()
      const params = { id: this.id }
      if (this.data.goodsType) params.type = this.data.goodsType

      let api = productApi.getInfo
      // 直播价格已经过折扣计算，打专门接口
      if (this.data.activeType === 'live') {
        api = ApiLive.goodsInfo
        params.roomId = this.data.extraData.roomId
      }

      api({
        params,
        success: ({ data }) => {
          this.data.infoDataBak = data
          // 过滤规格 - 指定规格才参与拼团
          if (this.data.activeType === 'group') {
            const groupDetail = this.data.groupDetail
            if (groupDetail.specType === 2 && groupDetail.specIds) {
              const arr = groupDetail.specIds.split(',')
              data.specificationList.forEach(v => {
                if (arr.indexOf(String(v.specId)) === -1) {
                  v.inventory = 0
                }
              })
            }
          }
          // 过滤规格 - 指定规格才参与秒杀，其他规格的商品当普通商品购买。
          if (this.data.activeType === 'seckill') {
            const seckillDetail = this.data.seckillDetail
            if (seckillDetail.status === 3) {
              if (seckillDetail.specType === 2 && seckillDetail.specIds) {
                const arr = seckillDetail.specIds.split(',')
                data.specificationList.forEach(v => {
                  if (arr.indexOf(String(v.specId)) !== -1) {
                    v._activeType = 'seckill'
                    if (seckillDetail.isLimitNum) {
                      v.inventory = v.inventory < seckillDetail.remainNum ? v.inventory : seckillDetail.remainNum // 秒杀限购
                    }
                    if (seckillDetail.isLimitActive === 1) { // 秒杀指定的规格如果设定了库存限制
                      const specItem = seckillDetail.seckillSpecList.find(v2 => v2.specId === v.specId)
                      console.log('specItem', specItem)
                      v.inventory = v.inventory < specItem.inventory ? v.inventory : specItem.inventory // 秒杀库存限制
                    }
                  }
                })
              } else if (seckillDetail.specType === 1) {
                data.specificationList.forEach(v => {
                  v._activeType = 'seckill'
                  if (seckillDetail.isLimitNum) {
                    v.inventory = v.inventory < seckillDetail.remainNum ? v.inventory : seckillDetail.remainNum // 秒杀限购
                  }
                  if (seckillDetail.isLimitActive === 1) { // 秒杀指定的规格如果设定了库存限制
                    const specItem = seckillDetail.seckillSpecList.find(v2 => v2.specId === v.specId)
                    console.log('specItem', specItem)
                    v.inventory = v.inventory < specItem.inventory ? v.inventory : specItem.inventory // 秒杀库存限制
                  }
                })
              }
            }
          }
          // 过滤规格 - 指定规格才参与砍价
          if (this.data.activeType === 'bargain') {
            data.specificationList.forEach(v => {
              v.inventory = 1 // 砍价只允许砍一件
            })
            const bargainDetail = this.data.bargainDetail
            if (bargainDetail.specType === 2 && bargainDetail.specIds) {
              const arr = bargainDetail.specIds.split(',')
              data.specificationList.forEach(v => {
                if (arr.indexOf(String(v.specId)) === -1) {
                  v.inventory = 0
                }
              })
            }
          }
          // 过滤规格 - 指定规格才参与直播购物
          if (this.data.activeType === 'live') {
            const goodsDetail = this.data.extraData
            if (goodsDetail.specType === 2 && goodsDetail.specIds) {
              data.specificationList.forEach(v => {
                if (goodsDetail.specIds.indexOf(v.id) === -1) {
                  v.inventory = 0
                }
              })
            }
          }

          this.setData({ data }) // 此行请勿删除，否则将导致下面formatSpecData调用的报错。
          wx.hideLoading()
          const attributeList = data.attributeList
          let current = null
          if (this.data.specContent) { // 如果specContent有入参，则选中specContent。
            current = data.specificationList.find(v => v.specContent === this.data.specContent)
          } else { // 否则就默认选中有库存的那一项。
            current = data.specificationList.filter(v => +v.inventory !== 0)[0]
          }
          if (!current) { // 商品无库存。
            current = data.specificationList[0] // 则按照第一个商品的规格组合展示数据。
            attributeList.forEach(v => {
              v.value.forEach((item) => {
                item.disabled = true
              })
            })
          } else { // 商品有库存。
            // 对被选中的进行标记。
            const arr = current.specContent.split('，')
            attributeList.forEach((v, i) => {
              v.value.forEach((item) => {
                if (item.values === arr[i]) {
                  item.active = true
                }
              })
            })
            if (attributeList.length === 1) { // 只有一维规格，则置灰无库存的。
              const noStoreList = data.specificationList.filter(v => +v.inventory === 0) // 无库存项
              noStoreList.forEach(v => {
                attributeList['0'].value.forEach(item => {
                  if (item.values === v.specContent) {
                    item.disabled = true
                  }
                })
              })
            } else { // 非一维规格，则没库存的要进行置灰。请勿删除ajax内部第一行的setData，否则将导致下面formatSpecData调用的报错。
              const arr = current.specContent.split('，')
              let index = 0
              attributeList[attributeList.length - 1].value.forEach((v, i) => {
                if (v.values === arr[arr.length - 1]) {
                  index = i
                }
              })
              const parentIndex = attributeList.length - 1
              attributeList[attributeList.length - 1].value[index].active = false // 修复因formatSpecData方法内部的取消选择判定导致最后一维规格不选中的问题。
              this.formatSpecData(index, parentIndex)
              return
            }
          }
          const { int, dec } = priceCtrl.currency(current.price)
          const obj = priceCtrl.currency(current.sellPrice)
          data = {
            ...data,
            _imgUrl: current.imgUrl || data.imgUrl,
            spec: current,
            isVip: String(current.isVip) || this.data.infoDataBak.isVip,
            price: current.price,
            priceInteger: int,
            priceDecimal: dec,
            sellPrice: current.sellPrice,
            sellPriceInteger: obj.int,
            sellPriceDecimal: obj.dec,
            prePrice: current.prePrice,
            inventory: current.inventory
          }
          console.log('data', data)
          this.setData({ data })
        }
      })
    },
    getGroupInfo () {
      ApiGroup.groupDetails({
        data: {
          groupId: this.data.activeId
        },
        success: (res) => {
          // 目前限购是后端在下单的时候做的限制，如果前端做限制，则需要后端返回当前用户还能购买的数量。
          this.setData({ groupDetail: res.data })
          this.getInfo()
        }
      })
    },
    getSeckillInfo () {
      ApiSeckill.seckillDetail({
        data: {
          seckillId: this.data.activeId
        },
        success: (res) => {
          this.setData({ seckillDetail: res.data })
          this.getInfo()
        }
      })
    },
    getBargainInfo () {
      ApiBargain.info({
        data: {
          recordId: this.data.recordId
        },
        success: (res) => {
          this.setData({ bargainDetail: res.data })
          this.getInfo()
        }
      })
    },
    // 格式化规格数据
    formatSpecData (index, parentIndex) {
      let data = this.data.data
      const attributeList = data.attributeList
      const parent = attributeList[parentIndex]
      const obj = parent.value[index]
      if (obj.disabled) { // 没库存，禁止点击。
        return
      }
      if (obj.active) { // 取消选择
        obj.active = false
      } else { // 选择其他项
        parent.value.forEach((item) => {
          item.active = false
        })
        obj.active = true
      }
      const selected = this.getSelectedSpecArr() // 被选中的预设项
      console.log('被选中的预设项', selected)
      const realSelected = selected.filter(v => v) // 真实被选中的项
      console.log('真实被选中的项', realSelected)
      const realLength = realSelected.length
      if (attributeList.length - 1 <= realLength) { // 还差一项就选择完毕了(以及选择完毕了)。(都需)检测是否没库存了。
        const noStoreList = data.specificationList.filter(v => +v.inventory === 0) // 无库存项
        const noSelectedIndex = selected.indexOf('') // 哪一项没被选择。为-1表示选择了全部。
        let noStoreKey = {} // 哪一项的哪些规格值没库存了。
        if (noSelectedIndex !== -1) {
          selected.splice(noSelectedIndex, 1)
        }
        noStoreList.forEach(v => {
          if (attributeList.length === 1) { // 只有一个规格项
            const index = 0
            if (!noStoreKey[index]) {
              noStoreKey[index] = []
            }
            noStoreKey[index].push(v.specContent)
            return
          }
          const arr = v.specContent.split('，')
          let key = []
          if (noSelectedIndex !== -1) { // 剩一项没被选中
            key = arr.splice(noSelectedIndex, 1)
            if (selected.join(',') === arr.join(',')) { // 保证选择的对应项和无库存的对应项是同一项。
              if (!noStoreKey[noSelectedIndex]) {
                noStoreKey[noSelectedIndex] = []
              }
              noStoreKey[noSelectedIndex] = noStoreKey[noSelectedIndex].concat(key)
            }
          }
          if (noSelectedIndex === -1) { // 全部规格项都被选择了
            let num = 0 // 无库存的组合项，被选中了几项
            selected.forEach(v => {
              if (arr.indexOf(v) !== -1) {
                num++
              }
            })
            arr.forEach((v, i) => {
              if (num === selected.length - 1 && selected.indexOf(v) === -1) { // 无库存的组合项，剩一项没被选中，则让对应项无库存的规格值置灰。
                if (!noStoreKey[i]) {
                  noStoreKey[i] = []
                }
                noStoreKey[i].push(v)
              }
            })
          }
        })
        console.log('没库存的项', noStoreKey)
        // 先全都不禁止点击。
        attributeList.forEach(v => {
          v.value.forEach((item) => {
            item.disabled = false
          })
        })
        // 存在无库存项，则让无库存项不可以被点击。
        if (Object.keys(noStoreKey).length) {
          Object.keys(noStoreKey).forEach(key => {
            attributeList[key].value.forEach(v => {
              v.disabled = noStoreKey[key].indexOf(v.values) !== -1 // 没库存的规格项对应的规格值进行置灰。
            })
          })
        }
      } else { // 选中的规格项数不满足计算条件，则不禁止点击。
        attributeList.forEach(v => {
          v.value.forEach((item) => {
            item.disabled = false
          })
        })
      }
      if (attributeList.length === realLength) { // 全部选择完毕了
        const current = this.getSelectedSpec()
        const { int, dec } = priceCtrl.currency(current.price)
        const obj = priceCtrl.currency(current.sellPrice)
        const dataData = this.data.data
        data = {
          ...dataData,
          _imgUrl: current.imgUrl || dataData.imgUrl,
          spec: current,
          isVip: String(current.isVip) || this.data.infoDataBak.isVip,
          price: current.price,
          priceInteger: int,
          priceDecimal: dec,
          sellPrice: current.sellPrice,
          sellPriceInteger: obj.int,
          sellPriceDecimal: obj.dec,
          prePrice: current.prePrice,
          inventory: current.inventory
        }
        if (this.data.quantity > current.inventory) this.setData({ quantity: current.inventory }) // 商品数量 - 切换规格时如果超库存了 - 变为最大库存
        // this.setData({ quantity: 1 }) // 商品数量 - 切换规格就 - 变为1
      } else {
        if (parentIndex === 0) {
          const imgUrl = attributeList[0].value[index].img || this.data.data.imgUrl
          this.setData({ 'data._imgUrl': imgUrl })
        }
      }
      console.log('data', data)
      this.setData({ data })
    },
    // 已选中规格 - 组合后的数据
    getSelectedSpec () {
      const arr = this.getSelectedSpecArr()
      const specList = this.data.data.specificationList
      return specList.find(v => v.specContent === arr.join('，'))
    },
    // 已选中规格 - 组合前的数据
    getSelectedSpecArr () {
      const attributeList = this.data.data.attributeList
      const arr = [...Array(attributeList.length)].map(v => '')
      attributeList.forEach((v, i) => {
        v.value.forEach(v2 => {
          if (v2.active) {
            arr[i] = v2.values
          }
        })
      })
      return arr
    },
    // 点击规格
    onSpecClick ({ currentTarget: { dataset } }) {
      const { index, parentIndex } = dataset
      this.formatSpecData(index, parentIndex)
    },
    onPurchaseClose () {
      const spec = this.getSelectedSpec() || {}
      // 修复关闭触发不了close的问题，否则列表中会出现弹窗内容不更换的问题，当列表中商品的所有规格都无库存时。
      this.triggerEvent('close', {
        spec,
        quantity: this.data.quantity
      })
      this.setData({ show: false })
    },
    onQuantityChange ({ detail }) {
      this.setData({ quantity: detail })
    },
    submit ({ detail: { formId }, currentTarget }) {
      const { activeType } = this.data
      const spec = this.getSelectedSpec()
      if (!spec) {
        wx.showToast({ title: '请选择规格', icon: 'none' })
        return
      }
      if (this.data.data.inventory === 0) {
        wx.showToast({ title: '该商品目前仓库无货', icon: 'none' })
        return
      }

      // 不选择
      if (activeType === 'live') {
        this._triggerSelected(spec, this.data)
        return
      }

      if (formId) {
        ApiUser.msgFormIdAdd({ data: { formId, type: 2 } })
      }
      this.setData({ buyType: currentTarget.dataset.type }) // buyType改变，参团会变成开团，但是因为页面跳转了，所以看不出来。回退再次显示的时候，里面显示的不是开团，是因为组件外部使用了wx:if重新渲染了(重新走了一遍生命周期)。
      if (this.data.isSetStorage) {
        wx.setStorageSync('to-order-confirm-active-data', { //  统一设置to-order-confirm-active-data(下单页需要使用到此数据) 修复bug
          buyType: currentTarget.dataset.type,
          activeId: this.data.activeId,
          activeType,
          recordId: this.data.recordId // 参团需要这个id
        })
        if (activeType === 'seckill' && spec._activeType !== 'seckill') {
          wx.setStorageSync('to-order-confirm-active-data', { //  统一设置to-order-confirm-active-data(下单页需要使用到此数据) 修复bug
            buyType: 'buy',
            activeId: '',
            activeType: '',
            recordId: '' // 参团需要这个id
          })
        }
        wx.setStorageSync('to-order-confirm', [{ // 统一设置to-order-confirm(立即购买进入到下单页需要使用到此数据)
          productId: spec.productId,
          specId: spec.id,
          productNum: this.data.quantity
        }])
      }

      if (this.data.addToCart) {
        if (this.data.joinCart) return
        this.data.joinCart = true
        ApiVideo.cartAdd({
          data: {
            list: [{
              productId: spec.productId,
              specId: spec.id,
              number: this.data.quantity
            }]
          },
          success: ({ status }) => {
            if (status !== 200) return
            this._triggerSelected(spec, this.data)
          },
          complete: () => {
            delete this.data.joinCart
          }
        })
        return
      }

      this._triggerSelected(spec, this.data)
    },
    _triggerSelected (spec, data) {
      this.triggerEvent('selected', {
        spec, // 规格
        quantity: data.quantity, // 数量
        data: data.data, // 普通商品详情
        groupDetail: data.groupDetail, // 拼团数据详情
        buyType: data.buyType, // 直接购买还是单独购买亦或者是拼团购买
        activeId: data.activeId, // 活动id
        activeType: data.activeType, // 活动类型
        recordId: data.recordId // 参团需要这个id
      })
    }
  }
})
