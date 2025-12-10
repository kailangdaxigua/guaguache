import { buildAuthHeaders, getPublicAvatarUrl, getSupabaseConfig } from './supabase'

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


