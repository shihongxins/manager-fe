// 引入 vuex 的 store
import { nextTick } from 'vue';
import store from '../store';

export default {
  mounted: (el, binding) => {
    try {
      // 如果没有指令值或指令值在 store 允许的按钮中不存在
      if (
        !(binding.value
          && store.getters.permissionBtnCodeList
          && store.getters.permissionBtnCodeList.indexOf(binding.value) > -1)
      ) {
        el.style.display = 'none';
        nextTick(() => {
          el.parentNode.removeChild(el);
        });
      }
    } catch (e) {
      console.error(e);
    }
  },
};
