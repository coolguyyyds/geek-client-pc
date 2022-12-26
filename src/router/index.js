import VueRouter from 'vue-router'
import Vue from 'vue'
import auth from '@/utils/auth'
Vue.use(VueRouter)

const router = new VueRouter({
  // 路由规则
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login')
    },
    {
      path: '/',
      component: () => import('@/views/layout'),
      children: [
        {
          path: '/',
          component: () => import('@/views/home')
        },
        {
          path: 'article',
          component: () => import('@/views/article')
        },
        {
          path: 'publish',
          component: () => import('@/views/publish')
        }
      ]
    }
  ]
})
router.beforeEach((to, from, next) => {
  const token = auth.getToken()
  // 判断是否授权 可访问后台
  if (to.path !== '/login' && !token) return next('/login')
  // 其他情况放行
  next()
})
export default router
