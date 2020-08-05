<template>
  <div id="app">
    <!-- 路由占位符 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  watch: {
    '$route.path': function(news, old) {
      console.log(news)
    }
  }
}
</script>

<style lang="scss">
</style>
