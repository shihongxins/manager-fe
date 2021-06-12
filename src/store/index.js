import { createStore } from 'vuex';

import storeage from '../utils/storage';

export default createStore({
  state: {
    userInfo: (storeage.getItem('userInfo') || {}),
    permissionMenuList: (storeage.getItem('permissionMenuList') || []),
    permissionBtnList: (storeage.getItem('permissionBtnList') || []),
  },
  getters: {
    permissionBtnCodeList: (state) => state.permissionBtnList.map((btn) => btn.menuCode),
  },
  mutations: {
    saveUserInfo(state, userInfo) {
      if (userInfo) {
        state.userInfo = userInfo;
        storeage.setItem('userInfo', userInfo);
      } else {
        console.log('用户信息不能为空！', userInfo);
      }
    },
    savePermissionList(state, permissionList) {
      if (permissionList) {
        if (permissionList.menuList) {
          state.permissionMenuList = permissionList.menuList;
          storeage.setItem('permissionMenuList', permissionList.menuList);
        }
        if (permissionList.btnList) {
          state.permissionBtnList = permissionList.btnList;
          storeage.setItem('permissionBtnList', permissionList.btnList);
        }
      } else {
        console.log('权限动态菜单与按钮信息不能为空！', permissionList);
      }
    },
    logout(state) {
      state.userInfo = {};
      storeage.removeItem('userInfo');
      state.permissionMenuList = {};
      storeage.removeItem('permissionMenuList');
      state.permissionBtnList = {};
      storeage.removeItem('permissionBtnList');
    },
  },
});
