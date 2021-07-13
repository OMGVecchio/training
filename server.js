const http = require('http')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

/** 休眠延迟 */
const sleep = async timing => await new Promise(r => setTimeout(r, timing))

http.createServer(async (req, res) => {

  /** 解析静态资源 */
  const static = async (fileName, timing) => {

    /** 使用 esModule 的时候，会严格要求 JavaScript 的 MIME 类型 */
    if (fileName.match(/^esModule/)) {
      res.setHeader('Content-Type', 'text/javascript')
    }

    try {
      const fullPath = path.resolve(__dirname, 'static', fileName)

      /** 根据 queryString 的 timing 参数设置资源延迟加载时间 */
      if (timing) {
        const fileContent = await promisify(fs.readFile)(fullPath)
        await sleep(timing)
        res.end(fileContent)
        return
      }

      const writeStream = fs.createReadStream(fullPath).on('error', () => res.end())
      if (writeStream) {
        writeStream.pipe(res)
      }
    } catch (err) {
      res.end()
    }
  }

  /** 构造 URL 对象 */
  const urlObj = new URL(req.url, `http://${req.headers.host}`)
  const { pathname, searchParams } = urlObj
  const timing = searchParams.get('timing')

  /** 根据不同路由，处理不同模块的逻辑操作 */
  if (pathname.match(/^\/$/)) {
    await static('index.html', timing)
  } else if (pathname.match(/^\/api/)) {
    switch (pathname.slice(5)) {
      case '/form':
        res.end()
    }
    res.end()
  } else {
    await static(pathname.slice(1), timing)
  }

}).listen(3000)
