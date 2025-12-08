import Taro from '@tarojs/taro'

/**
 * 统一的登录流程：
 * 1) 静默检查 session；
 * 2) 有效且本地有 supabase_token 则直接返回；
 * 3) 否则调用 Taro.login 获取 code，占位存储，等待后端换 token。
 */
export const performLogin = async () => {
  try {
    await Taro.checkSession()
    const token = Taro.getStorageSync<string>('supabase_token')
    if (token) {
      Taro.showToast({ title: '已登录，可直接使用', icon: 'success' })
      return
    }
    // 已有 session 但本地无 token，仍尝试重新登录
  } catch (err) {
    console.warn('session 校验失败，准备重新登录', err)
  }

  try {
    const { code } = await Taro.login()
    if (code) {
      // TODO: 将 code 发送到后端换取 Supabase token，当前先占位存储
      Taro.setStorageSync('login_code', code)
      Taro.showToast({ title: '登录成功（占位）', icon: 'success' })
    } else {
      Taro.showToast({ title: '未获取到 code', icon: 'none' })
    }
  } catch (err) {
    console.error('登录失败：', err)
    Taro.showToast({ title: '登录失败', icon: 'none' })
  }
}

