// 售后类型
export const REFUND_TYPE_LIST = [
  { label: '退款', value: 1 },
  { label: '退款退货', value: 2 }
]

// 退款原因
export const REFUND_REASON_LIST = [
  { label: '拍错/拍多/不想要了', value: 1 },
  { label: '订单信息错误', value: 2 },
  { label: '长时间未发货', value: 3 },
  { label: '缺货', value: 4 },
  { label: '其他', value: 5 }
]

// 售后进度
export const ORDER_RETURN_STATUS_MAP = ['', '售后申请中', '售后已完成']

// 退货退款原因
export const RETURN_REASON_LIST = [
  { label: '商品需要维修', value: 6 },
  { label: '收到商品破损', value: 7 },
  { label: '商品错发/漏发', value: 8 },
  { label: '收到商品不符合描述', value: 9 },
  { label: '商品质量问题', value: 10 },
  { label: '长时间未发货', value: 11 },
  { label: '未收到货', value: 12 },
  { label: '不喜欢', value: 13 },
  { label: '无理由退货', value: 14 }
]

// 数字转汉字
export const NUMBER_TO_ZHCN = {
  0: '零',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九'
}

// 周一 至 周日
export const WEEK = ['', '一', '二', '三', '四', '五', '六', '日']

// 分页相关
export const PAGINATION = {
  totalPage: 10,
  totalCount: 300,
  pageNum: 1,
  pageSize: 30
}

// 售后退货退款原因
export const AFTERSALES_REASON_LIST = REFUND_REASON_LIST.concat(RETURN_REASON_LIST)

export const AFTERSALES_CHECK_STATUS = {
  1: '申请中',
  2: '已取消',
  3: '申请未通过',
  4: '申请通过，等待寄回',
  5: '已寄回，等待审核',
  7: '审核未通过',
  8: '已退款'
}

// 默认用户头像与昵称
export const DEFAULT_AVATAR_URL = 'https://qiniu.icaodong.com/xcx/common/default-head.png?v=1.0.0'
export const DEFAULT_NICK_NAME = '--'

// 七牛视频取帧缩略图
export const VIDEO_IMG_SUFFIX = '?vframe/jpg/offset/1'

// scene 参数短值映射
export const SCENE_PARAM_MAP = {
  // 门店商品id（转发带的一定是门店商品id）；也可作为任意详情页id
  id: 'i',
  // 商品查询方式
  // 1表示以商品库id去门店商品表中查询商品，返回的id是门店商品id。所以转发不用带type
  type: 't',
  empid: 'e',
  userid: 'u',
  loginId: 'd',
  // 活动id
  activeId: 'a',
  recordId: 'r',
  reduceId: 'h',
  categoryId: 'c',
  categoryName: 'n',
  keyword: 'k',
  storeId: 's',
  parentId: 'p',
  // 页面id
  pageId: 'f',
  sceneId: 'g',
  taskRuleId: 'l'
}
