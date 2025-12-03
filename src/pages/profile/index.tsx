import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Profile() {
  // 获取用户信息
  const handleGetUserInfo = () => {
    Taro.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('用户信息：', res.userInfo)
        Taro.showToast({
          title: '获取成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败：', err)
        Taro.showToast({
          title: '获取失败',
          icon: 'none'
        })
      }
    })
  }

  return (
    <View className='profile'>
      <View className='header'>
        <View className='avatar-container'>
          <View className='avatar'>
            <Text className='avatar-text'>我</Text>
          </View>
        </View>
        <Text className='username'>用户昵称</Text>
        <Text className='user-desc'>呱呱车用户</Text>
      </View>

      <View className='menu-list'>
        <View className='menu-item' onClick={handleGetUserInfo}>
          <Text className='menu-icon'>👤</Text>
          <Text className='menu-text'>个人信息</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        
        <View className='menu-item'>
          <Text className='menu-icon'>⚙️</Text>
          <Text className='menu-text'>设置</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        
        <View className='menu-item'>
          <Text className='menu-icon'>📝</Text>
          <Text className='menu-text'>我的订单</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        
        <View className='menu-item'>
          <Text className='menu-icon'>💬</Text>
          <Text className='menu-text'>意见反馈</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        
        <View className='menu-item'>
          <Text className='menu-icon'>ℹ️</Text>
          <Text className='menu-text'>关于我们</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
      </View>
    </View>
  )
}
