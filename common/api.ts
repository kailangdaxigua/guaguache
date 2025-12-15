import { buildAuthHeaders, getPublicAvatarUrl, getSupabaseConfig } from './supabase'

// Supabase Edge Function URL（微信登录）
const FUNCTION_URL =
  'https://xllwbrwwfdfnmioiqeez.supabase.co/functions/v1/wechat-login'

// Supabase Anon Key（公开密钥，用于 Edge Function 公开访问）
// 优先从环境变量获取，如果没有则使用硬编码的值
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const performLogin = async (): Promise<void> => {
  try {
    await uni.checkSession()
    const token = uni.getStorageSync('supabase_token')
    // 验证已存储的 token 是否有效
    if (token && typeof token === 'string' && token.indexOf('.') !== -1 && token.split('.').length === 3) {
      console.log('✅ 已有有效的登录 token，跳过登录')
      return
    } else if (token) {
      console.warn('⚠️ 存储的 token 格式无效，将重新登录')
      console.warn('当前 token 值:', token)
      // 清除无效的 token
      uni.removeStorageSync('supabase_token')
      uni.removeStorageSync('user_id')
    }
    // session 有效但本地无 token 或 token 无效，继续走登录换取逻辑
  } catch (err) {
    console.warn('session 校验失败，准备重新登录', err)
  }

  try {
    const loginRes = await uni.login()

    if (loginRes.errMsg !== 'login:ok') {
      throw new Error(loginRes.errMsg)
    }

    if (loginRes.code) {
      // 将 code 发送到 Supabase Edge Function 换取业务 token
      // 【关键修复】：wechat-login 是公开函数，需要传递 Anon Key 作为 apikey 头部
      // 这是 Supabase Edge Functions 公开访问的最佳实践，可以绕过不必要的 Authorization 检查
      // ❌ 不要添加 Authorization 头部（即使 token 存在）
      const { data, statusCode } = (await uni.request({
        url: FUNCTION_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          // 【关键修复】：显式传递 Anon Key 作为 apikey 头部
          apikey: SUPABASE_ANON_KEY,
          // ✅ 确保没有 Authorization 头部！
          // 如果你的 uni.request 封装函数会自动添加，你需要强制覆盖或禁用它。
        },
        data: { code: loginRes.code },
        timeout: 10000,
      })) as any

      if (statusCode !== 200 || !data || typeof data !== 'object') {
        console.error('Edge Function 返回异常')
        console.error('状态码:', statusCode)
        console.error('响应数据:', data)
        uni.showToast({ title: '登录失败', icon: 'none' })
        throw new Error('登录请求失败')
      }

      if (statusCode === 200 && data && typeof data === 'object') {
        const token = (data as any).token
        const userId = (data as any).user_id
        
        console.log('=== 登录响应调试信息 ===')
        console.log('响应状态码:', statusCode)
        console.log('响应数据:', data)
        console.log('Token 值:', token)
        console.log('User ID:', userId)
        
        // 验证 token 格式（JWT token 应该包含两个点号）
        if (token && typeof token === 'string' && token.indexOf('.') !== -1 && token.split('.').length === 3) {
          if (token) uni.setStorageSync('supabase_token', token)
          if (userId) uni.setStorageSync('user_id', userId)
          console.log('✅ Token 格式验证通过，已保存')
          console.log('Token 长度:', token.length)
          console.log('========================')
          uni.showToast({ title: '登录成功', icon: 'success' })
        } else {
          console.error('❌ Token 格式无效！')
          console.error('Token 值:', token)
          console.error('Token 类型:', typeof token)
          console.error('Token 是否包含点号:', token?.indexOf('.') !== -1)
          if (token) {
            console.error('Token 分段数量:', token.split('.').length)
          }
          console.error('========================')
          uni.showToast({ title: '登录失败：Token 格式错误', icon: 'none' })
          throw new Error('登录返回的 Token 格式无效')
        }
      } else {
        console.error('Edge Function 返回异常')
        console.error('状态码:', statusCode)
        console.error('响应数据:', data)
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

const AVATAR_BUCKET = 'avatars'

export const uploadAvatar = async (filePath: string): Promise<string> => {
  try {
    const config = getSupabaseConfig()
    
    // 调试：检查 Token 值
    const token = uni.getStorageSync('supabase_token')
    console.log('=== uploadAvatar 调试信息 ===')
    console.log('Stored Token:', token)
    console.log('Token 长度:', token?.length || 0)
    console.log('Token 是否包含点号:', token?.indexOf('.') !== -1)
    console.log('User ID:', config.userId)
    console.log('Supabase URL:', config.url)
    console.log('文件路径:', filePath)
    
    if (!token || token.indexOf('.') === -1) {
      console.error('❌ Token is invalid or missing!')
      console.error('Token 值:', token)
      throw new Error('Token 无效或缺失，请重新登录')
    }
    
    console.log('✅ Token 格式验证通过')
    console.log('========================')
    
    const uploadUrl = `${config.url}/storage/v1/object/${AVATAR_BUCKET}/${config.userId}.jpg`

    const uploadRes: any = await uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      header: {
        ...buildAuthHeaders(config),
        'x-upsert': 'true'
      }
    })

    const status = uploadRes?.statusCode ?? 500
    if (status >= 200 && status < 300) {
      return getPublicAvatarUrl(config)
    }

    // 详细错误信息
    const errorMsg = typeof uploadRes?.data === 'string' 
      ? uploadRes.data 
      : (uploadRes?.data ? JSON.stringify(uploadRes.data) : `HTTP ${status}`)
    console.error('上传头像失败，状态码:', status, '响应:', uploadRes?.data)
    throw new Error(`上传头像失败 (${status}): ${errorMsg}`)
  } catch (error: any) {
    // 如果是配置错误，直接抛出
    if (error.message?.includes('缺少') || error.message?.includes('未获取到登录态')) {
      throw error
    }
    // 其他错误包装后抛出
    throw new Error(`上传头像失败: ${error.message || error}`)
  }
}

export const updateProfile = async (payload: {
  nickname?: string
  avatar_url?: string
}): Promise<void> => {
  try {
    const config = getSupabaseConfig()
    
    // 调试：检查 Token 值
    const token = uni.getStorageSync('supabase_token')
    console.log('=== updateProfile 调试信息 ===')
    console.log('Stored Token:', token)
    console.log('Token 长度:', token?.length || 0)
    console.log('Token 是否包含点号:', token?.indexOf('.') !== -1)
    console.log('User ID:', config.userId)
    console.log('Supabase URL:', config.url)
    console.log('请求 Payload:', payload)
    
    if (!token || token.indexOf('.') === -1) {
      console.error('❌ Token is invalid or missing!')
      console.error('Token 值:', token)
      throw new Error('Token 无效或缺失，请重新登录')
    }
    
    console.log('✅ Token 格式验证通过')
    console.log('========================')
    
    const requestUrl = `${config.url}/rest/v1/profiles?id=eq.${config.userId}`
    const requestHeaders = {
      ...buildAuthHeaders(config),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    }
    
    console.log('请求 URL:', requestUrl)
    console.log('请求 Headers:', { ...requestHeaders, Authorization: 'Bearer ***' }) // 隐藏完整 token
    
    const { statusCode, data } = (await uni.request({
      url: requestUrl,
      method: 'PATCH',
      header: requestHeaders,
      data: payload
    })) as any

    console.log('响应状态码:', statusCode)
    console.log('响应数据:', data)

    if (statusCode && statusCode >= 200 && statusCode < 300) {
      console.log('✅ 更新资料成功:', payload)
      return
    }

    // 详细错误信息
    const errorMsg = typeof data === 'string' 
      ? data 
      : (data ? JSON.stringify(data) : `HTTP ${statusCode || 'unknown'}`)
    console.error('更新资料失败，状态码:', statusCode, '响应:', data)
    throw new Error(`更新资料失败 (${statusCode || 'unknown'}): ${errorMsg}`)
  } catch (error: any) {
    // 如果是配置错误，直接抛出
    if (error.message?.includes('缺少') || error.message?.includes('未获取到登录态')) {
      throw error
    }
    // 其他错误包装后抛出
    throw new Error(`更新资料失败: ${error.message || error}`)
  }
}


