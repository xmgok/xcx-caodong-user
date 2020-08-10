import webimhandler from '../../components/mlvb-live-room/webim_handler'
import webim from '../../components/mlvb-live-room/webim_wx'

const sdkAppID = '1400288519'

const COLOR_LIST = ['#d5eeba', '#ffd0d0', '#7ddfff', '#ffd875', '#ff6675', '#996675']

module.exports = {
  initIM () {
    const { avChatRoomId, identifier, nickName, userSig } = this.data

    webimhandler.init({
      accountMode: 0, // 帐号模式，0-表示独立模式，1-表示托管模式(已停用，仅作为演示)
      accountType: 1, // 已废弃
      sdkAppID,
      avChatRoomId: avChatRoomId, // 默认房间群ID，群类型必须是直播聊天室（AVChatRoom）
      selType: webim.SESSION_TYPE.GROUP,
      selToID: avChatRoomId,
      selSess: null // 当前聊天会话
    })

    // 当前用户身份
    const loginInfo = {
      sdkAppID, // 用户所属应用id,必填
      appIDAt3rd: sdkAppID, // 用户所属应用id，必填
      accountType: 1, // 已废弃
      identifier, // 当前用户ID,必须是否字符串类型，选填
      identifierNick: nickName || '', // 当前用户昵称，选填
      userSig // 当前用户身份凭证，必须是字符串类型，选填
    }

    // 监听（多终端同步）群系统消息方法，方法都定义在demo_group_notice.js文件中
    // eslint-disable-next-line
    const onGroupSystemNotifys = {
      5: webimhandler.onDestoryGroupNotify, // 群被解散(全员接收)
      11: webimhandler.onRevokeGroupNotify, // 群已被回收(全员接收)
      255: webimhandler.onCustomGroupNotify // 用户自定义通知(默认全员接收)
    }

    // 监听连接状态回调变化事件
    // eslint-disable-next-line
    const onConnNotify = ({ ErrorCode }) => {
      switch (ErrorCode) {
        case webim.CONNECTION_STATUS.ON:
          // webim.Log.warn('连接状态正常...');
          break
        case webim.CONNECTION_STATUS.OFF:
          webim.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常')
          break
        default:
          webim.Log.error('未知连接状态,status=' + ErrorCode)
          break
      }
    }

    // 监听事件
    const listeners = {
      onConnNotify: webimhandler.onConnNotify, // 选填
      // 监听新消息(大群)事件，必填
      onBigGroupMsgNotify: (msg) => {
        webimhandler.onBigGroupMsgNotify(msg, (msgs) => this.receiveMsg(msgs))
      },
      onMsgNotify: webimhandler.onMsgNotify, // 监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
      // onGroupSystemNotifys: webimhandler.onGroupSystemNotifys, // 监听（多终端同步）群系统消息事件，必填
      onGroupSystemNotifys: {
        255: (msg) => this.receiveSysMsg(msg)
      },
      onGroupInfoChangeNotify: webimhandler.onGroupInfoChangeNotify // 监听群资料变化事件，选填
    }

    // 其他对象，选填
    const options = {
      isAccessFormalEnv: true, // 是否访问正式环境，默认访问正式，选填
      isLogOn: false // 是否开启控制台打印日志,默认开启，选填
    }

    webimhandler.sdkLogin(loginInfo, listeners, options, avChatRoomId)
  },
  // 发送消息
  sendMsg ({ detail: { value } }) {
    if (!value.replace(/^\s*|\s*$/g, '')) return
    webimhandler.onSendMsg(value, () => this.setData({ msgContent: '' }))
  },
  // 接收消息
  receiveMsg (data) {
    console.log('receiveMsgs', data)
    const messageList = this.data.messageList || []

    // 系统消息
    if (data.fromAccountNick === '@TIM#SYSTEM') {
      // data.content值示例格式：25229;;胡说 进入直播间
      const [userInfo, statusText] = data.content.split(' ')
      const nickName = userInfo.split(';;')[1]
      this.setData({
        systemMsg: {
          content: `${nickName} ${statusText}`,
          color: statusText.indexOf('进入') > -1 ? 'join' : 'leave'
        }
      })
    // 用户发送消息
    } else {
      // data.content = '{"cmd":"notifyPusherChange",data:{}}' // 通知房间内其他主播 ?
      if (data.content && data.content.indexOf('{"cmd":"') > -1) {
        console.log(data) // TODO
        return
      }

      // 随机显示用户昵称颜色
      data.color = COLOR_LIST[Math.floor(Math.random() * (COLOR_LIST.length - 1))]
      messageList.push(data)
      this.setData({ messageList })
    }

    // 滚动到消息列表底部（行高26）TODO 用scroll-view的scroll-into-view实现
    this.setData({
      scrollTop: messageList.length * 26
    })
  },
  // 接受系统推送消息
  receiveSysMsg (data) {
    console.log('receiveSysMsg', data)
    if (data && data.UserDefinedField) {
      try {
        // type 1 下单消息 2 商品置顶消息
        const { type, name, price, url, msg } = JSON.parse(data.UserDefinedField)
        switch (type) {
          case 1:
            this.setData({
              systemMsg: {
                content: msg,
                color: 'join'
              }
            })
            break
          case 2:
            this.setData({ stickProductMsg: { name, price, url } })
            break
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
