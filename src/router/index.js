import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../views/home/Welcome.vue'
import Users from '../views/home/Users.vue'
import Rights from '../views/rights/Rights.vue'
import Roles from '../views/rights/Roles.vue'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    children: [
      { path: '/', redirect: 'welcome' },
      { path: 'welcome', component: Welcome },
      { path: 'users', component: Users },
      { path: 'rights', component: Rights },
      { path: 'roles', component: Roles }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从哪个路径跳转过来
  // next函数，表示放行
  if (to.path === '/login') {
    return next()
  }
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
