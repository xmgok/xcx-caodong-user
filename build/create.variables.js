// 将scss变量导出为js文件，以便在js中可使用

const fs = require('fs')
const path = require('path')
const exporter = require('sass-export').exporter

const root = path.resolve(__dirname, '..')

const options = {
  inputFiles: ['./src/styles/_variables.scss', './src/styles/_theme.scss'],
  includePaths: ['./src/styles/'] // don't forget this is the folder path not the files
}

const asArray = exporter(options).getArray()
const obj = {}
asArray.forEach(v => {
  obj[v.name] = v.compiledValue
})

fs.writeFileSync(
  `${root}/src/utils/variables.js`,
  `// This file was automatically generated. Do not edit by hand!\\n\\n

export default ${JSON.stringify(obj, null, '\t')}
  `,
  { encoding: 'utf-8' }
)
