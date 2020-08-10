import ApiOrderCancel from '../../api/order-cancel'
import { AFTERSALES_REASON_LIST } from '../../utils/consts'

Page({
  data: {
    list: [],
    detail: '',
    brandBrief: ''
  },

  onLoad ({ orderCode, returnCode }) {
    ApiOrderCancel.consultList({
      params: { orderCode, returnCode },
      success: ({ data }) => {
        this.setData({
          list: data.map(item => {
            item._role = ['', '商家', '买家'][item.role]
            if (item.reason) item._reason = AFTERSALES_REASON_LIST.find(i => i.value === item.reason).label
            if (item.evidencePic) item._evidencePic = item.evidencePic.split(',')
            return item
          })
        })
      }
    })
  }
})
