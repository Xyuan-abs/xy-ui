import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/index.js', // 组件库入口
      name: 'XyForm', // 全局变量名称
      fileName: (format) => `xy-form.${format}.js`, // 输出的文件名
    },
    rollupOptions: {
      // 确保外部依赖不被打包
      external: ['vue', 'element-plus'],
      output: [
        {
          format: 'es', // ESM 格式
          dir: 'dist', // 输出到 dist 目录
          entryFileNames: 'xy-form.es.js', // ESM 格式文件
        },
        {
          format: 'umd', // UMD 格式
          name: 'XyForm', // 全局变量名
          dir: 'dist', // 输出到 dist 目录
          entryFileNames: 'xy-form.umd.js', // UMD 格式文件
          globals: {
            vue: 'Vue',
            'element-plus': 'ElementPlus',
          },
        },
        {
          format: 'cjs', // CommonJS 格式
          dir: 'dist', // 输出到 dist 目录
          entryFileNames: 'xy-form.cjs.js', // CJS 格式文件
        },
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 配置别名
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
