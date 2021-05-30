/**
 * @file /src/config/index.js
 * @author shihongxins
 * @description 封装项目环境配置
 */

// 获取当前运行环境
console.log('import.meta.env', import.meta.env)
const env = import.meta.env.MODE || 'development'

// 不同环境配置
const envconfig = {
  dev: {
    baseAPI: '/',
  },
  test: {
    baseAPI: '/test.website.com/api',
  },
  prod: {
    baseAPI: '/website.com/api',
  },
}
// 导出配置对象
export default {
  namespace: 'manager',
  env,
  ...envconfig[env],
  mock: true,
  mockAPI: 'https://www.fastmock.site/mock/bcae458fb84360a54496240b47bcbd42/manager'
}
