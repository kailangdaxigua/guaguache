import { supabase } from '@/utils/constants'

/**
 * 统一的登录流程：
 * 1) 静默检查 session；
 * 2) 有效且本地有 supabase_token 则直接返回；
 * 3) 否则调用 uni.login 获取 code，占位存储，等待后端换 token。
 */
// 统一的登录流程（示例占位）：先检验 session，再获取 code
export const performLogin = async (): Promise<void> => {
  try {
    await uni.checkSession()
    const token = uni.getStorageSync('supabase_token')
    if (token) {
      uni.showToast({ title: '已登录，可直接使用', icon: 'success' })
      return
    }
    // 已有 session 但本地无 token，仍尝试重新登录
  } catch (err) {
    console.warn('session 校验失败，准备重新登录', err)
  }

  try {
    const res = await uni.login()
    if (res.code) {
      // TODO: 将 code 发送到后端换取 Supabase token，当前先占位存储
      uni.setStorageSync('login_code', res.code)
      uni.showToast({ title: '登录成功（占位）', icon: 'success' })
    } else {
      uni.showToast({ title: '未获取到 code', icon: 'none' })
    }
  } catch (err) {
    console.error('登录失败：', err)
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}

