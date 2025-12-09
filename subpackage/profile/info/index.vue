<template>
  <view class="info-page">
    <view class="card">
      <view class="avatar" :style="{ backgroundColor: avatarBg }">
        <image
          v-if="avatarUrl"
          :src="avatarUrl"
          class="avatar-img"
          mode="aspectFill"
        />
        <text v-else class="avatar-text">{{ avatarText }}</text>
      </view>
      <view class="info">
        <text class="label">姓名</text>
        <text class="value">{{ name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfileInfoPage',
  data() {
    const name = '测试用户'
    return {
      name,
      avatarUrl: '',
      avatarText: name.slice(0, 1),
      avatarBg: '#0ea5e9'
    }
  }
}
</script>

<style lang="scss" scoped>
.info-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 24px 16px;
  box-sizing: border-box;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-text {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 14px;
  color: #8c95a3;
}

.value {
  font-size: 20px;
  color: #1f2d3d;
  font-weight: 600;
}
</style>

