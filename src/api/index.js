/**
 * @file /src/api/index.js
 * @author shihongxins
 * @description 项目的请求 API 集合对象
 */
import router from '@/router';
import store from '@/store';
import { request, service } from '@/utils/request';
import { ElMessage } from 'element-plus';

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
    const { token } = store.state.userInfo;
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
        // 未登录或登录超时，2 秒后跳转到登录页
        if (result && (result.code === CODE.AUTH_ERROR || result.code === CODE.LOGIN_ERROR)) {
          setTimeout(() => {
            // 清除 vuex 与 storage 中的存储的数据
            store.commit('logout');
            router.push({ name: 'Login' });
          }, 2000);
        }
        // 校验不通过，根据约定的 code 提示信息
        ElMessage.error((result.msg || ERROR_MESSAGE[result.code] || '返回数据格式有误！'));
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
        userInfo = await request.post('/user/login', { userName, userPwd });
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
      count = await request.get('/leave/count');
      store.commit('saveNoticeCount', count);
    } catch (e) {
      console.error(e);
      ElMessage.error('查询通知出错！');
    }
    return count;
  },
  async getPermissionList() {
    let res = {};
    try {
      res = await request.get('/menu/permissionList');
      store.commit('savePermissionList', res);
    } catch (e) {
      console.error(e);
      ElMessage.error('加载权限菜单出错！');
    }
    return res;
  },
  async getUserList(query) {
    let res = {};
    try {
      res = await request.get('/user/list', query);
    } catch (e) {
      console.error(e);
      ElMessage.error('获取用户列表出错！');
    }
    return res;
  },
  async userDel(userIds) {
    let delCount = 0;
    try {
      const data = await request.post('/user/delete', userIds);
      if (data && data.nModified > 0) {
        delCount = data.nModified;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error('删除用户出错！');
    }
    return delCount;
  },
  async userOperate(userInfo) {
    let res = false;
    try {
      const data = await request.post('/user/operate', userInfo);
      if (data && (data.nModified > 0 || data._id)) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${userInfo.title}出错！`);
    }
    return res;
  },
  async getRoleAllList() {
    let list = [];
    try {
      list = await request.get('/role/alllist');
    } catch (e) {
      console.error(e);
      ElMessage.error('获取系统角色列表出错！');
    }
    return list;
  },
  async getDeptList(query) {
    let list = [];
    try {
      list = await request.get('/dept/list', query);
    } catch (e) {
      console.error(e);
      ElMessage.error('获取部门列表出错！');
    }
    return list;
  },
  async getMenuList(query) {
    let list = [];
    try {
      list = await request.get('/menu/list', query);
    } catch (e) {
      console.error(e);
      ElMessage.error('获取菜单列表出错！');
    }
    return list;
  },
  async menuOperate(menuInfo) {
    let res = false;
    try {
      const data = await request.post('/menu/operate', menuInfo);
      if (data && (data.deletedCount > 0 || data.nModified > 0 || data._id)) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${menuInfo.title}出错！`);
    }
    return res;
  },
  async getRoleList(query) {
    let list = [];
    try {
      list = await request.get('/role/list', query);
    } catch (e) {
      console.error(e);
      ElMessage.error('获取系统角色列表出错！');
    }
    return list;
  },
  async roleOperate(roleInfo) {
    let res = false;
    try {
      const data = await request.post('/role/operate', roleInfo);
      if (data && (data.deletedCount > 0 || data.nModified > 0 || data._id)) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${roleInfo.title}出错！`);
    }
    return res;
  },
  async deptOperate(deptInfo) {
    let res = false;
    try {
      const data = await request.post('/dept/operate', deptInfo);
      if (data && (data.deletedCount > 0 || data.nModified > 0 || data._id)) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${deptInfo.title}出错！`);
    }
    return res;
  },
  async getLeaveList(query) {
    let list = [];
    try {
      list = await request.get('/leave/list', query, { isMock: false });
    } catch (e) {
      console.error(e);
      ElMessage.error('获取休假申请列表出错！');
    }
    return list;
  },
  async leaveOperate(leaveInfo) {
    let res = false;
    try {
      const data = await request.post('/leave/operate', leaveInfo, { isMock: false });
      if (data && (data.deletedCount > 0 || data.nModified > 0 || data._id)) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${leaveInfo.title}申请休假出错！`);
    }
    return res;
  },
  async leaveAudit(auditInfo) {
    let res = false;
    try {
      const data = await request.post('/leave/audit', auditInfo, { isMock: false });
      if (data && (data.deletedCount > 0 || data.nModified > 0 || data._id)) {
        res = true;
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(`${auditInfo.title}申请休假出错！`);
    }
    return res;
  },
};
