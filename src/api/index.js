/**
 * @file /src/api/index.js
 * @author shihongxins
 * @description 项目的请求 API 集合对象
 */
import { ElMessage } from 'element-plus';
import router from '@/router';
import { request, service } from '../utils/request';
import storage from '../utils/storage';

const CODE = {
  SUCCESS: 200, // 成功
  PARAM_ERROR: 10001, // 参数错误
  ACCOUNT_ERROR: 20001, // 账号或密码错误
  LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001, // 认证失败或过期
};

// 约定的 code 提示信息
const ERROR_MESSAGE = {
  10001: '缺少参数，或参数不合法！',
  20001: '账号或密码错误！',
  30001: '用户未登录，请先登录',
  40001: '业务请求失败',
  50001: '认证失效，请重新登录！',
};

// axios 请求拦截器
service.interceptors.request.use(
  (req) => {
    // JWT 认证，每次发送 API 请求都会携带 token ，没有就转到登录页
    const { token } = storage.getItem('userInfo') || {};
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  // 拦截失败
  (error) => {
    ElMessage.error(error.message);
  },
);

// axios 响应拦截器，进行响应数据判断
service.interceptors.response.use(
  (res) => {
    // 请求成功
    if (res.status === 200 || res.status === 304) {
      // 是否返回信息
      if (res.data !== undefined) {
        // 校验返回数据
        const result = res.data;
        if (result.code === 200 && result.data !== undefined) {
          // 校验通过，直接返回纯数据
          return result.data;
        }
        // 校验不通过，根据约定的 code 提示信息
        ElMessage.error((ERROR_MESSAGE[result.code] || '返回数据格式有误！'));
        // 未登录或登录超时，2 秒后跳转到登录页
        if (result && (result.code === CODE.AUTH_ERROR || result.code === CODE.LOGIN_ERROR)) {
          setTimeout(() => {
            storage.removeItem('userInfo');
            router.push({ name: 'Login' });
          }, 2000);
        }
      } else {
        ElMessage.error('没有返回信息！');
      }
    } else {
      ElMessage.error('网络请求异常，请稍后重试!');
    }
    return res;
  },
  // 拦截失败
  (error) => {
    ElMessage.error(error.message);
  },
);

// 导出项目的请求 API 集合对象
export default {
  /**
   * @param {String} userName
   * @param {String} userPwd
   * @returns {Promise} Promise
   * @description POST 提交用户登录请求
   */
  async login(userName, userPwd) {
    let userInfo = {};
    try {
      if (userName && userPwd) {
        userInfo = await request.post('/users/login', { userName, userPwd });
      } else {
        ElMessage.warning('请填写用户名和密码');
      }
    } catch (e) {
      console.error(e);
      ElMessage.error('登录出错！');
    }
    return userInfo;
  },
  async getNoticeCount() {
    let count = 0;
    try {
      count = await request.get('/leave/count', {}, { isMock: true });
    } catch (e) {
      console.error(e);
      ElMessage.error('查询通知出错！');
    }
    return count;
  },
  async getMenuList() {
    let list = [];
    try {
      list = await request.get('/menu/list', {}, { isMock: true });
    } catch (e) {
      console.error(e);
      ElMessage.error('获取菜单列表出错！');
    }
    return list;
  },
  async getUserList(data) {
    let list = [];
    try {
      list = await request.get('/users/list', data);
    } catch (e) {
      console.error(e);
      ElMessage.error('获取用户列表出错！');
    }
    return list;
  },
  async userDel(userIds) {
    let delCount = 0;
    try {
      delCount = await request.post('/users/delete', userIds, { isMock: false });
    } catch (e) {
      console.error(e);
      ElMessage.error('删除用户出错！');
    }
    return delCount;
  },
  async userOperate(userInfo) {
    let res = false;
    try {
      const data = await request.post('/users/operate', userInfo, { isMock: false });
      if (data) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${userInfo.title}出错！`);
    }
    return res;
  },
  async getRoleList() {
    let list = [];
    try {
      list = await request.get('/roles/alllist', {}, { isMock: true });
    } catch (e) {
      console.error(e);
      ElMessage.error('获取系统角色列表出错！');
    }
    return list;
  },
  async getDeptList() {
    let list = [];
    try {
      list = await request.get('/dept/list', {}, { isMock: true });
    } catch (e) {
      console.error(e);
      ElMessage.error('获取部门列表出错！');
    }
    return list;
  },
};
