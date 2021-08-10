<template>
<el-container class="layout-container">
    <el-aside class="aside" width="auto">
      <side class="aside-menu" :iscollapse="isCollapse"></side>
    </el-aside>
    <el-container>
        <el-header class="header">
            <div>
                <i
                    :class="{
                    'el-icon-s-fold': !isCollapse,
                    'el-icon-s-unfold': isCollapse,
                    }"
                    style="cursor: pointer"
                    @click="isCollapse = !isCollapse"
                ></i>
                <span>&nbsp;模板</span>
            </div>
        <el-dropdown>
          <div class="avatar-warp">
            <img class="avatar" :src="photo" alt="" />
            <span>{{ username }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item @click.native="logout">用户退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
</el-container>
</template>

<script>
import side from './components/side'
export default {
  name: '',
  components: {side},
  props: [],
  data () {
    return {
      isCollapse: false,
      // username: 'admin'
    }
  },
  computed: {
    username(){
      return sessionStorage.getItem('username')
    },
    photo() {
      return sessionStorage.getItem('photo')
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    logout () {    
      this.$router.push('/')
      sessionStorage.clear()
    }
  }
}
</script>

<style lang="less" scoped>
.layout-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  .aside {
    background-color: #d3dce6;
    overflow: hidden;
    .aside-menu {
      height: 100%;
    }
  }
  .header {
    height: 64px;
    background: #fff;
    border-bottom: 1px solid #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .avatar-warp {
      display: flex;
      align-items: center;
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
  }
  .main {
    background-color: #e9eef3;
  }
}  

</style>
