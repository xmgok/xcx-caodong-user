## 问题汇总

### 优化

- 主要业务代码优化（逻辑梳理、完善文档）
  - app.js [✓]
  - index.js
  - business.js
  - 商品详情页
  - 商品购买组件
  - share分享组件及分享流程优化
  - 授权
  - 海报生成逻辑优化

- 可维护性优化
  - 弃用CommonJs，用ES6 Module
  - wx.request Promise化
  - 工具函数优化（完善文档）
  - 更新日志记录，每周复盘

- 性能优化
  - 引入微信提供的实时日志功能，方便调试
  - 根据开发者工具的体验评分优化项目性能及体验
  
- 其它优化
  - store 状态管理
  - 接口引入优化；服务层处理
  - 主题色换肤支持优化

#### 构建相关

- gulp构建优化
- cli 自动化发布小程序
- 版本管理
- eslint
- stylelint

#### 基建

- 基础组件库抽象
- 脚手架搭建
- 创建demo库、样板库
- 知识沉淀、技能提升

### BUG

- 分页mixin数据会串