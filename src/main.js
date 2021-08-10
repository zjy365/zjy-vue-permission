import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入mock
import '../mock'
// 引入全局样式
import './assets/css/index.css'
// 引入element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import * as echarts from 'echarts' // 5.0版本的echarts引入方法
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false
Vue.use(ElementUI)


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
