<template>
  <view class="info-page">
    <view class="card">
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <view class="avatar" :style="{ backgroundColor: avatarBg }">
          <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" mode="aspectFill" />
          <text v-else class="avatar-text">{{ avatarText }}</text>
        </view>
        <text class="avatar-action">更换头像</text>
      </button>

      <view class="info">
        <text class="label">昵称</text>
        <input type="nickname" class="nickname-input" placeholder="请输入昵称" :value="nickname" @input="onNicknameInput" />
      </view>
    </view>

    <view class="tips">
      <text class="tip-title">安全校验</text>
      <text class="tip-desc">
        微信头像/昵称选择后，可按需调用官方内容安全接口
        <text class="tip-link">mediaCheckAsync</text>
        与
        <text class="tip-link">msgSecCheck</text>
        进行校验。
      </text>
    </view>

    <view class="actions">
      <button class="save-btn" :loading="saving" :disabled="saving" @tap="handleSave">
        保存修改
      </button>
    </view>
  </view>
</template>

<script>
import { updateProfile, uploadAvatar } from '@/services/profile.js'

export default {
  name: 'ProfileInfoPage',
  data() {
    const nickname = uni.getStorageSync('nickname') || '测试用户'
    const defaultAvatarUrl =
      'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    return {
      nickname,
      avatarUrl: uni.getStorageSync('avatar_url') || defaultAvatarUrl,
      avatarText: nickname.slice(0, 1),
      avatarBg: '#0ea5e9',
      defaultAvatarUrl,
      saving: false
    }
  },
  methods: {
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail || {}
      if (!avatarUrl || this.saving) return
      
      // 1. 从本地缓存里拿出当前登录的用户信息
      const currentUser = uni.getStorageSync('user')
      
      // 2. 检查缓存里有没有 openid
      if (!currentUser || !currentUser.openid) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      uni.showLoading({ title: '上传中...' })
      this.saving = true
      try {
        // 3. 调用上传接口，把 openid 传进去！
        const publicUrl = await uploadAvatar(currentUser.openid, avatarUrl)
        this.avatarUrl = publicUrl
        // 4. 更新用户资料，把 openid 传进去！
        await updateProfile(currentUser.openid, { 
          avatar_url: publicUrl, 
          nickname: this.nickname 
        })
        uni.setStorageSync('avatar_url', publicUrl)
        uni.showToast({ title: '头像已更新', icon: 'success' })
      } catch (err) {
        console.error('上传头像失败', err)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        this.saving = false
        uni.hideLoading()
      }
    },
    onNicknameInput(e) {
      this.nickname = e.detail.value || ''
      this.avatarText = this.nickname ? this.nickname.slice(0, 1) : '我'
    },
    async handleSave() {
      if (this.saving) return
      
      // 1. 从本地缓存里拿出当前登录的用户信息
      const currentUser = uni.getStorageSync('user')
      
      // 2. 检查缓存里有没有 openid
      if (!currentUser || !currentUser.openid) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      this.saving = true
      uni.showLoading({ title: '保存中...' })
      try {
        // 3. 调用更新接口，把 openid 传进去！
        await updateProfile(currentUser.openid, { 
          nickname: this.nickname, 
          avatar_url: this.avatarUrl 
        })
        uni.setStorageSync('nickname', this.nickname)
        uni.showToast({ title: '已保存', icon: 'success' })
      } catch (err) {
        console.error('更新昵称失败', err)
        uni.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.saving = false
        uni.hideLoading()
      }
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
  gap: 12px;
}

.avatar-btn {
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-btn::after {
  border: none;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

.avatar-action {
  font-size: 14px;
  color: #0ea5e9;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.label {
  font-size: 14px;
  color: #8c95a3;
}

.nickname-input {
  font-size: 18px;
  color: #1f2d3d;
  padding: 10px 12px;
  background: #f6f7fb;
  border-radius: 10px;
}

.tips {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 14px;
  color: #5b6472;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.tip-title {
  display: block;
  color: #1f2d3d;
  font-weight: 600;
  margin-bottom: 4px;
}

.tip-link {
  color: #0ea5e9;
}

.actions {
  margin-top: 20px;
}

.save-btn {
  width: 100%;
  background: linear-gradient(to right, #0ea5e9, #0284c7);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 16px;
}

.save-btn::after {
  border: none;
}
</style>
