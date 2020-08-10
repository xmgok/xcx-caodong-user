var liveroom = require('./mlvbliveroomcore');
const app = getApp()
import ApiLive from '../../../../api/live'

var _this = null;

Component({
    options: {
      multipleSlots: true // 启用多slot支持
    },
    properties: {
        role: { type: String, value: 'audience' },
        roomid: {
            type: String, value: '', observer: function (newVal, oldVal) {
                this.data.roomID = newVal;
            }
        },
        roomname: { type: String, value: 'undefined' }
    },

    data: {
        isCaster: true,
        userName: '1212',
        userID: '111',
        roomID: '',
        pusherContext: null,
        playerContext: null,
        unload: 1,
        isInRoom: 0,
        unfold: false,
        mainPusherInfoUrl: '',
        visualPlayersUrl: ''
    },

    methods: {
        start() {
            var self = this;
            if (self.data.isCaster == false) {
                //观众
                self.enter();
            } else {
                //主播
                ApiLive.open({
                  success: ({data}) => {
                    this.triggerEvent('AnchorInfo', data)
                    this.setData({ mainPusherInfoUrl: data.pushUrl })
                    liveroom.setListener({ onRoomDestroy: self.onRoomDestroy })
                    this.data.pusherContext = wx.createLivePusherContext('pusher', self)
                    this.data.pusherContext.start()
                  },
                  fail: () => {
                    this.triggerEvent('RoomEvent', { tag: 'error', code: -9002, detail: `获取推流地址失败` })
                  }
                })
            }
        },

        enter() {
          const self = this
          liveroom.setListener({ onRoomDestroy: this.onRoomDestroy });
          ApiLive.joinBroadcast({
            data: {
              roomId: self.data.roomID,
              forwarderId: 12
            },
            success: ({ data }) => {
              // console.log(data)
              this.setData({ visualPlayersUrl: data.rtmpUrl || data.flvUrl })
              this.triggerEvent('AnchorInfo', data)
            },
            fail: (e) => {
              console.log(e)
              if (!this.data.unload) {
                this.data.playerContex && this.data.playerContext.stop();
                this.triggerEvent('RoomEvent', { tag: 'error', code: -9003, detail: 'enterRoom 失败' })
              }
            }
          })
        },

        // 需要
        onMainPush(ret) {
            console.log(ret.detail.code)
            switch (ret.detail.code) {
                case -1307: {
                    liveroom.exitRoom({});
                    this.triggerEvent('RoomEvent', { tag: 'error', code: -1307, detail: '推流连接断开' })
                    break;
                }
                case 5000: {
                    liveroom.exitRoom({});
                    this.triggerEvent('RoomEvent', { tag: 'error', code: 5000, detail: '收到5000就退房' })
                    break;
                }
                case -1301: {
                    this.triggerEvent('RoomEvent', { tag: 'error', code: -1301, detail: '打开摄像头失败' })
                    break;
                }
                case -1302: {
                    this.triggerEvent('RoomEvent', { tag: 'error', code: -1302, detail: '打开麦克风失败' })
                    break;
                }
                case -1305 : {
                    this.triggerEvent('RoomEvent', { tag: 'error', code: -1305, detail: '不支持的视频分辨率' })
                    break;
                }
                case -1306 : {
                    this.triggerEvent('RoomEvent', { tag: 'error', code: -1306, detail: '不支持的音频采样率' })
                    break;
                }
                default: {
                    break;
                }
            }
        },

        onMainError(e) {
          var self = this;
          console.error("onMainError called: ", e)
          self.triggerEvent('room-event', {
              tag: 'error',
              code: -1,
              detail: e.detail && e.detail.errMsg || "推流错误"
          })
        },

        onMainPlayState(e) {
            console.log('===> onMainPlayState: ', e)
            var self = this;
            //主播拉流失败不抛错误事件出去
            if (self.data.isCaster == true) {
              return;
            }
            switch (e.detail.code) {
              case -2301: {
                // 多次拉流失败
                console.error('多次拉流失败')
                self.triggerEvent('RoomEvent', {
                  tag: 'error',
                  code: e.detail.code,
                  detail: '多次拉流失败'
                });
                break;
              };
            }
        },

        onMainPlayError(e) {
          // TODO 监听主播未直播
          console.log('===> onMainPlayError: ', e)
          this.triggerEvent('RoomEvent', {
            tag: 'error',
            code: e.detail.code || -2301,
            detail: e.detail.errMsg || '拉流失败'
          });
        },

        onRoomDestroy() {
            _this && _this.triggerEvent('RoomEvent', { tag: 'roomClosed', code: -9006, detail: '房间已经解散了' })
        },

        stop() {
            var self = this;
            self.data.pusherContext && self.data.pusherContext.stop();
            self.data.playerContext && self.data.playerContext.stop();
            self.setData({
                unload: 1,
                visualPlayersUrl: '',
                pusherContext: null,
                playerContext: null
            });
            liveroom.setListener({});
        }
    },

    attached () {
        // 保持屏幕常亮
        wx.setKeepScreenOn({ keepScreenOn: true })
        _this = this;
        this.data.isCaster = this.data.role == 'anchor';
        console.log(this.data)
        this.setData({ isCaster: this.data.isCaster, unload: 0 });
    },

    detached() {
        _this = null;
        this.stop();
        wx.setKeepScreenOn({ keepScreenOn: false })
    },

})
