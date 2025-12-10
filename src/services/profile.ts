import { buildAuthHeaders, getPublicAvatarUrl, getSupabaseConfig } from './supabase'

const AVATAR_BUCKET = 'avatars'

export const uploadAvatar = async (filePath: string): Promise<string> => {
  try {
    const config = getSupabaseConfig()
    const uploadUrl = `${config.url}/storage/v1/object/${AVATAR_BUCKET}/${config.userId}.jpg`

    const [err, res] = await uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      header: {
        ...buildAuthHeaders(config),
        'x-upsert': 'true'
      }
    })

    if (err) {
      console.error('上传头像错误:', err)
      throw new Error(`上传失败: ${err.errMsg || JSON.stringify(err)}`)
    }

    const status = res?.statusCode ?? 500
    if (status >= 200 && status < 300) {
      return getPublicAvatarUrl(config)
    }

    // 详细错误信息
    const errorMsg = typeof res.data === 'string' 
      ? res.data 
      : (res.data ? JSON.stringify(res.data) : `HTTP ${status}`)
    console.error('上传头像失败，状态码:', status, '响应:', res.data)
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
    const { statusCode, data } = await uni.request({
      url: `${config.url}/rest/v1/profiles?id=eq.${config.userId}`,
      method: 'PATCH',
      header: {
        ...buildAuthHeaders(config),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      data: payload
    })

    if (statusCode && statusCode >= 200 && statusCode < 300) {
      console.log('更新资料成功:', payload)
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


