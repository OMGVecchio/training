import { fileURLToPath } from 'url'

/**
 * commonJS 有 __dirname 变量
 * esModule 通过其他方式达到类似效果
 */
Object.defineProperty(global, '__dirname__', {
  get() {
    return meta => {
      if (meta && meta.url) {
        const fullFileName = fileURLToPath(meta.url) || ''
        return fullFileName.slice(0, fullFileName.lastIndexOf('/')) || '/'
      }
      console.error('please set correct \'import\' param')
      return ''
    }
  }
})
