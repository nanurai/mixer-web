import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Mix from '@/pages/mix'
import Job from '@/pages/job'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: 'Home',
    component: Home
  }, {
    path: '/mix',
    name: 'Mix',
    component: Mix
  }, {
    path: '/jobs/:id',
    name: 'Job',
    component: Job
  }]
})
