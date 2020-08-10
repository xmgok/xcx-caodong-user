const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const appJson = fs.readFileSync(`${root}/src/app.json`, { encoding: 'utf-8' })
const objAppJson = JSON.parse(appJson)
const result = objAppJson.pages.map(v => {
  const obj = {
    path: v
  }
  const pageJson = fs.readFileSync(`${root}/src/${v}.json`, { encoding: 'utf-8' })
  const objPageJson = JSON.parse(pageJson)
  obj.title = objPageJson.navigationBarTitleTextBak || objPageJson.navigationBarTitleText || ''
  return obj
})

objAppJson.subpackages.forEach(v1 => {
  v1.pages.forEach(v => {
    const path = v1.root + v
    const obj = { path }
    const pageJson = fs.readFileSync(`${root}/src/${path}.json`, { encoding: 'utf-8' })
    const objPageJson = JSON.parse(pageJson)
    obj.title = objPageJson.navigationBarTitleTextBak || objPageJson.navigationBarTitleText || ''
    result.push(obj)
  })
})
fs.writeFileSync(`${root}/title.json`, JSON.stringify(result, null, '\t'), { encoding: 'utf-8' })
