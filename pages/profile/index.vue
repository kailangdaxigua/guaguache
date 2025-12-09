<template>
  <view class="page-container">
    <!-- 用户信息头部区域 -->
    <view class="header">
      <!-- 用户头像 -->
      <view class="avatar-container">
        <view class="avatar">
          <text class="avatar-text">我</text>
        </view>
      </view>
      <!-- 用户昵称 -->
      <text class="username">用户昵称</text>
      <!-- 用户描述 -->
      <text class="user-desc">呱呱车用户</text>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <!-- 个人信息菜单项 -->
      <view class="menu-item" @tap="handleGetUserInfo">
        <text class="menu-icon">👤</text>
        <text class="menu-text">个人信息</text>
        <text class="menu-arrow">›</text>
      </view>

      <!-- 设置菜单项 -->
      <view class="menu-item">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>

      <!-- 我的订单菜单项 -->
      <view class="menu-item">
        <text class="menu-icon">📝</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
      </view>

      <!-- 意见反馈菜单项 -->
      <view class="menu-item">
        <text class="menu-icon">💬</text>
        <text class="menu-text">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>

      <!-- 关于我们菜单项 -->
      <view class="menu-item menu-item-last">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    // 获取用户信息处理函数
    handleGetUserInfo() {
      uni.getUserProfile({
        desc: '用于完善用户资料', // 获取用户信息的用途说明
        success: (res) => {
          console.log('用户信息：', res.userInfo)
          uni.showToast({
            title: '获取成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('获取用户信息失败：', err)
          uni.showToast({
            title: '获取失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(to bottom right, #0ea5e9, #0284c7);
  padding: 64px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffffff;
}

.avatar-container {
  margin-bottom: 12px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
}

.username {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.user-desc {
  font-size: 14px;
  opacity: 0.9;
}

.menu-list {
  margin-top: 20px;
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.menu-item:active {
  background-color: #f5f5f5;
}

.menu-item-last {
  border-bottom: none;
}

.menu-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 32px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 18px;
  color: #333333;
}

.menu-arrow {
  font-size: 20px;
  color: #999999;
}
</style>

