<template>
  <view class="container">
    <button type="primary" @click="handleLogin">
      微信一键登录
    </button>
  </view>
</template>

<script>
import { wechatLogin } from '@/utils/auth.js'

export default {
  methods: {
    async handleLogin() {
      try {
        await wechatLogin()
        uni.showToast({ title: '登录成功' })
        uni.switchTab({
          url: '/pages/index/index'
        })
      } catch (err) {
        uni.showToast({
          title: String(err),
          icon: 'error'
        })
      }
    }
  }
}
</script>

<style>
.container {
  padding: 60rpx;
}
</style>


