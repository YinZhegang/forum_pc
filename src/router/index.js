import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import AllModule from '@/pages/AllModule'
import MyAdvice from '@/pages/MyAdvice'
import Module from '@/pages/Module'
import Detail from '@/pages/Detail'
import NewModule from '@/pages/NewModule'
import Reply from '@/pages/Reply'
import Post from '@/pages/Post'
import ReplyLzl from '@/pages/ReplyLzl'
import ReplyDetail from '@/pages/ReplyDetail'
Vue.use(Router)

export default new Router({
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
  },
  routes: [
    {
      path: '/',
      name: '首页',
      component: Index,
      children: [
        {
          path: 'login',
          name: '登录',
          component: Login,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'home',
          name: '首页',
          component: Home,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'allmodule',
          name: '全部模块',
          component: AllModule,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'mAdvice',
          name: '我的建议',
          component: MyAdvice,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'module',
          name: '模块',
          component: Module,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'detail',
          name: '详情',
          component: Detail,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'newModule',
          name: '创建板块',
          component: NewModule
        },
        {
          path: 'reply',
          name: '回复',
          component: Reply
        },
        {
          path: 'post',
          name: '发送建议',
          component: Post,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'replyLzl',
          name: '回复回复',
          component: ReplyLzl,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'replyDetail',
          name: '评论详情',
          component: ReplyDetail,
          meta: {
            keepAlive: false
          }
        }

      ]
    }
  ]
})
