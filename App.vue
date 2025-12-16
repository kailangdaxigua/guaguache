<template>
  <view id="app">
    <!-- 页面内容由 pages.json 配置的页面自动渲染 -->
  </view>
</template>

<script>
export default {
  onLaunch() {
    const user = uni.getStorageSync('user')
    // 未登录 → 跳转登录页
    if (!user || !user.openid) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }
  }
}
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f5f5f5;
}
</style>

