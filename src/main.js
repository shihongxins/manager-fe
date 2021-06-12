import { createApp } from 'vue';
// 引入路由
import router from '@/router';
// 引入 vuex
import store from '@/store';

// 引入 Normalize.css 统一样式
import 'normalize.css';

// 全局导入 Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

// 引入 封装的 axios RESTful 请求方法，和所用到的 api 集合
import { request } from './utils/request';
import api from './api';

// 引入自定义指令控制按钮权限
import vhas from './directives/v-has';

// console.log('环境变量 => ', import.meta.env) // 发现 vite 没有 process 了，环境变量都通过 import.meta.env 对象导出
// request.get('/api/login', {userName: 'admin', userPwd: '123456'})
// 引入根组件
import App from './App.vue';

const app = createApp(App);

app.config.globalProperties.$requset = request;
app.config.globalProperties.$api = api;

app.use(ElementPlus, { size: 'small' });
app.use(router);
app.use(store);
app.directive('has', vhas);
app.mount('#app');
