import { chunkArray } from '../../../../utils/index'
const ApiSeller = require('../../../../api/cus-m')

export const formModel = {
  lastLogin: '', // 最近登录时间
  loginStartTime: '', // 最近登录时间筛选开始时间
  loginEndTime: '', // 最近登录时间筛选结束时间
  lastOrder: '', // 最近下单时间
  orderStartTime: '', // 最近下单时间筛选开始时间
  orderEndTime: '', // 最近下单时间筛选结束时间
  browseTime: '', // 浏览时长 1,5分钟内 2,5-10分钟 3,10分钟以上
  browseTimeStart: '', // 浏览时长筛选开始分钟
  browseTimeEnd: '', // 浏览时长筛选结束分钟
  browseCount: '', // 浏览次数 1,3次以内 2,4-10次 3,10次以上
  browseCountStart: '', // 浏览时长筛选开始分钟
  browseCountEnd: '', // 浏览时长筛选结束分钟
  isVip: '', // 是否会员 0非会员 1会员
  birthday: '', // 生日 1本月生日 2下月生日
  labelIds: [] // 用户标签
}

export const filterData = {
  form: { ...formModel },
  lastLoginList: [{ value: 1, label: '今天' }, { value: 2, label: '3天内' }, { value: 3, label: '7天内' }],
  lastOrderList: [{ value: 1, label: '今天' }, { value: 2, label: '3天内' }, { value: 3, label: '7天内' }],
  browseTimeList: [{ value: 1, label: '5分钟内' }, { value: 2, label: '5-10分钟' }, { value: 3, label: '10分钟以上' }],
  browseCountList: [{ value: 1, label: '3次以内' }, { value: 2, label: '4-10次' }, { value: 3, label: '10次以上' }],
  isVipList: [{ value: 0, label: '非会员' }, { value: 1, label: '会员' }],
  birthdayList: [{ value: 1, label: '本月生日' }, { value: 2, label: '下月生日' }],
  tagList: [],
  tagListChunked: [],
  isLabelCollapse: false
}

export const filterMixin = {
  // 客户标签列表
  getLabelList () {
    ApiSeller.list({
      params: { labelName: '' },
      success: ({ data = [] }) => {
        this.setData({
          tagList: data,
          tagListChunked: chunkArray(data, 3)
        })

        const labelIds = this.data.form.labelIds
        if (labelIds && labelIds.length) {
          this.reCheckTag()
        }
      }
    })
  },
  // 单选项选择
  checkFilter ({ target: { dataset } }) {
    const { field, value } = dataset
    this.setData({ [`form.${field}`]: this.data.form[field] === value ? '' : value })

    // 清空时间及数值范围
    if (value === '') return
    switch (field) {
      case 'lastLogin':
        this.setData({
          'form.loginStartTime': '',
          'form.loginEndTime': ''
        })
        break
      case 'lastOrder':
        this.setData({
          'form.orderStartTime': '',
          'form.orderEndTime': ''
        })
        break
      case 'browseTime':
        this.setData({
          'form.browseTimeStart': '',
          'form.browseTimeEnd': ''
        })
        break
      case 'browseCount':
        this.setData({
          'form.browseCountStart': '',
          'form.browseCountEnd': ''
        })
        break
    }
  },
  // 标签选择
  checkTag ({ target: { dataset } }) {
    const { index, subIndex } = dataset
    const tagListChunked = this.data.tagListChunked
    tagListChunked[index][subIndex].active = !tagListChunked[index][subIndex].active
    this.setData({ tagListChunked })
  },
  // 回显标签
  reCheckTag () {
    const tagList = this.data.tagList.map(item => {
      return {
        ...item,
        active: this.data.form.labelIds.includes(item.id)
      }
    })

    this.setData({
      tagList,
      tagListChunked: chunkArray(tagList, 3)
    })
  },
  // 日期选择
  bindDateChange ({ detail: { value }, currentTarget: { dataset } }) {
    const { field } = dataset
    this.setData({ [`form.${field}`]: value })

    // 选中时间时，清除对应其它状态
    if (!value) return
    switch (field) {
      case 'loginStartTime':
      case 'loginEndTime':
        this.setData({ 'form.lastLogin': '' })
        break
      case 'orderStartTime':
      case 'orderEndTime':
        this.setData({ 'form.lastOrder': '' })
        break
    }
  },
  bindInput ({ target: { dataset }, detail: { value } }) {
    const { name } = dataset
    this.setData({ [`form.${name}`]: value })

    // 输入范围时，清除对应其它状态
    if (!value) return
    switch (name) {
      case 'browseTimeStart':
      case 'browseTimeEnd':
        this.setData({ 'form.browseTime': '' })
        break
      case 'browseCountStart':
      case 'browseCountEnd':
        this.setData({ 'form.browseCount': '' })
        break
    }
  },
  submit () {
    const labelIds = []
    const { tagListChunked, form } = this.data
    tagListChunked.forEach(item => labelIds.push(...item.filter(v => v.active).map(v => v.id)))

    this.setData({ 'form.labelIds': labelIds })

    // 处理isVip内外部同步问题
    const isVip = form.isVip
    if (isVip !== '') {
      const isVipIdx = this.data.isVipList.findIndex(v => v.value === isVip)
      this.setData({
        isVipIdx,
        isVip,
        'simpleFilterActive.isVip': true
      })
    }

    this._doSearch()
    this.onPopupClose()
  },
  reset () {
    this.setData({ form: { ...formModel } })
    this._doSearch()
    this.onPopupClose()
  },
  // 客户标签收起
  labelCollapse () {
    this.setData({ isLabelCollapse: !this.data.isLabelCollapse })
  }
}
