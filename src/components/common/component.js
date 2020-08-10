import { basic } from '../mixins/basic'
import { observe } from '../mixins/observer/index'

function mapKeys (source, target, map) {
  Object.keys(map).forEach(key => {
    if (source[key]) {
      target[map[key]] = source[key]
    }
  })
}

// 基础组件类
// 组件可基于此扩展，以简化组件编写，共享部分组件逻辑
function BaseComponent (baseOptions = {}) {
  const options = {}

  // 组件属性键值映射成Vue风格
  mapKeys(baseOptions, options, {
    data: 'data',
    props: 'properties',
    mixins: 'behaviors',
    methods: 'methods',
    beforeCreate: 'created',
    created: 'attached',
    mounted: 'ready',
    relations: 'relations',
    destroyed: 'detached',
    classes: 'externalClasses'
  })

  const { relation } = baseOptions
  if (relation) {
    options.relations = Object.assign(options.relations || {}, {
      [`../${relation.name}/${relation.name}`]: relation
    })
  }

  // add default externalClasses
  options.externalClasses = options.externalClasses || []
  options.externalClasses.push('custom-class')

  // add default behaviors
  options.behaviors = options.behaviors || []
  options.behaviors.push(basic)

  // map field to form-field behavior
  if (baseOptions.field) {
    options.behaviors.push('wx://form-field')
  }

  // add default options
  options.options = {
    multipleSlots: true,
    addGlobalClass: true
  }

  observe(baseOptions, options)
  Component(options)
}

export { BaseComponent }
