<template>
  <view class="page-container">
    <!-- 页面头部标题区域 -->
    <view class="header">
      <text class="header-title">🚗 呱呱车定位</text>
      <text class="header-subtitle">实时位置追踪系统</text>
    </view>

    <!-- 地图容器 -->
    <view class="map-container">
      <map
        id="locationMap"
        :longitude="longitude"
        :latitude="latitude"
        :scale="scale"
        :show-location="true"
        @error="handleMapError"
        class="map"
      ></map>
    </view>

    <!-- 操作按钮区域 -->
    <view class="button-container">
      <view class="button-wrapper">
        <view class="button" @tap="handleGetLocation">
          <text class="button-icon">📍</text>
          <text class="button-text">获取定位</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const DEFAULT_COORD = {
  longitude: 114.52208,
  latitude: 30.714933,
  scale: 14
}

export default {
  name: 'IndexPage',
  data() {
    return {
      longitude: DEFAULT_COORD.longitude,
      latitude: DEFAULT_COORD.latitude,
      scale: DEFAULT_COORD.scale,
      accuracy: null
    }
  },
  onLoad() {
    this.initLocationUpdate()
  },
  onUnload() {
    // 页面卸载时记得移除监听，防止内存泄漏
    uni.offLocationChange(this.locationChangeHandler)
  },
  methods: {
    // 位置变化回调：同步地图坐标
    locationChangeHandler(res) {
      const { latitude, longitude, accuracy } = res
      this.longitude = longitude
      this.latitude = latitude
      if (accuracy) this.accuracy = accuracy
      console.log('位置更新：', { latitude, longitude, accuracy })
    },

    // 监听位置变化并启动（后台）定位
    async initLocationUpdate() {
      uni.onLocationChange(this.locationChangeHandler)

      try {
        const setting = await uni.getSetting()
        const hasAuth = setting.authSetting['scope.userLocation']
        if (!hasAuth) {
          await uni.authorize({ scope: 'scope.userLocation' })
        }

        const systemInfo = uni.getSystemInfoSync()
        const IS_DEVTOOLS = systemInfo.platform === 'devtools'

        if (IS_DEVTOOLS) {
          console.warn('开发者工具模式：仅开启前台定位模拟')
          await uni.startLocationUpdate({ type: 'gcj02' })
        } else {
          await uni.startLocationUpdateBackground({ type: 'gcj02' })
        }

        console.log('定位服务已启动')
      } catch (e) {
        console.error('定位启动失败：', e)
        uni.showModal({
          title: '权限不足',
          content: '需要获取您的位置信息才能使用定位服务，请在设置中开启定位权限',
          showCancel: true,
          confirmText: '去设置',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) uni.openSetting()
          }
        })
      }
    },

    // 手动拉取当前位置
    handleGetLocation() {
      uni.showLoading({ title: '定位中...' })
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 4000,
        success: (res) => {
          const { latitude, longitude, accuracy, speed } = res
          this.longitude = longitude
          this.latitude = latitude
          this.accuracy = accuracy || null
          uni.showToast({ title: '定位成功', icon: 'success', duration: 2000 })
          console.log('定位信息：', { latitude, longitude, accuracy, speed })
        },
        fail: (err) => {
          uni.showToast({ title: '定位失败', icon: 'error', duration: 2000 })
          console.error('获取位置失败：', err)
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    // 地图错误兜底
    handleMapError(e) {
      console.log('地图错误', e.detail)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #667eea, #764ba2);
  position: relative;
}

.header {
  background: linear-gradient(to bottom right, #667eea, #764ba2);
  padding: 24px 32px 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-title {
  display: block;
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  display: block;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
}

.map-container {
  margin: 12px 20px;
  height: 650px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  position: relative;
  transition: all 0.3s;
}

.map {
  width: 100%;
  height: 100%;
}

.button-container {
  padding: 20px;
}

.button-wrapper {
  display: flex;
  justify-content: center;
}

.button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  background: linear-gradient(to bottom right, #667eea, #764ba2);
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s, box-shadow 0.1s;
}

.button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.button-icon {
  font-size: 32px;
}

.button-text {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}
</style>

