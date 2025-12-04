import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

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
    <View className='min-h-screen bg-gray-100'>
      <View className='bg-gradient-to-br from-sky-500 to-sky-700 px-10 pt-16 pb-10 flex flex-col items-center text-white'>
        <View className='mb-3'>
          <View className='w-24 h-24 rounded-full bg-white/30 flex items-center justify-center border-4 border-white/50'>
            <Text className='text-4xl font-bold text-white'>我</Text>
          </View>
        </View>
        <Text className='text-2xl font-bold mb-1'>用户昵称</Text>
        <Text className='text-sm opacity-90'>呱呱车用户</Text>
      </View>

      <View className='mt-5 bg-white'>
        <View
          className='flex items-center px-5 py-3 border-b border-gray-100 active:bg-gray-100 transition'
          onClick={handleGetUserInfo}
        >
          <Text className='text-2xl mr-3 w-8 text-center'>👤</Text>
          <Text className='flex-1 text-lg text-gray-800'>个人信息</Text>
          <Text className='text-xl text-gray-400'>›</Text>
        </View>

        <View className='flex items-center px-5 py-3 border-b border-gray-100 active:bg-gray-100 transition'>
          <Text className='text-2xl mr-3 w-8 text-center'>⚙️</Text>
          <Text className='flex-1 text-lg text-gray-800'>设置</Text>
          <Text className='text-xl text-gray-400'>›</Text>
        </View>

        <View className='flex items-center px-5 py-3 border-b border-gray-100 active:bg-gray-100 transition'>
          <Text className='text-2xl mr-3 w-8 text-center'>📝</Text>
          <Text className='flex-1 text-lg text-gray-800'>我的订单</Text>
          <Text className='text-xl text-gray-400'>›</Text>
        </View>

        <View className='flex items-center px-5 py-3 border-b border-gray-100 active:bg-gray-100 transition'>
          <Text className='text-2xl mr-3 w-8 text-center'>💬</Text>
          <Text className='flex-1 text-lg text-gray-800'>意见反馈</Text>
          <Text className='text-xl text-gray-400'>›</Text>
        </View>

        <View className='flex items-center px-5 py-3 active:bg-gray-100 transition'>
          <Text className='text-2xl mr-3 w-8 text-center'>ℹ️</Text>
          <Text className='flex-1 text-lg text-gray-800'>关于我们</Text>
          <Text className='text-xl text-gray-400'>›</Text>
        </View>
      </View>
    </View>
  )
}
