import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layout'

Vue.use(VueRouter)

const tableRule = {
  path: '/table',
  name: 'table',
  component: () => import('@/views/table/ceshi.vue')
}
const imageRule = {
  path: '/image',
  name: 'image',
  component: () => import('@/views/image')
}
const userRule = {
  path: '/users',
  name: 'users',
  component: () => import('@/views/users')
}

// 路由规则和字符串的映射关系
const ruleMapping = {
  table: tableRule,
  users: userRule,
  image: imageRule
}
const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/login')
  },
  {
    path: '/home',
    name: 'home',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/image')
      },
      {
        path: '/chart',
        component: () => import('@/views/chart')
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next()
  } else {
    const token = sessionStorage.getItem('token')
    if (!token) {
      next('/')
    } else {
      // 有一个问题, 实现 判断要去的路由是否在自己路由表中,在则next();不在则next('/404')
      next()
    }
  }
})

export function initDynamicRoutes () {
  // console.log(router.options,'.....初始化的路由');

  const currentRoutes = router.options.routes
  console.log(currentRoutes,'当前路由');
  // 刷新 页面 动态添加的路由消失
  // 使用  vuex 时的也会消失
  const rightList = JSON.parse(sessionStorage.getItem('rightList') || '[]')
  rightList.forEach(item => { // 如果是没有子路由的话 就直接添加进去 如果有子路由的话就进入二级权限遍历
    // console.log(item, 'item,rightList')
    // console.log(item.path);
    // 如果没有二级路由 的话
    if (item.children.length === 0) {
      const temp = ruleMapping[item.path]
      // 路由规则中添加元数据meta
      temp.meta = item.rights
      currentRoutes.push(temp)
      // currentRoutes[1].children.push(temp)
    }
    item.children.forEach(item => {
      // item 二级权限
      // console.log(item, 'item-2')
      const temp = ruleMapping[item.path]
      // 路由规则中添加元数据meta
      temp.meta = item.rights
      currentRoutes[1].children.push(temp)
    })
  })
  router.addRoutes(currentRoutes)
  // console.log(router.options.routes,'用户登录后的路由')
}

export default router
