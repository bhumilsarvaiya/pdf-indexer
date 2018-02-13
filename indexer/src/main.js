// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueProgressBar from 'vue-progressbar'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import iView from 'iview';
import locale from 'iview/dist/locale/en-US';
import 'iview/dist/styles/iview.css';

Vue.use(iView, { locale })
Vue.use(VueProgressBar, {
  color: 'rgb(143, 255, 199)',
  failedColor: 'red',
  height: '2px',
  thickness: '5px'
})

Vue.use(Element)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
