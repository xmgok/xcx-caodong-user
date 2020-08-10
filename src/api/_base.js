const app = getApp()

export const apiFunc = (url, options, type = 'post') => {
  app.ajax({
    url: `${url}`,
    type,
    ...options,
    success: (res) => {
      if (options.success) options.success(res)
    },
    fail: (res) => {
      if (options.fail) options.fail(res)
    },
    complete: (res) => {
      if (options.complete) options.complete(res)
    }
  })
}
