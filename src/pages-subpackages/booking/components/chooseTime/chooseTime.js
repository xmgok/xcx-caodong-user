function getWeek (a, chooseDate) {
  let date1 = chooseDate ? new Date(chooseDate) : new Date()
  let date2 = new Date(date1)

  date2.setDate(date1.getDate() + a)
  let month2 = (date2.getMonth() + 1) > 9 ? (date2.getMonth() + 1) : ('0' + (date2.getMonth() + 1))
  let day2 = date2.getDate() > 9 ? date2.getDate() : ('0' + date2.getDate())
  let time2 = date2.getFullYear() + '-' + month2 + '-' + day2
  return time2
}

Component({
  properties: {
    type: {
      type: String,
      value: ''
    },
    technicianData: {
      type: Object,
      value: {}
    },
    day: {
      type: String,
      value: ''
    },
    time: {
      type: String,
      value: ''
    },
    week: {
      type: String,
      value: ''
    },
    timeList: {
      type: Array,
      value: []
    }
  },
  data: {
    chooseData: {
      type: '',
      technician: {},
      day: '',
      time: ''
    },
    startDay: '',
    dayList: []
  },
  ready () {
    this.setWeek()
    let chooseData = this.data.chooseData
    chooseData.day = this.data.day || this.data.dayList[0].date
    chooseData.week = this.data.week || this.data.dayList[0].week
    chooseData.yearMouth = chooseData.day.substring(0, 7)
    chooseData.time = this.data.time || ''
    this.setData({ chooseData, startDay: chooseData.day })
    this.triggerEvent('changeChooseTime', { chooseData })
  },
  methods: {
    setWeek (dayParam, chooseDate) {
      let weekName = ['日', '一', '二', '三', '四', '五', '六']
      let dayList = []
      const day = dayParam || new Date().getDay()
      weekName = weekName.splice(day, 7 - day).concat(weekName)
      for (let i = 0; i < 7; i++) {
        dayList.push({ week: weekName[i], date: getWeek(i, chooseDate), day: getWeek(i, chooseDate).substring(8) })
      }
      this.setData({ dayList })
    },
    onChooseDay ({ currentTarget }) {
      const index = currentTarget.dataset.index
      let chooseData = this.data.chooseData
      chooseData.day = this.data.dayList[index].date
      chooseData.week = this.data.dayList[index].week
      chooseData.yearMouth = chooseData.day.substring(0, 7)
      chooseData.time = ''
      this.setData({ chooseData })
      this.triggerEvent('changeChooseTime', { chooseData })
    },
    onChooseTime ({ currentTarget }) {
      const index = currentTarget.dataset.index
      const chooseTime = this.data.timeList[index]
      if (!chooseTime.isChoosable) return
      let chooseData = this.data.chooseData
      chooseData.time = chooseTime.time
      chooseData.week = this.data.chooseData.week
      this.setData({ chooseData })
      this.triggerEvent('changeChooseTime', { chooseData })
    },
    bindDateChange (e) {
      // console.log('picker发送选择改变，携带值为', e.detail.value)
      let times = e.detail.value
      let day = new Date(times).getDay()
      this.setWeek(day, times)
      let chooseData = {}
      chooseData.day = times
      chooseData.yearMouth = times.substring(0, 7)
      chooseData.time = ''
      chooseData.week = this.data.chooseData.week
      this.setData({ chooseData })
      console.log(this.data.chooseData, this.data.dayList)
      this.triggerEvent('changeChooseTime', { chooseData })
    }
  }
})
