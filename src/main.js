import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 全局样式
import './assets/css/global.css'
// 引入element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import TreeTable from 'vue-table-with-tree-grid'

// 引入字体图标
import './assets/fonts/iconfont.css'

// 配置axios
import axios from '_axios@0.19.2@axios'
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$axios = axios

Vue.config.productionTip = false

Vue.use(ElementUI)

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
