export const performLogin = async (): Promise<void> => {
  try {
    await uni.checkSession()
    const token = uni.getStorageSync('app_token')
    if (token) return
    // session 有效但本地无 token，继续走登录换取逻辑
  } catch (err) {
    console.warn('session 校验失败，准备重新登录', err)
  }

  try {
    const res = await uni.login()
    if (res.code) {
      // TODO: 将 code 发送到后端换取自己的业务 token
      uni.setStorageSync('login_code', res.code)
      uni.showToast({ title: '获取 code 成功', icon: 'success' })
    } else {
      uni.showToast({ title: '未获取到 code', icon: 'none' })
    }
  } catch (err) {
    console.error('登录失败：', err)
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}

