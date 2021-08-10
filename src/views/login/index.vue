<template>
  <div class="bg_login">
    <div class="login">
    <p>Login</p>
    <input type="text" v-model="username" placeholder="用户名">
    <input type="password"  v-model="password" placeholder="密码">
    <input type="submit" class="btn" value="登  录" @click="login(username,password)">
    </div>
  </div>
</template>

<script>
import { nlogin, getRoles } from '@/api/user'
import { initDynamicRoutes } from '@/router'
export default {
  name: '',
  components: {},
  props: [],
  data () {
    return {
      username: 'admin',
      password: '123456'
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    login(username,password){
      nlogin({username,password}).then(res => {
        console.log(res)
        this.$store.commit('setRole',res.data.role)
        this.$store.commit('setUsername',res.data.username)
        this.$store.commit('setPhoto',res.data.photo)
        this.$store.commit('setToken',res.data.token)

        getRoles(res.data.role).then(ret => {
          console.log(ret)
          this.$store.commit('setRightList', ret.data)

          // 根据用户所具备的权限 动态添加路由规则
          initDynamicRoutes()
          this.$router.push('/home')
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.bg_login {
  width: 100%;
  height: 100%;
  background-image: url(http://www.lxandzjy.top:9002/2021/06/04/b6262e6ac4e78.jpg);
  background-size:cover;  /* 让背景图基于容器大小伸缩 */
  background-attachment:fixed;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.login{
    position: absolute;
    top: 50%;
    margin-top: -200px;
    left: 50%;
    margin-left: -200px;
    /* absolute居中的一种方法 */
    background-color: whitesmoke;
    width: 400px;
    height: 400px;
    border-radius: 25px;
    text-align: center;
    padding: 5px 40px;
    box-sizing: border-box;
    /* 这样padding就不会影响大小 */
    p{
      font-size: 42px;
      font-weight: 600;
    }
    input{
      background-color: whitesmoke;
      width: 100%;
      height: 48px;
      margin-bottom: 10px;
      border: none;
      border-bottom: 2px solid silver;
      /* 下面的会覆盖上面的步伐 */
      outline: none;
      font-size: 22px;
    }
    .btn{
      background-color: #59c2c5;
      width: 38%;
      height: 48px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 28px;
      font-weight: 600;
      color: white;
    }
    .btn:hover{
      background-color: #59c2a0;
    }
}
</style>
