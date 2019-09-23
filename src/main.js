// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import Qs from 'qs'
import MintUI from 'mint-ui'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import 'mint-ui/lib/style.css'
import preview from 'vue-photo-preview'
import fastClick from 'fastclick'
import 'vue-photo-preview/dist/skin.css'
import { Select, Input, Form, FormItem, Option, button, upload, dropdown, DropdownItem, DropdownMenu, Dialog, Radio, RadioGroup} from 'element-ui'
Vue.use(preview, {
  fullscreenEl: false,
  zoomEl: false,
  tapToClose: true,
  history: true

})
fastClick.attach(document.body)
Vue.use(Select)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Option)
Vue.use(button)
Vue.use(upload)
Vue.use(dropdown)
Vue.use(DropdownItem)
Vue.use(DropdownMenu)
Vue.use(Dialog)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(MintUI)
Vue.component('icon', Icon)
Vue.config.productionTip = true
const Url = 'http://61.148.30.210:3001/api/forum/'
// const Url = 'http://20.1.11.5:8080/'
// const Url = 'http://114.242.230.14:8888/'
Vue.prototype.baseURL = Url
Vue.prototype.trim = str => {
  return str.replace(/(^\s*)|(\s*$)/g, '')
}
const service = axios.create({
  baseURL: Url,
  timeout: 10000
})

var mixin = {
  beforeCreate () {
    if (this.$route.query.uid) {
      this.$store.state.loginUser = this.$route.query.uid
      localStorage.loginUser = this.$route.query.uid
    } else {
      if (localStorage.getItem('loginUser')) {
        this.$store.state.loginUser = localStorage.getItem('loginUser')
      }
    }
  }
}

service.interceptors.request.use(config => {
  config.method === 'post'
    ? config.data = Qs.stringify({...config.data})
    : config.params = {...config.params}
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  // config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('login_token')
  return config
}, error => { // 请求错误处理
  alert(error)
  Promise.reject(error)
}
)
service.interceptors.response.use(
  response => { // 成功请求到数据
    // console.log(response.data.code)
    // 这里根据后端提供的数据进行对应的处理
    // if (response.data.code === 600) {
    //   location.href = '/'
    // }
    // if (response.data.code === 601) {
    //   location.href = '/'
    // }
    return response.data
  },
  error => { // 响应错误处理console.log('error');
    console.log(error)
    console.log(JSON.stringify(error))
  }
)
Vue.prototype.$http = service
Vue.prototype.$get = service.get
Vue.prototype.$post = service.post
/* eslint-disable no-new */
new Vue({
  mixins: [mixin],
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
