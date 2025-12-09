// Supabase Edge Function URL（微信登录）
const FUNCTION_URL =
  'https://xllwbrwwfdfnmioiqeez.supabase.co/functions/v1/wechat-login'

export const performLogin = async (): Promise<void> => {
  try {
    await uni.checkSession()
    const token = uni.getStorageSync('supabase_token')
    if (token) return
    // session 有效但本地无 token，继续走登录换取逻辑
  } catch (err) {
    console.warn('session 校验失败，准备重新登录', err)
  }

  try {
    const res = await uni.login()
    if (res.code) {
      // 将 code 发送到 Supabase Edge Function 换取业务 token
      const { data, statusCode } = await uni.request({
        url: FUNCTION_URL,
        method: 'POST',
        data: { code: res.code },
        timeout: 10000,
      })

      if (statusCode === 200 && data && typeof data === 'object') {
        const token = (data as any).token
        const userId = (data as any).user_id
        if (token) uni.setStorageSync('supabase_token', token)
        if (userId) uni.setStorageSync('user_id', userId)
        uni.showToast({ title: '登录成功', icon: 'success' })
      } else {
        console.error('Edge Function 返回异常', data)
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    } else {
      uni.showToast({ title: '未获取到 code', icon: 'none' })
    }
  } catch (err) {
    console.error('登录失败：', err)
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}

