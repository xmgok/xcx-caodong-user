### 挂件类型type
* 1、商品列表
  - nameType：
    - 1、文字样式
    - 2、图片样式
  - searchType：
    - 1、按条件搜索
    - 2、按商品搜索
* 2、海报切图
* 3、轮播图
* 4、快捷入口
* 5、优惠券
* 6、活动
* 7、banner

### 分销接口文档
* https://git.wowkai.cn/cd/cdmall-distribution

### 七牛路径
* https://qiniu.icaodong.com/xcx/common/staff-wdewm.png?v=1.0.0

### 列表参考
* 吸粉列表：`./src/pages/fans/fans.wxml`。

### 草动项目 commit 提交规范
* chore：构建过程或辅助工具的变动
* docs：文档(documentation)
* feat：新功能(feature)
* fix：修补bug
* perf：性能优化(performance)
* refactor：重构(即不是新增功能，也不是修改bug的代码变动)
* style：格式(不影响代码运行的变动)
* test：增加测试
* ci：自动化部署

### 案例
git commit -m "feat: 新增砍价功能"

### 小程序不同环境打不同接口
```
开发时 就是 - 草动内测版(开发版 - 调用apidev接口)
发uat 就是 - 草动内测版(体验版 - 调用apiuat接口)
发pre 就是 - 草动商城+(体验版 - 调用apipre接口)
发正式 就是 - 草动商城+(正式版 - 调用api接口)

其他租户的小程序发体验版调用的接口是apipre或api(由宋帆控制)
```

### 主分支 - 注释直播相关业务 - 在master-live分支放开直播相关业务
在app.json中把
```
    {
      "root": "pages-subpackages/live/",
      "pages": [
        "pages/live-list/index",
        "pages/live-list2/index",
        "pages/live-room/index",
        "pages/live-board/index"
      ],
      "plugins": {
        "live-player-plugin": {
          "version": "1.0.1",
          "provider": "wx2b03c6e691cd7370"
        }
      }
    }
```
更换为了
```
    {
      "root": "pages-subpackages/live/",
      "pages": [
        "pages/live-list/index",
        "pages/live-list2/index",
        "pages/live-room/index",
        "pages/live-board/index"
      ]
    }
```