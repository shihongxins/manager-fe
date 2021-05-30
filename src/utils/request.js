/**
 * @file /src/utils/request.js
 * @author shihongxins
 * @description axios 二次封装
 */
import axios from 'axios'
import envconfig from '../config'

// 创建 axios 实例，设置全局配置
const service = axios.create({
  // 根据不同运行环境，全局设置默认 axios 实例的基础 URL
  baseURL: envconfig.env==='production' ? envconfig.baseAPI : envconfig.mockAPI,
  timeout: 8000
})

/**
 * @param {Object} config axios instance 实例中本次请求的配置参数
 * @returns {Promise} axios.response
 * @author shihongxins
 * @description axios 二次封装 v2 , 通过它直接发送请求，或通过它的子方法发送 RESTful 请求
 */
function request(config) {
  config = config || {}
  console.log(config)
  // 未设置请求方式，默认发送 get 请求
  config.method = String(config.method || 'get').toLocaleLowerCase()
  // 如果是 get 请求，且没有 config.params 参数的话
  if (config.method === 'get' && (!config.params)) {
    config.params = config.data
  }
  // 非生产环境 且 开启了临时 mock ，修改本次请求的 baseURL 到 envconfig.mockAPI
  if (config.isMock && envconfig.env !== 'production') {
    config.baseURL = envconfig.mockAPI
  }
  // 发送请求，返回结果
  return service(config)
}

// 循环遍历生成 RESTful 请求方式
['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
  /**
   * @param {String} url 请求地址
   * @param {*} data 请求参数
   * @param {Object} options 请求配置
   * @returns {Promise} axios.response
   * @author shihongxins
   * @description 生成的多种 RESTful 请求方式，绑定为 request 的子方法
   */
  request[method] = (url, data, options = {}) => {
    options.method = method;
    return request({
      url,
      data,
      ...options
    })
  }
})

// 导出封装好的实例
export { request as default, request, service }
