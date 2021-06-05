# 简介
一个使用 Vite, Vue@3, Vuex@4, Vue-router@4, Elmenent-Plus 开发的通用后台管理系统。  
主要的功能模块有：
+ 系统管理
  - 用户管理
  - 菜单管理
  - 角色管理
  - 部门管理
+ 审批流程
  - 休假申请
  - 待我审批

# 安装
## 初始化
`npm install`  
## 启动
`npm run dev`
## 编译
`npm run build`

# 开发记录
## Vite 项目初始化
与 Vue-Cli 不同， Vite 不需要全局安装，且 Vite 不依赖 Webpack ，它使用浏览器原生的模块 `type="module"` 功能加载文件（不编译）。  
+ `npm init @vitejs/app manager-fe` 初始化项目； 
+ `cd manager-fe` 进入项目文件夹； 
+ `npm install` 初始化安装依赖；  
+ `npm run dev` 启动项目了。

## 安装项目的其他依赖
### 安装生产环境依赖
`npm i -S vuex@next vue-router@next axios element-plus normalize.css`

### 安装开发环境依赖
`npm i -D sass`

### 配置 ESLint
+ 安装 VS Code 的 ESLint 插件
+ 本地安装 ESLint `npm i -D eslint eslint-plugin-import eslint-config-airbnb`
+ 如果使用了 Vite 的路径别名配置 `resolve.alias` 那么 ESLint 还需要安装插件同步配置 Vite 别名 `npm i -D eslint-import-resolver-alias`
+ 初始化 ESLint 配置文件 **_/.eslintrc.js_**
```js
/**
 * @file /.eslintrc.js
 * @description ESLint 的配置文件
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended', 'plugin:vue/vue3-essential', 'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境禁用consele
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境禁用debugger
    'linebreak-style': 'off', // 忽略检测换行风格
    'no-param-reassign': ['error', { props: false }], // 允许修改参数中的属性值（仍然不允许直接修改参数）
    'prefer-destructuring': ['error', { object: true, array: false }], // 允许数组通过下标取值
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }], // 允许引入开发依赖时不报错（vite.config.js）
    'consistent-return': ['error', { treatUndefinedAsUnspecified: true }], // 返回值的一致性（都有明确返回值或者没有返回值）
    'no-underscore-dangle': 'off', // 允许变量名使用悬空下划线
  },
  settings: {
    // 修复 vite 路径别名不识别的问题 依赖于插件: eslint-import-resolver-alias
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['styles', './src/assets/styles'],
          ['views', './src/views'],
          ['components', './src/components'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json', '.vue'],
      },
    },
  },
};
```

## 码字开发
...

## 总结


