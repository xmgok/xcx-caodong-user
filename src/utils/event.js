function on (name, fn) {
  const eventData = Event.data
  if (eventData.hasOwnProperty(name)) {
    eventData[name].push(fn)
  } else {
    eventData[name] = [fn]
  }
  return this
}

function fire (name, data, thisArg) {
  const fnList = Event.data[name]
  if (!fnList) return
  const len = fnList.length
  let fn
  if (!fnList.length) {
    throw new Error(`Cannot find broadcast event ${name}`)
  }
  for (let i = 0; i < len; i++) {
    fn = fnList[i]
    fn.apply(thisArg, [data, name])
  }
  return this
}

const Event = {
  on: on,
  fire: fire,
  $on: on,
  $emit: fire,
  data: {}
}

export default Event
