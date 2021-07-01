/**
 * @file /src/config/index.js
 * @author shihongxins
 * @description 封装项目环境配置
 */

// 获取当前运行环境
// console.log('import.meta.env', import.meta.env);
const env = import.meta.env.MODE || 'development';

// 不同环境配置
const envconfig = {
  development: {
    baseAPI: '/api',
  },
  test: {
    baseAPI: '/api',
  },
  production: {
    baseAPI: '/api',
  },
};
// 导出配置对象
export default {
  namespace: 'manager',
  env,
  ...envconfig[env],
  // 联调或正式上线时要改为 false ，request 去请求 baseAPI （当实现部分功能的时候也可关闭mock，在指定的请求中单独配置 mock）
  mock: true,
  mockAPI: 'https://www.fastmock.site/mock/bcae458fb84360a54496240b47bcbd42/manager',
};
