

##  参考链接

https://blog.csdn.net/harsima/article/details/77949448Vue + ElementUI 手撸后台管理网站基本框架(二)权限控制

https://zhuanlan.zhihu.com/p/227833652Vue +利用 addRoutes	 动态创建路由，并在页面刷新后保留动态路由的完整 Demo

https://juejin.cn/post/6844903478880370701  + 花裤衩  手摸手，带你用vue撸后台 系列二(登录权限篇)

https://juejin.cn/post/6844903816593145864  +Vue中后台鉴权的另一种方案 - 动态路由

### 权限接口的控制

一般来说,正常登录后,后端会返回一个token,之后的用户每次请求都应该携带者token;

对axios 进行简单的设置,增加请求拦截器,为每个请求的 header 都添加   token

```
const service = axios.create()

// http request 拦截器
// 每次请求都为http头增加Authorization字段，其内容为token
service.interceptors.request.use(
    config => {
        config.headers.Authorization = `${token}`
        return config
    }
);
export default service
```

###  创建路由表
在创建路由表前，我们先总结一下前端路由表构成的两种模式：

同时拥有静态路由和动态路由。
只拥有静态路由
在第一种模式中，将系统中不需要权限的页面构成静态路由，需要权限的页面构成动态路由。当用户登录后，根据返回数据匹配动态路由表，将结果通过addRoutes方法添加到静态路由中。完整的路由中将只包含当前用户能访问的页面，用户无权访问的页面将直接跳转到404。（这也是我之前一直使用的模式）

第二种模式则直接将所有页面都配置到静态路由中。用户正常登录，系统将返回数据记录下来作为权限数据。当页面跳转时，判断跳转的页面是否在用户的权限列表中，如果在则正常跳转，如果不在则可以跳转到任意其他页面。

在经过不断的实践和改进后，个人认为第二种模式相对简单，只有单一的路由表，方便以后的管理和维护。同时又因无论哪种模式都不能避免所谓的“安全”问题——个别情况下跳过前端路由情况的发生，所以第二种模式无论怎么看都比第一种要好很多。

需要注意的是，在第二种模式中，因为只有单一的静态路由，所以一定要使用vue-router的懒加载策略对路由组件进行加载行为优化，防止首次加载时直接加载全部页面组件的尴尬问题。当然，你可以对那些不需要权限的固定页面不使用懒加载策略，这些页面包括登录页、注册页等。

而实现它则需要使用`vue`的自定义指令。你可以戳这里查看`vue`自定义指令的说明：[自定义指令](https://cn.vuejs.org/v2/guide/custom-directive.html)

```
const hasPermission = {
    install (Vue, options){
        Vue.directive('hasPermission', {
            bind(el, binding, vnode){
                let permissionList = vnode.context.$route.meta.permission
                if(permissionList && permissionList.length && !permissionList.includes(binding.value)){
                    el.parentNode.removeChild(el)
                }
            }
        })
    }
}

export default hasPermission
```

###  权限策略
在理解了前端权限的本质后，我们说一下前端的权限策略。依照我目前的了解，大致上把权限策略分为以下两种：

前端记录所有的权限。用户登录后，后端返回用户角色，前端根据角色自行分配页面
前端仅记录页面，后端记录权限。用户登陆后，后端返回用户权限列表，前端根据该列表生成可访问页面
第一种的优点是前端完全控制，想怎么改就怎么改；缺点是当角色越来越多时，可能会给前端路由编写上带来一定的麻烦。

第二种的优点是前端完全基于后端数据，后期几乎没有维护成本；缺点是为了降低维护成本，必须拥有菜单配置页面及权限分配页面，否则就是噩梦。

接下来，将一点一点带你实现前端权限控制。







1. 路由跳转 先判断是否登录 未登录只能访问白名单页面,访问其他页面全部重定向到登录页面
2. 登录行为触发,获取动态路由,递归解析动态路由信息,并且addRouter,同时存储到Vuex,并且记录获取路由的状态
3. 跳转页面不会获取动态路由,刷新页面重新获取动态路由

![img](https://user-gold-cdn.xitu.io/2020/2/8/17024767cfd6c8b5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





## 前端权限思路一

先mock出 用户的信息

### 编写 mock.js

```javascript
// 用户信息
const users = [
  {
    id: 1,
    username: 'student',
    password: '123456',
    photo: 'http://www.lxandzjy.top:9002/2021/06/05/f570fcf9ad636.png',
    token: 'student-token',
    role: 'student',
    rights: []
  },
  {
    id: 2,
    username: 'admin',
    password: '123456',
    photo: 'http://www.lxandzjy.top:9002/2021/06/05/f570fcf9ad636.png',
    token: 'admin-token',
    role: 'admin',
    rights: []
  }
  
  
```

```javascript
后端响应回来不同的角色能看的 路由  ,通过 addrouters ,动态渲染上路由
const roles = {
  student: [
    {
      id: 1,
      authName: '基本页面',
      icon: 'el-icon-connection',
      children: [
        {
          id: 11,
          authName: '表格页面',
          icon: 'el-icon-s-grid',
          path: 'table',
          rights: ['view']
        },
        {
          id: 12,
          authName: '素材页面',
          icon: 'el-icon-s-marketing',
          path: 'image',
          rights: ['view']
        }
      ]
    }
  ],
  admin: [
    {
      id: 1,
      authName: '基本页面',
      icon: 'el-icon-connection',
      children: [
        {
          id: 11,
          authName: '表格页面',
          icon: 'el-icon-s-grid',
          path: 'table',
          rights: ['view', 'edit', 'add', 'delete']
        },
        {
          id: 12,
          authName: '素材页面',
          icon: 'el-icon-s-marketing',
          path: 'image',
          rights: ['view', 'edit', 'add', 'delete']
        }
      ]
    },
    {
      id: 2,
      authName: '用户权限',
      icon: 'el-icon-set-up',
      children: [
        {
          id: 21,
          authName: '权限页面',
          icon: 'el-icon-s-custom',
          path: 'users',
          rights: ['view', 'edit', 'add', 'delete']
        }
      ]
    }
  ]
}
```

### 编写 router.js

- 定义一些基本路由,所有用户都能看的路由

  ```javascript
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
  
  
  ```


- 定义动态路由

  ```javascript
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
  ```

- 初始化动态路由

  ```javascript
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
  ```

  

- 通过自定义指令来, 实现按钮级别的权限管理

  ```javascript
  // 自定义指令的注册
  import Vue from 'vue'
  import router from '@/router'
  Vue.directive('permission', {
    inserted (el, binding) {
      // console.log(el)
      // console.log(binding)
      const action = binding.value.action
      const effect = binding.value.effect
      // 判断 当前的路由所对应的组件中 如何判断用户是否具备action的权限
      // console.log(router.currentRoute.meta, '按钮权限')
      if (router.currentRoute.meta.indexOf(action) === -1) { // 等于-1说明没找到 不具备权限
        if (effect === 'disabled') {
          el.disabled = true
          el.classList.add('is-disabled')
        } else {
          el.parentNode.removeChild(el)
        }
      }
    }
  })
  
  ```

  

## 前端权限思路二

- mock 后端返回来的数据

  ```javascript
  定义token 假定 admin 的token就是'admin-token'
  export const tokens = {
    admin: {
      token: 'admin-token'
    },
    student: {
      token: 'student-token'
    }
  }
  ```

- ```javascript
  token 对应的信息
  export const users = {
    'admin-token': {
      role: 'admin',
      name: '管理员',
      photo: 'https://dss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1709216491,2536617744&fm=26&gp=0.jpg'
    },
    'student-token': {
      role: 'student',
      name: '学生',
      photo: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2364244149,3298797080&fm=26&gp=0.jpg'
    }
  }
  ```

- 登录

  ```javascript
      async onSubmit (form) {
        // console.log('form', form)
        const { data: token } = await login(form)
        setToken(token.token)
        this.$store.commit('SET_TOKEN', token.token)
  
        this.$router.push({
          path: '/'
        })
      }
  	// 导入
      import { setToken } from '@/utils/auth'
      setToken(token.token)  这个方法
      // auth.js
      import Cookies from 'js-cookie'
  	// 个方法  存取token ,把toekn存到cookies中
      // 设置 token 的键名
      const TokenKey = 'vue_admin_token'
  
      // 从缓存中获取token
      export function getToken () {
        return Cookies.get(TokenKey)
      }
  
      // 在缓存中存入token
      export function setToken (token) {
        return Cookies.set(TokenKey, token)
      }
  
      // 清除缓存中的token
      export function removeToken () {
        return Cookies.remove(TokenKey)
      }
  
  ```

- ### router.js  

  ```javascript
  // 把所有 的路由 都写出来,不必动态添加路由
  // 对于 需要权限的路由,在路由的元信息	meta	中进行添加
  const routes = [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login'),
      hidden: true
    },
    {
      path: '/',
      name: 'Home',
      component: Layout,
      redirect: '/home', // TODO: 这里如果注释掉 则无法通过按钮跳转到首页
      // redirect: {
      //   name: 'home'
      // },
      meta: {
        icon: 'el-icon-s-home',
        title: '首页'
      },
      children: [
        {
          path: '/home',
          name: 'home',
          component: () => import('@/views/home'),
          meta: {
            title: '首页'
          }
        }
      ]
    },
    {
      path: '/dataCenter',
      name: 'dataCenter',
      component: Layout,
      redirect: '/dataCenter/form',
      meta: {
        icon: 'el-icon-s-data',
        title: '数据中心'
      },
      children: [
        {
          path: '/dataCenter/form',
          name: 'form',
          component: () => import('@/views/form'),
          meta: {
            title: '表单'
          }
        },
        {
          path: '/dataCenter/table',
          name: 'table',
          component: () => import('@/views/table'),
          meta: {
            title: '表格'
          }
        },
        {
          path: '/dataCenter/echart',
          name: 'echart',
          component: () => import('@/views/echart'),
          meta: {
            title: '可视化'
          }
        }
      ]
    },
    {
      path: '/power',
      name: 'Power',
      component: Layout,
      redirect: '/power',
      meta: {
        icon: 'el-icon-s-custom',
        title: '权限页面'
      },
      children: [
        {
          path: '/power',
          name: 'power',
          component: () => import('@/views/power'),
          meta: {
            title: '权限页面',
            roles: ['admin']
          }
        }
      ]
    },
    {
      path: '/404',
      component: () => import('@/views/404'),
      hidden: true
    },
    {
      path: '*',
      redirect: '/404',
      hidden: true
    }
  ]
  ```



- ### permission.js

  ```javascript
  
  import router from './router'
  import store from './store'
  import NProgress from 'nprogress'
  import 'nprogress/nprogress.css'
  import { Message } from 'element-ui'
  import { getToken, removeToken } from '@/utils/auth'
  import { findUserByToken } from '@/api/user'
  
  NProgress.configure({ showSpinner: false })
  
  const whiteList = ['/login'] // 不重定向白名单
  
  router.beforeEach((to, from, next) => {
    NProgress.start()
    if (getToken()) {
      // 如果有token 则没必要再去登录页面 直接跳到首页
      if (to.path === '/login') {
        next('/')
      } else { // 去其它页面
        // console.log('getToken()', getToken())
        // 将用户信息存入缓存不安全 所以存入vuex 然而每次刷新页面vuex都会清空 所以每次路由跳转时重新获取信息存入vuex
        findUserByToken(getToken()).then(res => {
          // console.log('findUserByToken res', res)
          // 如果返回的信息为空 则说明token不匹配 清除token 刷新页面 返回登录页面
          if (res.data === undefined) {
            Message.error('无效的token')
            removeToken()
            window.location.reload()
          } else {
            // 如果是有效token 将信息用户信息存入vuex
            const userInfo = res.data
            store.commit('SET_ROLE', userInfo.role)
            store.commit('SET_NAME', userInfo.name)
            store.commit('SET_PHOTO', userInfo.photo)
  
            const userRole = store.getters.GET_ROLE
            // console.log('userRole', userRole)
            // console.log('to', to)
            // 判断正在跳转的路由是否需要权限 如果不需要权限 则直接放行
            // 如果没有没有定义的meta.roles, 则(to.meta.roles)值为undefined; ===>>>undefined 取非是true
            if (!(to.meta.roles) {
              // console.log('to.meta.roles', to.meta.roles)
              next()
            } else {
              // 如果需要权限 判断用户的role是否在可跳转roles数组中
              if (to.meta.roles.indexOf(userRole) !== -1) { // 有权限 放行
                next()
              } else {
                // // 没有权限 清空用户信息 返回登录页面
                // Message.error('非法访问')
                // removeToken()
                // window.location.reload() // 刷新vuex
                // next('/login')
  
                // 没有权限 去404
                next('/404')
              }
            }
          }
        }).catch(err => {
          console.log('findUserByToken', err)
        })
      }
    } else {
      // 没有token 先判断是否在白名单 在白名单则放行 比如未登录时 是可以去登录页面的
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        // 要去的页面没有在白名单 则不让跳转 而是去登录页面
        next('/login')
      }
    }
  })
  
  router.afterEach(() => {
    NProgress.done()
  })
  
  ```



- 按钮级别的思路

  ```javascript
  import Vue from 'vue'
  import store from '@/store/index'
  
  Vue.directive('permission', {
    inserted (el, binding) {
      const role = binding.value.role
      const userRole = store.getters.GET_ROLE
      // 假如用户没有相关权限则不显示
      if (role.indexOf(userRole) === -1) {
        el.parentElement.removeChild(el)
      }
    }
  })
  
  ```



## 前端权限实现思路三



- 所有的路由,页面都写好,有前端完全控制,先定义好某个 角色的能访问的页面

  ```javascript
  /*
    前端权限思路：
    1.前端自己写出权限映射,后端传来权限等级即可
  */
  // 隐藏路由
  const main = ['main', 'mainF', '404']
  
  // 工艺流程
  const process = ['process', 'forming', 'dipping', 'graphiting', 'tunnelKiln']
  
  // 数据中心
  const dataCenter = ['dataCenter', 'cargo', 'warehouse', 'formCheck', 'formCheckKiln', 'process', 'forming', 'dipping', 'graphiting', 'form', 'formCheckDip']
  
  // 配置中心
  const configCenter = ['configCenter', 'formTemplate', 'processManage', 'employeeInfo', 'platform', 'parameter', 'analysis']
  
  // 权限中心
  const powerManage = ['powerManage', 'api', 'auth', 'role', 'user']
  
  // 个人中心
  const person = ['person', 'personF', 'modifyPwd']
  
  // 经过测试，Array.toString()并不会输出//背后的内容
  
  // 抽离直接使用
  
  // 0 管理员
  const role0 = [
    main,
    process, // 工艺流程
    dataCenter, // 数据中心
    configCenter, // 配置中心
    powerManage, // 权限中心
    person // 个人中心
  ]
  
  // 1 压型员工
  const role1 = [
    main,
    ['dataCenter', 'forming', 'process', 'form'],
    person
  ]
  
  // 2 浸渍员工
  const role2 = [
    main,
    ['process', 'dipping', 'dataCenter', 'formCheckDip'],
    person
  ]
  
  // 3 浸隧道窑员工
  const role3 = [
    main,
    ['process', 'tunnelKiln', 'dataCenter', 'formCheckKiln'],
    person
  ]
  
  // 4 石墨化员工
  const role4 = [
    main,
    ['process', 'graphiting'],
    ['dataCenter', 'formCheck'],
    person
  ]
  
  export const allRole = {
    role0,
    role1,
    role2,
    role3,
    role4
  }
  
  ```

- 

- ```javascript
  router.beforeEach((to, from, next) => {
    NProgress.start()
    store.commit('insertCurrentPage', (to.fullPath).substr(1))
    // console.log(to.path)
    // 如果去登录 直接放行
    if (to.path === '/login') {
      next()
      NProgress.done()
    } else {
      // 如果跳过了登录去其它页面 先判断是否具有token
      // console.log(sessionStorage.getItem('Token'))
      if (sessionStorage.getItem('Token')) {
        // 有token的话调用接口获取用户信息 存到vuex里 这样就不会在控制台的本地缓存中找到用户信息
        findByToken(sessionStorage.getItem('Token'))
          .then(res => {
            // console.log('findByToken', res)
            // 请求拦截器将res处理了
            if (res === undefined) {
              next('/login')
              NProgress.done()
            }
            // sessionStorage.setItem('loginState', JSON.stringify(res.data.data))
            const payload = res.data.data
            // 将用户信息存到vuex中
            store.commit('insertLoginState', payload)
            // console.log('state', store)
  
            // 从vuex里面获取数据代替router,假如没有数据则重新获取
            // 对用户状态进行检测,假如跳转到非当前用户权限范围则返回
            try {
              // console.log(to.fullPath)
              // 这里有个问题，假如获取到的role为null,直接会报typeError,不会进入roleState === null,故要try{}catch{}
              const roleState = store.getters.getRole
              // eslint-disable-next-line no-useless-escape
              const toPath = '' + (to.path).substr(1) + ''
              // const toPath = '\"routerName\":\"' + (to.path).substr(1) + '\"'
              // const toPath = (to.path).substr(1)
              // console.log(toPath)
              var roleName = 'role' + roleState
              // console.log(allRole[roleName])
              // console.log(router.options.routes)
              var roleGet = allRole[roleName].toString()
              if (roleGet.indexOf(toPath) === -1) {
                // console.log(toPath)
                // console.log('非法跳转')
                // return new Error('非法跳转')
                // Message.error('非法跳转')
                localStorage.clear()
                // next('/login')
                next('/404')
                NProgress.done()
              } else {
                next()
                NProgress.done()
              }
            } catch (error) {
              console.log('路由守卫err', error)
              next('/login')
              NProgress.done()
            }
          }).catch(err => {
            console.log('findByToken', err)
          })
      } else {
        // 如果跳过登录去其它页面 没有token 则返回到登录页面
        next('/login')
        NProgress.done()
      }
    }
  })
  
  ```

  
