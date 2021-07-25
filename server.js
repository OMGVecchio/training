import http from 'http'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import './env/compatible.js'
import sleep from './utils/sleep.js'

http.createServer(async (req, res) => {

  /** 解析静态资源 */
  const staticResource = async (fileName, timing) => {

    /** 使用 esModule 的时候，会严格要求 JavaScript 的 MIME 类型 */
    if (fileName.match(/^esModule/)) {
      res.setHeader('Content-Type', 'text/javascript')
    }

    try {
      const fullPath = path.resolve(__dirname__(import.meta), 'static', fileName)

      /** 根据 queryString 的 timing 参数设置资源延迟加载时间 */
      if (timing) {
        await sleep(timing)
        const fileContent = await promisify(fs.readFile)(fullPath)
        res.end(fileContent)
        return
      }

      const writeStream = fs.createReadStream(fullPath).on('error', () => res.end())
      if (writeStream) {
        writeStream.pipe(res)
      }
    } catch (err) {
      console.error(err)
      res.end()
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  /** 构造 URL 对象 */
  const urlObj = new URL(req.url, `http://${req.headers.host}`)
  const { pathname, searchParams } = urlObj
  const timing = searchParams.get('timing')

  /** 根据不同路由，处理不同模块的逻辑操作 */
  if (pathname.match(/^\/$/)) {
    await staticResource('index.html', timing)
  } else if (pathname.match(/^\/api/)) {
    switch (pathname.slice(5)) {
      case '/form':
        res.end()
    }
    res.end()
  } else {
    await staticResource(pathname.slice(1), timing)
  }

}).listen(3000)
