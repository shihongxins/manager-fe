import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    // host: '0.0.0.0',
    port: 8080,
  },
  resolve: {
    // 配置路径别名，注意与 Webpack 不同， vite 的别名在非 js 语言中使用时无需 `~`
    alias: {
      '@': path.resolve(__dirname, './src'),
      'styles': path.resolve(__dirname, './src/assets/styles'),
      'views': path.resolve(__dirname, './src/views'),
      'components': path.resolve(__dirname, './src/components')
    }
  },
  plugins: [vue()]
})
