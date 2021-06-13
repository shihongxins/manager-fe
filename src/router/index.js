import { createRouter, createWebHashHistory } from 'vue-router';

import Login from 'views/login/Login.vue';
import Home from 'components/Home.vue';

// 引入 store 存储
import store from '../store';
// 引入 utils 工具函数
import utils from '../utils/utils';

const routes = [
  {
    name: 'Login',
    path: '/login',
    component: Login,
    meta: {
      title: '登录',
    },
    beforeEnter: (to, from, next) => {
      const { userInfo } = store.state;
      // 已登录，不能重复打开登录页，因此转进入主页
      if (userInfo && userInfo.token) {
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
    beforeEnter: (to, from, next) => {
      // eslint-disable-next-line no-use-before-define
      generateRoutes();
      next();
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
    ],
  },
  {
    name: '404',
    path: '/404',
    component: () => import('components/404.vue'),
    meta: {
      title: '404',
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 前置守卫
router.beforeEach((to, from, next) => {
  // 跳转前路由检查，不存在转到 404 页面，存在还要更新浏览器标题
  const existRoutes = router.getRoutes();
  const route = existRoutes.filter((item) => (item.name === to.name && item.path === to.path));
  if (route && route.length) {
    document.title = to.meta.title;
  } else {
    next({ name: '404' });
    return;
  }
  const { userInfo } = store.state;
  // 验证是否登录
  // 已登录或是去登录页，直接通过
  if ((userInfo && userInfo.token) || to.path === '/login') {
    next();
  } else {
    // 未登录的情况下进入除登录页外的其他页面，都被拦截转到登录页
    next({ path: '/login' });
  }
});

// 动态路由的生成方法
const generateRoutes = () => {
  // 获取已登录的用户权限菜单树
  const { permissionMenuList } = store.state;
  // 将菜单树平展为数组
  const menuArr = utils.spreadTree(permissionMenuList);
  // 已定义的路由
  const existRoutes = router.getRoutes();
  // ❗❗❗❗❗动态路由中的异步组件加载， vite 需要提前解析模块路径
  const vueModules = import.meta.glob('../(components|views)/**/*.vue');
  // 遍历菜单组成路由
  menuArr.forEach((item) => {
    if ((item.path || item.menuName) && item.menuType === 1) {
      // 查询是否重复
      const repeatRoutes = existRoutes.filter(
        (route) => (route.path === item.path || route.name === item.menuName),
      );
      // 没有重复就添加
      if (repeatRoutes.length === 0) {
        let name = (item.component?.match(/\/([^/.]+)$/) || item.path.match(/\/(\w+)$/))[1];
        let componentPath;
        // let component;
        if (name) {
          // 组件名大写
          name = name.replace(/^\w/, (match) => match.toUpperCase());
          // 组件路径修改
          if (item.component) {
            componentPath = '';
            // 路径替换
            componentPath = item.component.replace(/(.*)(views|components)\//, '../$2/');
            // 后缀替换
            componentPath = /(\.\w+)$/.test(componentPath) ? componentPath : `${componentPath}.vue`;
            // component = () => import(`./${componentPath}`);
          }
          router.addRoute('Home', {
            name,
            path: item.path,
            meta: {
              title: item.menuName,
            },
            // ❗❗❗❗❗动态路由中的异步组件加载， vite 需要提前解析模块路径
            component: vueModules[componentPath],
          });
        }
      }
    }
  });
};

// 每次页面刷新都得执行重新生成路由
generateRoutes();

export default router;
