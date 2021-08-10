<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { initDynamicRoutes } from '@/router'
export default {
  created () {
    // 解决页面刷新动态路由丢失问题 但是如果写了404页面 此函数无效 还未解决该问题
    initDynamicRoutes()
  }
}
</script>

<style lang="less">
</style>
