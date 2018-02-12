import Vue from 'vue'
import Router from 'vue-router'
import Dropzone from '@/components/Dropzone'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dropzone',
      component: Dropzone
    }
  ]
})
