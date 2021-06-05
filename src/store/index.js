import { createStore } from 'vuex';

import storeage from '../utils/storage';

export default createStore({
  state: {
    userInfo: (storeage.getItem('userInfo') || {}),
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
    clearUserInfo(state) {
      state.userInfo = {};
      storeage.removeItem('userInfo');
    },
  },
});
