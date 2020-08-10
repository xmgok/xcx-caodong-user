const gulp = require('gulp')
const del = require('del')
const gulpRename = require('gulp-rename')
const plumber = require('gulp-plumber')
const gulpScss = require('gulp-sass')
const px2rpx = require('gulp-px2rpx')
const gulpCleanCss = require('gulp-clean-css')
const gulpImagemin = require('gulp-imagemin')
const uglifyes = require('uglify-es')
const gulpUglify = require('gulp-uglify/composer')(uglifyes, console)
const jsonMinify = require('gulp-json-minify')
const eslint = require('gulp-eslint')
const replace = require('gulp-batch-replace') // 内容替换

const replaceContent = [
  ['/*@import "/styles/common.scss";*/', '@import "/styles/common.wxss";'],
  ['/*@import "/styles/utils.scss";*/', '@import "/styles/utils.wxss";'],
  ['/*@import "/styles/icons.scss";*/', '@import "/styles/icons.wxss";'],
  ['/*@import "/wxParse/wxParse.scss";*/', '@import "/wxParse/wxParse.wxss";']
]

// 生成wxss文件，用来瘦身。
gulp.task(`create-wxss`, function () {
  return gulp.src([
    'src/styles/common.scss',
    'src/styles/utils.scss',
    'src/styles/icons.scss'
  ])
    .pipe(plumber())
    .pipe(gulpScss({
      outputStyle: 'expanded'
    }))
    .pipe(gulpRename((path) => {
      path.extname = '.wxss'
    }))
    .pipe(px2rpx({
      screenWidth: 375, // 设计稿屏幕, 默认750
      wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
      remPrecision: 6 // 小数精度, 默认6
    }))
    .pipe(replace(replaceContent))
    .pipe(gulp.dest('dist/styles'))
})

gulp.task('clean-dist', cb => del(['dist', '!dist/project.config.json'], cb))

gulp.task('dev-img', () => {
  return gulp.src(['src/**/*.{jpg,png,jpeg,gif,svg}'])
    .pipe(gulp.dest('dist/'))
})

gulp.task('dev-js', () => {
  return gulp.src(['src/**/*.js'])
    .pipe(plumber())
    .pipe(gulp.dest('dist/'))
})

gulp.task('dev-json', () => {
  return gulp.src(['src/**/*.json'])
    .pipe(plumber())
    .pipe(gulp.dest('dist/'))
})

gulp.task('dev-wxml', () => {
  return gulp.src(['src/**/*.wxml'])
    .pipe(gulp.dest('dist/'))
})

gulp.task('dev-wxs', () => {
  return gulp.src(['src/**/*.wxs'])
    .pipe(gulp.dest('dist/'))
})

gulp.task('dev-wxss', () => {
  return gulp.src(['src/**/*.scss', '!src/styles/**/*.scss'])
    .pipe(plumber())
    .pipe(gulpScss({
      outputStyle: 'expanded'
    }))
    .pipe(gulpRename((path) => {
      path.extname = '.wxss'
    }))
    .pipe(px2rpx({
      screenWidth: 375, // 设计稿屏幕, 默认750
      wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
      remPrecision: 6 // 小数精度, 默认6
    }))
    .pipe(replace(replaceContent))
    .pipe(gulp.dest('dist'))
})

gulp.task('min-js', () => {
  return gulp.src(['src/**/*.js'])
  // .pipe(plumber())
    .pipe(gulpUglify({
      ecma: 8,
      output: {
        // 最紧凑的输出
        beautify: false
      },
      compress: {
        // 删除所有的 `console` 语句
        // drop_console: true // 清除console之后，线上不好调试。
      }
    }))
    .pipe(gulp.dest('dist/'))
})

gulp.task('min-json', () => gulp.src(['src/**/*.json']) // , '!src/ext.json'
  .pipe(plumber())
  .pipe(jsonMinify())
  .pipe(gulp.dest('dist/'))
)

// 不要用这个
gulp.task('min-wxss', () => {
  return gulp.src(['src/**/*.scss', '!src/styles/**/*.scss'])
    .pipe(gulpScss({
      outputStyle: 'expanded'
    }))
    .pipe(gulpRename((path) => {
      path.extname = '.wxss'
    }))
    .pipe(gulpCleanCss({
      compatibility: 'units.rpx'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('min-img', () => {
  return gulp.src(['src/**/*.{jpg,png,jpeg,gif,svg}'])
    .pipe(gulpImagemin({
      progressive: true
    }))
    .pipe(gulp.dest('dist/'))
})

gulp.task('min-wxml', () => {
  return gulp.src(['src/**/*.wxml'])
    .pipe(gulp.dest('dist/'))
})

gulp.task('watch', () => {
  gulp.watch('src/**/*.{jpg,png,jpeg,gif,svg}', gulp.series('dev-img'))
  gulp.watch('src/**/*.js', gulp.series('dev-js', 'es-lint'))
  gulp.watch('src/**/*.json', gulp.series('dev-json'))
  gulp.watch('src/**/*.scss', gulp.series(['dev-wxss', 'create-wxss']))
  gulp.watch('src/**/*.wxml', gulp.series('dev-wxml'))
})

gulp.task('es-lint', () =>
  gulp.src(['src/**/*.js', '!node_modules/**', '!src/components/iconfont/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
)

gulp.task('dev', gulp.series('create-wxss', 'dev-img', 'dev-js', 'dev-json', 'dev-wxml', 'dev-wxs', 'dev-wxss', 'watch'))
gulp.task('build', gulp.series('clean-dist', 'create-wxss', 'min-img', 'min-js', 'dev-json', 'dev-wxml', 'dev-wxs', 'dev-wxss'))
