import '@/styles/configure.scss'
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketio from 'vue-socket.io'
import socketio from 'socket.io-client'
import VueWorker from 'vue-worker'

Vue.config.productionTip = false

Vue.use(
  VueSocketio, socketio(`${window.location.host}`, { resource: '/connect' })
)

Vue.use(VueWorker)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
