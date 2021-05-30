/**
 * @file /src/api/index.js
 * @author shihongxins
 * @description 项目的请求 API 集合对象
 */
import { request, service } from '../utils/request'
import { ElMessage } from 'element-plus'

const CODE = {
  SUCCESS: 200, // 成功
  PARAM_ERROR: 10001, // 参数错误
  ACCOUNT_ERROR: 20001, // 账号或密码错误
  LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001, // 认证失败或过期
}

// 约定的 code 提示信息
const ERROR_MESSAGE = {
  '50001': '认证失效，请重新登录！'
}

// axios 响应拦截器，进行响应数据判断
service.interceptors.response.use(
  (res) => {
    // 请求成功
    if (res.status === 200 || res.status === 304) {
      // 是否返回信息
      if (res.data !== undefined) {
        // 校验返回数据
        const result = res.data
        if (result.code === 200 && result.data !== undefined) {
          // 校验通过，直接返回纯数据
          return result.data
        } else {
          // 校验不通过，根据约定的 code 提示信息
          ElMessage.error((ERROR_MESSAGE[result.code] || "返回数据格式有误！"))
        }
      } else {
        ElMessage.error('没有返回信息！');
      }
    } else {
      ElMessage.error('网络请求异常，请稍后重试!')
    }
  },
  // 拦截失败
  (error) => {
    ElMessage.error(error.message)
  }
)

// 导出项目的请求 API 集合对象
export default {
  /**
   * @param {String} userName 
   * @param {String} userPwd 
   * @returns {Promise} Promise
   * @description POST 提交用户登录请求
   */
  login(userName, userPwd) {
    if (userName && userPwd) {
      return request.post('/api/login', { userName, userPwd })
    } else {
      ElMessage.warning('请填写用户名和账号')
    }
  }
}
