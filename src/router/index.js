import { createRouter, createWebHashHistory } from 'vue-router';
// 引入封装的 storage 对象
import storage from '@/utils/storage';

import Login from 'views/login/Login.vue';
import Home from 'components/Home.vue';

const routes = [
  {
    name: 'Login',
    path: '/login',
    component: Login,
    meta: {
      title: '登录',
    },
    beforeEnter: (to, from, next) => {
      const isAuthorized = storage.getItem('userInfo');
      // 已登录，不能重复打开登录页，因此转进入主页
      if (isAuthorized) {
        next({ path: '/' });
      } else {
        next();
      }
    },
  },
  {
    name: 'Home',
    path: '/',
    alias: '/home',
    component: Home,
    redirect: '/welcome',
    meta: {
      title: '首页',
    },
    children: [
      {
        name: 'Welcome',
        path: 'welcome',
        component: () => import('views/welcome/Welcome.vue'),
        meta: {
          title: '欢迎使用',
        },
      },
      {
        name: 'Users',
        path: 'system/user',
        component: () => import('views/users/Users.vue'),
        meta: {
          title: '用户管理',
        },
      },
      {
        name: 'Menu',
        path: 'system/menu',
        component: () => import('views/menu/Menu.vue'),
        meta: {
          title: '菜单管理',
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 前置守卫
router.beforeEach((to, from, next) => {
  const isAuthorized = storage.getItem('userInfo');
  // 验证是否登录
  // 已登录或是去登录页，直接通过
  if (isAuthorized || to.path === '/login') {
    next();
  } else {
    // 未登录的情况下进入除登录页外的其他页面，都被拦截转到登录页
    next({ path: '/login' });
  }
});

export default router;
