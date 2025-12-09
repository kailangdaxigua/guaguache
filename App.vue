<template>
  <view id="app">
    <!-- 页面内容由 pages.json 配置的页面自动渲染 -->
  </view>
</template>

<script>
export default {
  name: 'App',
  // 小程序全局生命周期：这里可放初始化逻辑或埋点
  onLaunch() {
    console.log('App launched.')
  },
  onShow() {
    console.log('App show.')
  },
  onHide() {
    console.log('App hide.')
  }
}
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f5f5f5;
}
</style>

