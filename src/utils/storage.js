/**
 * @file /src/utils/storage.js
 * @author shihongxins
 * @description localStorage 的二次封装，命名空间，引用类型自动转换，异常捕获
 */
import envconfig from '../config'
const NAME_SPACE = envconfig.namespace

export default {
  getStorage () {
    try {
      return JSON.parse(window.localStorage.getItem(NAME_SPACE) || '{}');
    } catch (e) {
      console.error(e)
    }
  },
  setStorage(data) {
    try {
      window.localStorage.setItem(NAME_SPACE, JSON.stringify(data))
    } catch (e) {
      console.error(e)
    }
  },
  getItem (key) {
    const data = this.getStorage()
    return data[key]
  },
  setItem (key,value) {
    const data = this.getStorage()
    data[key] = value
    this.setStorage(data)
  },
  removeItem (key) {
    const data = this.getStorage()
    delete data[key]
    this.setStorage(data)
  },
  clear () {
    this.setStorage({})
  }
}
