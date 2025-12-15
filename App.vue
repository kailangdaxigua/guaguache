<template>
  <view id="app">
    <!-- 页面内容由 pages.json 配置的页面自动渲染 -->
  </view>
</template>

<script>
import { performLogin } from './common/api'

export default {
  name: 'App',
  // 小程序全局生命周期：这里可放初始化逻辑或埋点
  async onLaunch() {
    console.log('App launched.')
    try {
      await performLogin()
    } catch (err) {
      console.error('Supabase 登录初始化失败', err)
    }
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

