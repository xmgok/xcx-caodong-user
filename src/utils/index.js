/**
 * 将数组拆分成多个 size 长度的块，并组成一个新数组
 * @param array 需要被处理的数组
 * @param size 每个块的长度
 * @returns {array} 返回一个拆分好的新数组
 */
export function chunkArray (array, size) {
  const length = array.length
  if (!length || !size || size < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  let result = new Array(Math.ceil(length / size))
  while (index < length) {
    result[resIndex++] = array.slice(index, (index += size))
  }
  return result
}

/**
 * 将时间转成友好的格式（几秒前、几分钟前、几小时前、几天前等）
 * @param time {string} 时间字符串
 * @returns {string} 格式化后的时间
 */
export function beautifyTime (time) {
  if (!time) return ''

  const publishTime = Date.parse(time.replace(/-/gi, '/')) / 1000
  let timeNow = parseInt(new Date().getTime() / 1000)
  const padZero = (num) => num < 10 ? `0${num}` : num

  let date = new Date(publishTime * 1000)
  let Y = date.getFullYear()
  let M = padZero(date.getMonth() + 1)
  let D = padZero(date.getDate())
  let H = padZero(date.getHours())
  let m = padZero(date.getMinutes())
  // let s = padLeftZero(date.getSeconds())

  let diff = timeNow - publishTime
  const dDays = parseInt(diff / 86400)
  const dHours = parseInt(diff / 3600)
  let dMinutes = parseInt(diff / 60)
  const dSeconds = parseInt(diff)

  if (dDays > 0 && dDays < 3) {
    return `${dDays}天前`
  } else if (dDays <= 0 && dHours > 0) {
    return `${dHours}小时前`
  } else if (dHours <= 0 && dMinutes > 0) {
    return `${dMinutes}分钟前`
  } else if (dSeconds < 60) {
    if (dSeconds <= 0) {
      return '刚刚发表'
    } else {
      return `${dSeconds}秒前`
    }
  } else if (dDays >= 3 && dDays < 30) {
    return `${M}-${D} ${H}:${m}`
  } else if (dDays >= 30) {
    return `${Y}-${M}-${D} ${H}:${m}`
  }
}

/**
 * 日期时间格式化
 * @param date {Date} 时间
 * @param fmtExp 格式化模板字符串（正则）。默认为 yy-MM-dd
 * @returns {string} 返回格式化后的时间
 */
export const dateFormat = (date, fmtExp = 'yy-MM-dd') => {
  date = new Date(Number(date))
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmtExp)) {
    fmtExp = fmtExp
      .replace(RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmtExp)) {
      fmtExp = fmtExp.replace(RegExp.$1, (
        RegExp.$1.length === 1)
        ? (o[k])
        : (('00' + o[k]).substr(('' + o[k]).length))
      )
    }
  }
  return fmtExp
}

/**
 * FIXME value不兼容传入非数字
 * 如果字符串长度小于 length 则在左侧填充字符。如果超出长度则截断超出的部分
 * @param value
 * @param place
 * @returns {string}
 */
export function padStart (value = 0, place = 2) {
  const valueLen = value.toString().length
  const zeroLen = place - valueLen
  const arr = []
  for (let i = 0; i < zeroLen; i++) {
    arr.push('0')
  }
  const zero = arr.join('')
  if (value < Math.pow(10, place)) {
    return `${zero}${value}`
  }
  return `${value}`
}

export function secondsToTime (seconds = 0) {
  const day = Math.floor(seconds / 3600 / 24)
  const hours = Math.floor(seconds / 3600 % 24)
  const minutes = Math.floor(seconds % 3600 / 60)
  const sec = Math.floor(seconds % 60)
  return {
    dayMergeToHours: padStart(day * 24 + hours),
    day: padStart(day),
    hours: padStart(hours),
    minutes: padStart(minutes),
    seconds: padStart(sec),
    allSeconds: padStart(seconds)
  }
}

// 倒计时，倒计时应该是0秒瞬间就结束(最后读秒到1，并把数字1展示1秒之后，为0瞬间，正式结束，支付宝的倒计时就是如此)，而不是把0展示一秒，-1秒才结束。
export function timeCountDown (json) {
  const opts = Object.assign({
    seconds: 0, // 总秒数
    isToTime: true, // 是否转换成时间
    isHandleRunWhenZero: false, // 是否运行run回调，当传入的总秒数为0
    isHandleOverWhenZero: false, // 是否运行over回调，当传入的总秒数为0
    isHandleRunWhenOver: false, // 是否运行run回调，当倒计时结束的瞬间
    callback: {
      run: function () {
      },
      over: function () {
      }
    }
  }, json)
  let seconds = Number(opts.seconds) || 0 // 总秒数
  if (seconds < 0) { // 当传入的总秒数小于0则当做0处理
    seconds = 0
  }
  // 运行的回调
  const run = opts.callback.run || function () {
  }
  // 结束的回调
  const over = opts.callback.over || function () {
  }
  const runFn = function () { // 对运行的回调进行二次封装
    if (opts.isToTime) {
      run(secondsToTime(seconds)) // 运行时的回调
    } else {
      run({ day: 0, hours: 0, minutes: 0, seconds: 0, allSeconds: seconds }) // 运行时的回调
    }
  }
  if (seconds === 0) { // 传入总秒数为0时，是否触发一次运行时的回调
    if (opts.isHandleRunWhenZero) {
      runFn() // 运行时的回调
    }
    if (opts.isHandleOverWhenZero) {
      over() // 结束时的回调
    }
  }
  if (seconds > 0) { // 时间大于0秒，因为0秒瞬间倒计时就已经结束了。
    runFn() // 运行时的回调
    // 倒计时走你
    const timer = setInterval(function () {
      seconds--
      if (seconds === 0) {
        clearInterval(timer) // 清除定时器
        if (opts.isHandleRunWhenOver) { // 倒计时结束瞬间，是否触发一次运行时的回调
          runFn() // 运行时的回调
        }
        over() // 结束时的回调
      } else {
        runFn() // 运行时的回调
      }
    }, 1000)
    timeCountDown.timer = timer
  }
}

export function dateParse (strDate, isTimeStamp = false) {
  const date = new Date(isTimeStamp ? strDate : strDate.replace(/-/gi, '/'))
  return {
    year: date.getFullYear(),
    month: padStart(date.getMonth() + 1),
    date: padStart(date.getDate()),
    hours: padStart(date.getHours()),
    minutes: padStart(date.getMinutes()),
    seconds: padStart(date.getSeconds())
  }
}
