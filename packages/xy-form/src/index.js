// 导入组件
import XyForm from './components/index.vue'

// 安装插件
const XyFormPlugin = {
  install(app) {
    // 注册全局组件
    app.component('XyForm', XyForm)
  },
}

// 导出插件
export { XyForm, XyFormPlugin }

// 默认导出插件
export default XyFormPlugin
