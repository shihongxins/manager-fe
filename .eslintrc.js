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
