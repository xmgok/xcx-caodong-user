import business from '../../../../utils/business'
import ApiLive from '../../../../api/live'

Page({
  data: {
    info: {}
  },

  onLoad ({ id, scene }) {
    scene = business.sceneParse(scene)

    this.setData({
      roomId: scene.id || id
    })
  },

  onShow () {
    ApiLive.getLiveInfo({
      data: { roomId: this.data.roomId },
      success: ({ data }) => {
        this.setData({
          info: {
            ...data,
            _startTime: data.startTime.substring(5, 16)
          }
        })
      }
    })
  }
})
